using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Interfaces;
using BankingCurrentAffairs.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace BankingCurrentAffairs.Infrastructure.Services;

public class AiAnalysisService : IAiAnalysisService
{
    private readonly HttpClient _httpClient;
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AiAnalysisService> _logger;

    public AiAnalysisService(
        HttpClient httpClient,
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AiAnalysisService> logger)
    {
        _httpClient = httpClient;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<List<GeneratedQuestionResult>> AnalyzeAndGenerateForMonthAsync(string monthYear, CancellationToken cancellationToken = default)
    {
        // Parse year and month
        if (!TryParseMonthYear(monthYear, out var year, out var month))
        {
            year = DateTime.UtcNow.Year;
            month = DateTime.UtcNow.Month;
            monthYear = $"{year:D4}-{month:D2}";
        }

        // Fetch current affairs items for this month
        var startDate = new DateOnly(year, month, 1);
        var endDate = startDate.AddMonths(1).AddDays(-1);

        var monthItems = await _context.CurrentAffairItems
            .Include(i => i.Category)
            .Include(i => i.Digest)
            .Where(i => i.Digest != null && i.Digest.DigestDate >= startDate && i.Digest.DigestDate <= endDate)
            .OrderBy(i => i.Importance)
            .Take(15)
            .ToListAsync(cancellationToken);

        var apiKey = _configuration["AiSettings:ApiKey"];
        var provider = _configuration["AiSettings:Provider"] ?? "Gemini";

        if (!string.IsNullOrWhiteSpace(apiKey) && apiKey != "YOUR_GEMINI_OR_OPENAI_API_KEY")
        {
            try
            {
                if (provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
                {
                    return await CallOpenAiForMonthAsync(apiKey, monthYear, monthItems, cancellationToken);
                }
                else
                {
                    return await CallGeminiForMonthAsync(apiKey, monthYear, monthItems, cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "LLM call failed for month {MonthYear}. Using curated fallback exam questions.", monthYear);
            }
        }

        return GetCuratedMonthQuestions(monthYear, monthItems);
    }

    private async Task<List<GeneratedQuestionResult>> CallGeminiForMonthAsync(
        string apiKey,
        string monthYear,
        List<CurrentAffairItem> items,
        CancellationToken cancellationToken)
    {
        var model = _configuration["AiSettings:Model"] ?? "gemini-1.5-flash";
        var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

        var prompt = BuildPrompt(monthYear, items);

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                response_mime_type = "application/json",
                temperature = 0.3
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(endpoint, content, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(responseJson);
        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return ParseQuestionsResult(text, monthYear, items);
    }

    private async Task<List<GeneratedQuestionResult>> CallOpenAiForMonthAsync(
        string apiKey,
        string monthYear,
        List<CurrentAffairItem> items,
        CancellationToken cancellationToken)
    {
        var model = _configuration["AiSettings:Model"] ?? "gpt-4o-mini";
        var endpoint = "https://api.openai.com/v1/chat/completions";

        var prompt = BuildPrompt(monthYear, items);

        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var requestBody = new
        {
            model = model,
            messages = new[]
            {
                new { role = "system", content = "You are a Chief Question Paper Setter and Senior Economist for IBPS, SBI PO, and RBI Grade B examinations. Output strictly valid JSON conforming to the requested schema." },
                new { role = "user", content = prompt }
            },
            response_format = new { type = "json_object" },
            temperature = 0.3
        };

        request.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(responseJson);
        var text = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return ParseQuestionsResult(text, monthYear, items);
    }

    private static string BuildPrompt(string monthYear, List<CurrentAffairItem> items)
    {
        var itemsSummary = new StringBuilder();
        foreach (var item in items)
        {
            itemsSummary.AppendLine($"- [{item.Category?.NameEn ?? "Banking"}] {item.TitleEn}: {item.SummaryEn} Takeaway: {item.BankingTakeawayEn}");
        }

        return $@"
Analyze the following accumulated banking current affairs for the month of {monthYear} and generate 4 to 6 EXAM-GRADE Expected Questions (mimicking SBI PO Mains, IBPS PO Mains, and RBI Grade B patterns).

Monthly Context Data:
{itemsSummary}

REQUIREMENTS:
1. Structure questions to include both 5-option Standard MCQs (options A to E) and IBPS PO / RBI Grade B Statement-Based questions (e.g. 'Consider the following statements... Which of the statements given above is/are correct?').
2. Provide dual language (English and Hindi) for:
   - Question text
   - All 5 options: A, B, C, D, E
   - Comprehensive explanation
   - Deep background analysis explaining the economic rationale and statutory relevance
   - Static banking concept linkage (e.g., Section 42 of RBI Act, SARFAESI Act, Basel III)
   - 'Examiner Trap Warning': Specific tricky misconception students often fall for
3. Response must be strictly a JSON object with this format:
{{
  ""questions"": [
    {{
      ""questionType"": ""StatementBased"", // or ""StandardMCQ""
      ""difficultyLevel"": ""ExamLevel"", // Moderate, ExamLevel, HardPhase2
      ""targetExam"": ""SBI PO / RBI Grade B"",
      ""categorySlug"": ""rbi-monetary-policy"",
      ""questionEn"": ""Consider the following statements regarding...\\n1. Statement one...\\n2. Statement two...\\nWhich of the statements given above is/are correct?"",
      ""questionHi"": ""निम्नलिखित कथनों पर विचार कीजिए...\\n1. पहला कथन...\\n2. दूसरा कथन...\\nउपर्युक्त कथनों में से कौन-सा/से सही है/हैं?"",
      ""optionsEn"": [
        ""A) 1 only"",
        ""B) 2 only"",
        ""C) Both 1 and 2"",
        ""D) Neither 1 nor 2"",
        ""E) 1, 2 and 3""
      ],
      ""optionsHi"": [
        ""A) केवल 1"",
        ""B) केवल 2"",
        ""C) 1 और 2 दोनों"",
        ""D) न तो 1 और न ही 2"",
        ""E) 1, 2 और 3""
      ],
      ""correctAnswer"": ""C"",
      ""explanationEn"": ""Detailed answer rationale in English..."",
      ""explanationHi"": ""विस्तृत व्याख्या हिंदी में..."",
      ""deepAnalysisEn"": ""Deep analysis linking this to financial stability, liquidity ratios, and regulatory objectives..."",
      ""deepAnalysisHi"": ""गहन पृष्ठभूमि विश्लेषण..."",
      ""staticConceptLinkEn"": ""Linked to Section 45ZB of RBI Act 1934 and Monetary Policy Framework Agreement."",
      ""staticConceptLinkHi"": ""आरबीआई अधिनियम 1934 की धारा 45ZB और मौद्रिक नीति ढांचे से संबंधित।"",
      ""examinerTrapWarningEn"": ""A common trap in exams is confusing SDF rate with MSF rate."",
      ""examinerTrapWarningHi"": ""परीक्षा में अक्सर परीक्षार्थी एसडीएफ दर को एमएसएफ दर के साथ भ्रमित कर देते हैं।""
    }}
  ]
}}
";
    }

    private List<GeneratedQuestionResult> ParseQuestionsResult(string? json, string monthYear, List<CurrentAffairItem> items)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return GetCuratedMonthQuestions(monthYear, items);
        }

        try
        {
            using var doc = JsonDocument.Parse(json);
            JsonElement questionsArray;

            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                questionsArray = doc.RootElement;
            }
            else if (doc.RootElement.TryGetProperty("questions", out var prop))
            {
                questionsArray = prop;
            }
            else
            {
                return GetCuratedMonthQuestions(monthYear, items);
            }

            var list = new List<GeneratedQuestionResult>();
            foreach (var elem in questionsArray.EnumerateArray())
            {
                var q = new GeneratedQuestionResult
                {
                    QuestionType = elem.TryGetProperty("questionType", out var qt) ? qt.GetString() ?? "StandardMCQ" : "StandardMCQ",
                    DifficultyLevel = elem.TryGetProperty("difficultyLevel", out var dl) ? dl.GetString() ?? "ExamLevel" : "ExamLevel",
                    TargetExam = elem.TryGetProperty("targetExam", out var te) ? te.GetString() ?? "SBI PO" : "SBI PO",
                    CategorySlug = elem.TryGetProperty("categorySlug", out var cs) ? cs.GetString() ?? "banking-finance" : "banking-finance",
                    QuestionEn = elem.GetProperty("questionEn").GetString() ?? string.Empty,
                    QuestionHi = elem.GetProperty("questionHi").GetString() ?? string.Empty,
                    CorrectAnswer = elem.GetProperty("correctAnswer").GetString() ?? "A",
                    ExplanationEn = elem.GetProperty("explanationEn").GetString() ?? string.Empty,
                    ExplanationHi = elem.GetProperty("explanationHi").GetString() ?? string.Empty,
                    DeepAnalysisEn = elem.TryGetProperty("deepAnalysisEn", out var dae) ? dae.GetString() ?? string.Empty : string.Empty,
                    DeepAnalysisHi = elem.TryGetProperty("deepAnalysisHi", out var dah) ? dah.GetString() ?? string.Empty : string.Empty,
                    StaticConceptLinkEn = elem.TryGetProperty("staticConceptLinkEn", out var sce) ? sce.GetString() ?? string.Empty : string.Empty,
                    StaticConceptLinkHi = elem.TryGetProperty("staticConceptLinkHi", out var sch) ? sch.GetString() ?? string.Empty : string.Empty,
                    ExaminerTrapWarningEn = elem.TryGetProperty("examinerTrapWarningEn", out var ete) ? ete.GetString() ?? string.Empty : string.Empty,
                    ExaminerTrapWarningHi = elem.TryGetProperty("examinerTrapWarningHi", out var eth) ? eth.GetString() ?? string.Empty : string.Empty,
                    OptionsEn = new List<string>(),
                    OptionsHi = new List<string>()
                };

                if (elem.TryGetProperty("optionsEn", out var oe) && oe.ValueKind == JsonValueKind.Array)
                {
                    foreach (var o in oe.EnumerateArray()) q.OptionsEn.Add(o.GetString() ?? "");
                }
                if (elem.TryGetProperty("optionsHi", out var oh) && oh.ValueKind == JsonValueKind.Array)
                {
                    foreach (var o in oh.EnumerateArray()) q.OptionsHi.Add(o.GetString() ?? "");
                }

                list.Add(q);
            }

            return list.Count > 0 ? list : GetCuratedMonthQuestions(monthYear, items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse AI question generation output");
            return GetCuratedMonthQuestions(monthYear, items);
        }
    }

    /// <summary>
    /// Fallback high-yield exam questions tailored specifically for banking exam preparation
    /// </summary>
    public static List<GeneratedQuestionResult> GetCuratedMonthQuestions(string monthYear, List<CurrentAffairItem>? items = null)
    {
        return new List<GeneratedQuestionResult>
        {
            new()
            {
                QuestionType = "StatementBased",
                DifficultyLevel = "ExamLevel",
                TargetExam = "SBI PO / RBI Grade B",
                CategorySlug = "rbi-monetary-policy",
                QuestionEn = "With reference to the Reserve Bank of India's (RBI) revised guidelines on Key Fact Statement (KFS) for loans, consider the following statements:\n" +
                             "1. All Regulated Entities (REs) must issue KFS to all retail and MSME term loan borrowers.\n" +
                             "2. The calculation of Annual Percentage Rate (APR) includes all charges like processing fees and third-party insurance fees.\n" +
                             "3. Credit card receivables are fully included within the scope of this mandatory KFS circular.\n\n" +
                             "Which of the statements given above is/are correct?",
                QuestionHi = "ऋणों के लिए मुख्य तथ्य विवरण (KFS) पर भारतीय रिजर्व बैंक (RBI) के संशोधित दिशानिर्देशों के संदर्भ में, निम्नलिखित कथनों पर विचार कीजिए:\n" +
                             "1. सभी विनियमित संस्थाओं (REs) को सभी खुदरा और MSME सावधि ऋण उधारकर्ताओं को KFS जारी करना अनिवार्य है।\n" +
                             "2. वार्षिक प्रतिशत दर (APR) की गणना में प्रसंस्करण शुल्क और तृतीय-पक्ष बीमा शुल्क जैसे सभी शुल्क शामिल हैं।\n" +
                             "3. क्रेडिट कार्ड प्राप्य को इस अनिवार्य KFS परिपत्र के दायरे में पूरी तरह शामिल किया गया है।\n\n" +
                             "उपर्युक्त कथनों में से कौन-सा/से सही है/हैं?",
                OptionsEn = new List<string>
                {
                    "A) 1 and 2 only",
                    "B) 2 and 3 only",
                    "C) 1 and 3 only",
                    "D) 1, 2 and 3",
                    "E) 1 only"
                },
                OptionsHi = new List<string>
                {
                    "A) केवल 1 और 2",
                    "B) केवल 2 और 3",
                    "C) केवल 1 और 3",
                    "D) 1, 2 और 3 सभी",
                    "E) केवल 1"
                },
                CorrectAnswer = "A",
                ExplanationEn = "Statements 1 and 2 are correct. Statement 3 is INCORRECT: Credit card receivables have been explicitly exempted from the provisions of this specific circular. KFS mandates transparency by disclosing the all-inclusive Annual Percentage Rate (APR), ensuring no hidden or undisclosed charges can be levied on borrowers.",
                ExplanationHi = "कथन 1 और 2 सही हैं। कथन 3 गलत है: क्रेडिट कार्ड प्राप्य को इस विशिष्ट परिपत्र के प्रावधानों से स्पष्ट रूप से छूट दी गई है। KFS सभी समावेशी वार्षिक प्रतिशत दर (APR) का खुलासा करके पारदर्शिता सुनिश्चित करता है ताकि उधारकर्ताओं पर कोई गुप्त शुल्क न लगाया जा सके।",
                DeepAnalysisEn = "The KFS mandate represents a major consumer protection shift by the RBI aimed at curbing opaque digital lending practices. By standardizing APR disclosures across Scheduled Commercial Banks and NBFCs, RBI reinforces the Fair Practices Code (FPC) established under Section 35A of the Banking Regulation Act, 1949.",
                DeepAnalysisHi = "KFS अधिदेश अपारदर्शी डिजिटल ऋण प्रथाओं पर अंकुश लगाने के उद्देश्य से आरबीआई द्वारा एक बड़ा उपभोक्ता संरक्षण सुधार है। बीआर अधिनियम 1949 की धारा 35A के तहत स्थापित निष्पक्ष आचरण संहिता (FPC) को मजबूत किया गया है।",
                StaticConceptLinkEn = "Banking Regulation Act 1949 (Section 35A - Power of RBI to give directions), Fair Practices Code (FPC), and Digital Lending Guidelines 2022.",
                StaticConceptLinkHi = "बैंकिंग विनियमन अधिनियम 1949 (धारा 35A - आरबीआई के निर्देश देने के अधिकार), फेयर प्रैक्टिसेज कोड और डिजिटल लेंडिंग गाइडलाइंस 2022।",
                ExaminerTrapWarningEn = "Trap Alert: Exam setters deliberately test exemptions. Candidates assume credit cards are covered under retail loans; remember credit card receivables are EXEMPTED from this KFS circular.",
                ExaminerTrapWarningHi = "सावधानी: परीक्षक अक्सर अपवादों का परीक्षण करते हैं। अभ्यर्थी मानते हैं कि क्रेडिट कार्ड खुदरा ऋण में शामिल हैं; याद रखें कि क्रेडिट कार्ड प्राप्य को इस KFS परिपत्र से छूट दी गई है।"
            },
            new()
            {
                QuestionType = "StandardMCQ",
                DifficultyLevel = "Moderate",
                TargetExam = "IBPS PO / Clerk / SO",
                CategorySlug = "schemes-inclusion",
                QuestionEn = "Under the Pradhan Mantri Jan Dhan Yojana (PMJDY), what is the maximum Overdraft (OD) facility limit permitted per eligible household, and what is the accidental insurance cover provided on RuPay debit cards for accounts opened after August 28, 2018?",
                QuestionHi = "प्रधानमंत्री जन धन योजना (PMJDY) के तहत प्रति पात्र परिवार अधिकतम कितनी ओवरड्राफ्ट (OD) सुविधा की अनुमति है, और 28 अगस्त 2018 के बाद खोले गए खातों के लिए रुपे डेबिट कार्ड पर कितना दुर्घटना बीमा कवर प्रदान किया जाता है?",
                OptionsEn = new List<string>
                {
                    "A) Overdraft: ₹5,000; RuPay Insurance: ₹1 Lakh",
                    "B) Overdraft: ₹10,000; RuPay Insurance: ₹2 Lakh",
                    "C) Overdraft: ₹10,000; RuPay Insurance: ₹5 Lakh",
                    "D) Overdraft: ₹15,000; RuPay Insurance: ₹2 Lakh",
                    "E) Overdraft: ₹20,000; RuPay Insurance: ₹1 Lakh"
                },
                OptionsHi = new List<string>
                {
                    "A) ओवरड्राफ्ट: ₹5,000; रुपे बीमा: ₹1 लाख",
                    "B) ओवरड्राफ्ट: ₹10,000; रुपे बीमा: ₹2 लाख",
                    "C) ओवरड्राफ्ट: ₹10,000; रुपे बीमा: ₹5 लाख",
                    "D) ओवरड्राफ्ट: ₹15,000; रुपे बीमा: ₹2 लाख",
                    "E) ओवरड्राफ्ट: ₹20,000; रुपे बीमा: ₹1 लाख"
                },
                CorrectAnswer = "B",
                ExplanationEn = "Correct Answer is B. The Overdraft limit was doubled from ₹5,000 to ₹10,000 (with no conditions up to ₹2,000). The accidental insurance coverage on RuPay Debit Cards for PMJDY accounts opened after 28.08.2018 was enhanced from ₹1 Lakh to ₹2 Lakh. Age limit for OD is 18-65 years.",
                ExplanationHi = "सही उत्तर B है। ओवरड्राफ्ट सीमा को ₹5,000 से बढ़ाकर ₹10,000 कर दिया गया था (₹2,000 तक बिना शर्त)। 28.08.2018 के बाद खोले गए पीएमजेडीवाई खातों के लिए रुपे डेबिट कार्ड पर दुर्घटना बीमा कवर ₹1 लाख से बढ़ाकर ₹2 लाख कर दिया गया था।",
                DeepAnalysisEn = "PMJDY forms the foundational pillar of the 'JAM Trinity' (Jan Dhan, Aadhaar, Mobile). Financial inclusion data is evaluated heavily in Banking interviews and Mains General Awareness, particularly regarding zero-balance account ratios, female empowerment (>55% women accounts), and Direct Benefit Transfer (DBT) leakage prevention.",
                DeepAnalysisHi = "PMJDY 'JAM ट्रिनिटी' (जन धन, आधार, मोबाइल) का आधार स्तंभ है। वित्तीय समावेशन के आंकड़े बैंकिंग मुख्य परीक्षा और साक्षात्कारों में अत्यधिक पूछे जाते हैं।",
                StaticConceptLinkEn = "Financial Inclusion Index (FI-Index) published annually by RBI (Quality, Access, Usage), National Strategy for Financial Inclusion (NSFI 2019-2024).",
                StaticConceptLinkHi = "आरबीआई द्वारा प्रतिवर्ष प्रकाशित वित्तीय समावेशन सूचकांक (FI-Index) (गुणवत्ता, पहुंच, उपयोग)।",
                ExaminerTrapWarningEn = "Trap Alert: Many questions test the initial numbers (₹5,000 and ₹1 Lakh) versus revised numbers (₹10,000 and ₹2 Lakh). Always verify the year/cutoff mentioned in the question.",
                ExaminerTrapWarningHi = "सावधानी: पुराने आंकड़ों (₹5,000 और ₹1 लाख) और संशोधित आंकड़ों (₹10,000 और ₹2 लाख) के बीच भ्रम से बचें।"
            },
            new()
            {
                QuestionType = "StatementBased",
                DifficultyLevel = "HardPhase2",
                TargetExam = "RBI Grade B / SBI PO",
                CategorySlug = "banking-finance",
                QuestionEn = "Consider the following statements regarding the Priority Sector Lending (PSL) guidelines prescribed by the Reserve Bank of India for Domestic Scheduled Commercial Banks:\n" +
                             "1. Total PSL target for Domestic Scheduled Commercial Banks is 40% of Adjusted Net Bank Credit (ANBC) or Credit Equivalent of Off-Balance Sheet Exposure (CEOBE), whichever is higher.\n" +
                             "2. The sub-target mandated for Agriculture lending is 18% of ANBC.\n" +
                             "3. Any shortfall in PSL target achievement by commercial banks is deposited into the Rural Infrastructure Development Fund (RIDF) managed by SIDBI.\n\n" +
                             "Which of the statements given above is/are correct?",
                QuestionHi = "घरेलू अनुसूचित वाणिज्यिक बैंकों के लिए भारतीय रिजर्व बैंक द्वारा निर्धारित प्राथमिकता प्राप्त क्षेत्र ऋण (PSL) दिशानिर्देशों के संबंध में निम्नलिखित कथनों पर विचार कीजिए:\n" +
                             "1. घरेलू अनुसूचित वाणिज्यिक बैंकों के लिए कुल PSL लक्ष्य समायोजित निवल बैंक ऋण (ANBC) या तुलन पत्र बाह्य जोखिम का ऋण समकक्ष (CEOBE), जो भी अधिक हो, का 40% है।\n" +
                             "2. कृषि ऋण के लिए अनिवार्य उप-लक्ष्य ANBC का 18% है।\n" +
                             "3. वाणिज्यिक बैंकों द्वारा PSL लक्ष्य उपलब्धि में किसी भी कमी को सिडबी (SIDBI) द्वारा प्रबंधित ग्रामीण बुनियादी ढांचा विकास निधि (RIDF) में जमा किया जाता है।\n\n" +
                             "उपर्युक्त कथनों में से कौन-सा/से सही है/हैं?",
                OptionsEn = new List<string>
                {
                    "A) 1 and 2 only",
                    "B) 2 and 3 only",
                    "C) 1 and 3 only",
                    "D) 1, 2 and 3",
                    "E) 1 only"
                },
                OptionsHi = new List<string>
                {
                    "A) केवल 1 और 2",
                    "B) केवल 2 और 3",
                    "C) केवल 1 और 3",
                    "D) 1, 2 और 3 सभी",
                    "E) केवल 1"
                },
                CorrectAnswer = "A",
                ExplanationEn = "Statements 1 and 2 are correct. Statement 3 is INCORRECT: RIDF (Rural Infrastructure Development Fund) is set up with and managed by NABARD, NOT SIDBI! Shortfall in PSL is allocated to RIDF and other funds maintained with NABARD, NHB, SIDBI, and MUDRA Ltd as decided by RBI from time to time.",
                ExplanationHi = "कथन 1 और 2 सही हैं। कथन 3 गलत है: आरआईडीएफ (ग्रामीण बुनियादी ढांचा विकास निधि) की स्थापना नाबार्ड (NABARD) में की गई है और इसका प्रबंधन नाबार्ड द्वारा किया जाता है, सिडबी द्वारा नहीं! पीएसएल में कमी को नाबार्ड में आरआईडीएफ में जमा किया जाता है।",
                DeepAnalysisEn = "PSL norms ensure credit flow to vulnerable sectors of the economy. For RBI Grade B and SBI PO, candidates must know the sub-targets: Total PSL 40%, Agriculture 18% (with 10% for Small & Marginal Farmers), Micro Enterprises 7.5%, and Weaker Sections 12%. Primary (Urban) Co-operative Banks (UCBs) have a phased target of 75% by March 2026.",
                DeepAnalysisHi = "पीएसएल मानदंड अर्थव्यवस्था के कमजोर क्षेत्रों में ऋण प्रवाह सुनिश्चित करते हैं। कुल पीएसएल 40%, कृषि 18% (छोटे और सीमांत किसानों के लिए 10%), सूक्ष्म उद्यम 7.5%, और कमजोर वर्ग 12%।",
                StaticConceptLinkEn = "NABARD Act 1981, Priority Sector Lending Certificates (PSLCs) traded on RBI's e-Kuber portal across 4 categories.",
                StaticConceptLinkHi = "नाबार्ड अधिनियम 1981, आरबीआई के ई-कुबेर पोर्टल पर 4 श्रेणियों में व्यापार किए जाने वाले प्राथमिकता क्षेत्र ऋण प्रमाण पत्र (PSLC)।",
                ExaminerTrapWarningEn = "Trap Alert: Examiners deliberately swap managing institutions between NABARD, SIDBI, and NHB for development funds like RIDF, UIDF, and MSME Refinance.",
                ExaminerTrapWarningHi = "सावधानी: परीक्षक अक्सर RIDF के लिए नाबार्ड की जगह SIDBI या NHB का विकल्प देकर भ्रमित करते हैं।"
            },
            new()
            {
                QuestionType = "StandardMCQ",
                DifficultyLevel = "ExamLevel",
                TargetExam = "SBI PO / IBPS PO",
                CategorySlug = "appointments",
                QuestionEn = "Which autonomous body is responsible for recommending individuals for appointment as whole-time directors and non-executive chairpersons on the boards of Public Sector Banks (PSBs), Public Sector Insurance Companies (PSICs), and Financial Institutions (FIs)?",
                QuestionHi = "सार्वजनिक क्षेत्र के बैंकों (PSBs), सार्वजनिक क्षेत्र की बीमा कंपनियों (PSICs) और वित्तीय संस्थानों (FIs) के बोर्डों पर पूर्णकालिक निदेशकों और गैर-कार्यकारी अध्यक्षों के रूप में नियुक्ति के लिए व्यक्तियों की सिफारिश करने के लिए कौन सा स्वायत्त निकाय जिम्मेदार है?",
                OptionsEn = new List<string>
                {
                    "A) Public Enterprises Selection Board (PESB)",
                    "B) Financial Services Institutions Bureau (FSIB)",
                    "C) Indian Banks' Association (IBA)",
                    "D) Appointments Committee of the Cabinet (ACC) Selection Cell",
                    "E) National Financial Reporting Authority (NFRA)"
                },
                OptionsHi = new List<string>
                {
                    "A) लोक उद्यम चयन बोर्ड (PESB)",
                    "B) वित्तीय सेवा संस्थान ब्यूरो (FSIB)",
                    "C) भारतीय बैंक संघ (IBA)",
                    "D) मंत्रिमंडल की नियुक्ति समिति (ACC) चयन प्रकोष्ठ",
                    "E) राष्ट्रीय वित्तीय रिपोर्टिंग प्राधिकरण (NFRA)"
                },
                CorrectAnswer = "B",
                ExplanationEn = "Correct Answer is B. The Financial Services Institutions Bureau (FSIB) was established in July 2022, superseding the erstwhile Banks Board Bureau (BBB). FSIB recommends top appointments for PSBs, public insurers, and development financial institutions. The final appointment approval is accorded by the Appointments Committee of the Cabinet (ACC) headed by the Prime Minister.",
                ExplanationHi = "सही उत्तर B है। वित्तीय सेवा संस्थान ब्यूरो (FSIB) की स्थापना जुलाई 2022 में पूर्ववर्ती बैंक बोर्ड ब्यूरो (BBB) के स्थान पर की गई थी। FSIB सार्वजनिक क्षेत्र के बैंकों और बीमा कंपनियों में शीर्ष नियुक्तियों की सिफारिश करता है।",
                DeepAnalysisEn = "FSIB was reconstituted after the Delhi High Court ruled that the former Banks Board Bureau (BBB) lacked the legal mandate to select general managers and directors of state-run general insurers. FSIB's mandate is broader, encompassing leadership development, performance evaluation, and corporate governance standards across state-owned financial institutions.",
                DeepAnalysisHi = "दिल्ली उच्च न्यायालय के एक फैसले के बाद FSIB का पुनर्गठन किया गया था। FSIB का दायरा व्यापक है, जिसमें नेतृत्व विकास, प्रदर्शन मूल्यांकन और कॉर्पोरेट प्रशासन शामिल हैं।",
                StaticConceptLinkEn = "P.J. Nayak Committee (2014) recommendations on Governance of Boards of Banks in India; Bank Nationalisation Acts 1970/1980.",
                StaticConceptLinkHi = "भारत में बैंकों के बोर्डों के शासन पर पी.जे. नायक समिति (2014) की सिफारिशें; बैंक राष्ट्रीयकरण अधिनियम 1970/1980।",
                ExaminerTrapWarningEn = "Trap Alert: Note the distinction: FSIB 'recommends' the candidate, but the ACC (Appointments Committee of the Cabinet) 'approves' and makes the formal appointment.",
                ExaminerTrapWarningHi = "सावधानी: अंतर ध्यान में रखें: FSIB उम्मीदवार की केवल 'सिफारिश' करता है, जबकि औपचारिक 'नियुक्ति' मंत्रिमंडल की नियुक्ति समिति (ACC) करती है।"
            }
        };
    }

    private static bool TryParseMonthYear(string monthYear, out int year, out int month)
    {
        year = 0;
        month = 0;
        if (string.IsNullOrWhiteSpace(monthYear)) return false;

        var parts = monthYear.Split('-');
        if (parts.Length == 2 && int.TryParse(parts[0], out year) && int.TryParse(parts[1], out month))
        {
            return month >= 1 && month <= 12;
        }
        return false;
    }
}
