using BankingCurrentAffairs.Core.Entities;
using BankingCurrentAffairs.Core.Enums;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BankingCurrentAffairs.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // 1. Seed Categories if empty
        if (!await context.Categories.AnyAsync())
        {
            var categories = new List<Category>
            {
                new()
                {
                    Id = 1,
                    NameEn = "Banking & Financial Awareness",
                    NameHi = "बैंकिंग और वित्तीय जागरूकता",
                    Slug = "banking-finance",
                    Icon = "landmark",
                    DisplayOrder = 1,
                    DescriptionEn = "Core banking products, credit policies, digital banking, NPAs, Basel III norms",
                    DescriptionHi = "कोर बैंकिंग उत्पाद, ऋण नीतियां, डिजिटल बैंकिंग, एनपीए, बेसल III मानदंड"
                },
                new()
                {
                    Id = 2,
                    NameEn = "RBI Circulars & Monetary Policy",
                    NameHi = "आरबीआई परिपत्र और मौद्रिक नीति",
                    Slug = "rbi-monetary-policy",
                    Icon = "building",
                    DisplayOrder = 2,
                    DescriptionEn = "RBI MPC decisions, policy repo rate, regulatory directives, PCA framework",
                    DescriptionHi = "आरबीआई एमपीसी निर्णय, नीति रेपो दर, नियामक निर्देश, पीसीए ढांचा"
                },
                new()
                {
                    Id = 3,
                    NameEn = "Economy & GDP Projections",
                    NameHi = "अर्थव्यवस्था और जीडीपी अनुमान",
                    Slug = "economy-gdp",
                    Icon = "trending-up",
                    DisplayOrder = 3,
                    DescriptionEn = "Inflation CPI/WPI, GDP growth forecasts by IMF, World Bank, ADB, MoSPI",
                    DescriptionHi = "मुद्रास्फीति सीपीआई/डब्ल्यूपीआई, आईएमएफ, विश्व बैंक, एडीबी द्वारा जीडीपी विकास पूर्वानुमान"
                },
                new()
                {
                    Id = 4,
                    NameEn = "Government Schemes & Financial Inclusion",
                    NameHi = "सरकारी योजनाएं और वित्तीय समावेशन",
                    Slug = "schemes-inclusion",
                    Icon = "shield-check",
                    DisplayOrder = 4,
                    DescriptionEn = "PMJDY, PMJJBY, PMSBY, APY, Mudra Yojana, Stand Up India, Kisan Credit Card",
                    DescriptionHi = "पीएमजेडीवाई, पीएमजेजेबीवाई, पीएमएसबीवाई, अटल पेंशन योजना, मुद्रा योजना, किसान क्रेडिट कार्ड"
                },
                new()
                {
                    Id = 5,
                    NameEn = "Appointments & Banking Leadership",
                    NameHi = "नियुक्तियां और बैंकिंग नेतृत्व",
                    Slug = "appointments",
                    Icon = "user-check",
                    DisplayOrder = 5,
                    DescriptionEn = "Governors/Deputy Governors of RBI, CMDs of Public Sector Banks, SEBI, IRDAI",
                    DescriptionHi = "आरबीआई के गवर्नर/डिप्टी गवर्नर, पीएसबी के सीएमडी, सेबी, आईआरडीएआई प्रमुख"
                },
                new()
                {
                    Id = 6,
                    NameEn = "MoUs, Mergers & Acquisitions",
                    NameHi = "समझौता ज्ञापन, विलय और अधिग्रहण",
                    Slug = "mous-mergers",
                    Icon = "handshake",
                    DisplayOrder = 6,
                    DescriptionEn = "Inter-bank tie-ups, fintech collaborations, multilateral agreements",
                    DescriptionHi = "अंतर-बैंक समझौते, फिनटेक सहयोग, बहुपक्षीय वित्तीय समझौते"
                },
                new()
                {
                    Id = 7,
                    NameEn = "National & International Summits",
                    NameHi = "राष्ट्रीय और अंतर्राष्ट्रीय शिखर सम्मेलन",
                    Slug = "national-international",
                    Icon = "globe",
                    DisplayOrder = 7,
                    DescriptionEn = "BRICS, G20, ASEAN, World Economic Forum, bilateral economic dialogues",
                    DescriptionHi = "ब्रिक्स, जी20, आसियान, विश्व आर्थिक मंच, द्विपक्षीय आर्थिक वार्ताएं"
                },
                new()
                {
                    Id = 8,
                    NameEn = "Awards, Ranks & Indexes",
                    NameHi = "पुरस्कार, रैंकिंग और सूचकांक",
                    Slug = "awards-indexes",
                    Icon = "award",
                    DisplayOrder = 8,
                    DescriptionEn = "Ease of Doing Business, Global Innovation Index, Banker of the Year awards",
                    DescriptionHi = "ईज ऑफ डूइंग बिजनेस, वैश्विक नवाचार सूचकांक, बैंकर ऑफ द ईयर पुरस्कार"
                },
                new()
                {
                    Id = 9,
                    NameEn = "Important Days & Banking Themes",
                    NameHi = "महत्वपूर्ण दिवस और बैंकिंग विषय",
                    Slug = "days-themes",
                    Icon = "calendar",
                    DisplayOrder = 9,
                    DescriptionEn = "Financial Literacy Week, World Consumer Rights Day, RBI Foundation Day",
                    DescriptionHi = "वित्तीय साक्षरता सप्ताह, विश्व उपभोक्ता अधिकार दिवस, आरबीआई स्थापना दिवस"
                }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        // 2. Seed realistic Daily Digest for Today and Previous Days if empty
        if (!await context.DailyAffairDigests.AnyAsync())
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var yesterday = today.AddDays(-1);

            var keyMetrics = new[]
            {
                new { MetricNameEn = "Policy Repo Rate", MetricNameHi = "नीतिगत रेपो दर", Value = "6.50%", Change = "Unchanged", Note = "MPC kept stance neutral" },
                new { MetricNameEn = "Standing Deposit Facility (SDF)", MetricNameHi = "स्थायी जमा सुविधा (SDF)", Value = "6.25%", Change = "0 bps", Note = "Absorption corridor" },
                new { MetricNameEn = "Marginal Standing Facility (MSF)", MetricNameHi = "सीमांत स्थायी सुविधा (MSF)", Value = "6.75%", Change = "0 bps", Note = "Injection corridor" },
                new { MetricNameEn = "Cash Reserve Ratio (CRR)", MetricNameHi = "नकद आरक्षित अनुपात (CRR)", Value = "4.50%", Change = "Stable", Note = "Maintained by all SCBs" },
                new { MetricNameEn = "Statutory Liquidity Ratio (SLR)", MetricNameHi = "वैधानिक तरलता अनुपात (SLR)", Value = "18.00%", Change = "Stable", Note = "Invested in approved G-Secs" },
                new { MetricNameEn = "CPI Inflation (Latest)", MetricNameHi = "सीपीआई मुद्रास्फीति (नवीनतम)", Value = "3.65%", Change = "-12 bps", Note = "Within RBI target band (4% +/- 2%)" }
            };

            var digestToday = new DailyAffairDigest
            {
                Id = Guid.NewGuid(),
                DigestDate = today,
                TitleEn = $"Daily Banking & Financial Current Affairs - {today:dd MMMM yyyy}",
                TitleHi = $"दैनिक बैंकिंग और वित्तीय समसामयिकी - {today:dd MMMM yyyy}",
                OverviewEn = "Today's highlights include RBI's updated guidelines on digital lending compliance, World Bank's revised GDP growth forecast for India, and SBI's green bond issuance.",
                OverviewHi = "आज के मुख्य आकर्षणों में डिजिटल ऋण अनुपालन पर आरबीआई के अद्यतन दिशानिर्देश, भारत के लिए विश्व बैंक का संशोधित जीडीपी विकास पूर्वानुमान और एसबीआई का ग्रीन बॉन्ड जारी करना शामिल हैं।",
                BankingKeyMetricsJson = JsonSerializer.Serialize(keyMetrics),
                Status = PublishStatus.Published,
                PublishedAtUtc = DateTime.UtcNow,
                GeneratedBy = "AI Automated Banking Engine"
            };

            var item1 = new CurrentAffairItem
            {
                Id = Guid.NewGuid(),
                DigestId = digestToday.Id,
                CategoryId = 2, // RBI Circulars
                TitleEn = "RBI Mandates Key Fact Statement (KFS) for All Retail and MSME Loans",
                TitleHi = "आरबीआई ने सभी खुदरा और एमएसएमई ऋणों के लिए मुख्य तथ्य विवरण (KFS) अनिवार्य किया",
                SummaryEn = "The Reserve Bank of India announced that all Regulated Entities (REs) including Commercial Banks, NBFCs, and Co-operative Banks must issue a standardized Key Fact Statement (KFS) to borrowers before sanctioning any retail or MSME loan.",
                SummaryHi = "भारतीय रिजर्व बैंक ने घोषणा की कि वाणिज्यिक बैंकों, एनबीएफसी और सहकारी बैंकों सहित सभी विनियमित संस्थाओं को किसी भी खुदरा या एमएसएमई ऋण को स्वीकृत करने से पहले उधारकर्ताओं को एक मानकीकृत मुख्य तथ्य विवरण (KFS) जारी करना अनिवार्य होगा।",
                BulletPointsEnJson = JsonSerializer.Serialize(new[]
                {
                    "KFS contains key details such as Annual Percentage Rate (APR), total cost of credit, recovery mechanism, and grievance redressal officer details.",
                    "Any fees or charges not explicitly mentioned in the KFS cannot be charged to the borrower at any stage of loan term.",
                    "The guideline comes into effect for all commercial banks, RRBs, SFBs, and NBFCs.",
                    "Exemption: Credit card receivables are exempted from specific provisions of this circular."
                }),
                BulletPointsHiJson = JsonSerializer.Serialize(new[]
                {
                    "केएफएस (KFS) में वार्षिक प्रतिशत दर (APR), ऋण की कुल लागत, वसूली तंत्र और शिकायत निवारण अधिकारी का विवरण शामिल है।",
                    "केएफएस में स्पष्ट रूप से उल्लिखित न किए गए किसी भी शुल्क या प्रभार को ऋण अवधि के किसी भी चरण में उधारकर्ता से नहीं लिया जा सकता है।",
                    "यह दिशानिर्देश सभी वाणिज्यिक बैंकों, आरआरबी, एसएफबी और एनबीएफसी पर लागू होता है।",
                    "छूट: क्रेडिट कार्ड प्राप्य को इस परिपत्र के विशिष्ट प्रावधानों से छूट दी गई है।"
                }),
                BankingTakeawayEn = "Exam focus: APR (Annual Percentage Rate) calculation includes all processing fees, insurance charges, and valuation costs. Crucial for SBI PO & RBI Grade B Phase 2.",
                BankingTakeawayHi = "परीक्षा दृष्टिकोण: एपीआर (वार्षिक प्रतिशत दर) गणना में सभी प्रसंस्करण शुल्क, बीमा शुल्क और मूल्यांकन लागत शामिल हैं। एसबीआई पीओ और आरबीआई ग्रेड बी चरण 2 के लिए अत्यंत महत्वपूर्ण।",
                StaticGkFactEn = "RBI Governor: Shaktikanta Das | Founded: 1 April 1935 (Hilton Young Commission) | Headquarters: Mumbai, Maharashtra.",
                StaticGkFactHi = "आरबीआई गवर्नर: शक्तिकांत दास | स्थापना: 1 अप्रैल 1935 (हिल्टन यंग कमीशन) | मुख्यालय: मुंबई, महाराष्ट्र।",
                Importance = ImportanceLevel.MustRead,
                TargetExams = ExamTag.AllBanking,
                Keywords = "RBI, KFS, Key Fact Statement, APR, Retail Loans, MSME, Regulatory Compliance",
                SourceName = "RBI Official Press Notification",
                SourceUrl = "https://rbi.org.in",
                DisplayOrder = 1,
                IsFeatured = true
            };

            var item2 = new CurrentAffairItem
            {
                Id = Guid.NewGuid(),
                DigestId = digestToday.Id,
                CategoryId = 3, // Economy & GDP
                TitleEn = "World Bank Upgrades India's FY25 GDP Growth Forecast to 7.0%",
                TitleHi = "विश्व बैंक ने भारत के वित्त वर्ष 2025 के सकल घरेलू उत्पाद (जीडीपी) वृद्धि अनुमान को बढ़ाकर 7.0% किया",
                SummaryEn = "The World Bank in its latest India Development Update revised its forecast for India's GDP growth in FY24-25 upward from 6.6% to 7.0%, citing robust domestic public investment and resilient urban consumption.",
                SummaryHi = "विश्व बैंक ने अपने नवीनतम 'इंडिया डेवलपमेंट अपडेट' में मजबूत घरेलू सार्वजनिक निवेश और लचीली शहरी खपत का हवाला देते हुए वित्त वर्ष 2024-25 में भारत की जीडीपी वृद्धि के अनुमान को 6.6% से बढ़ाकर 7.0% कर दिया है।",
                BulletPointsEnJson = JsonSerializer.Serialize(new[]
                {
                    "India continues to be the fastest-growing major economy in the world.",
                    "Agricultural sector recovery after normal monsoon season is anticipated to support rural consumption.",
                    "Headline inflation is expected to gradually converge toward RBI's mid-point target of 4.0%.",
                    "Current Account Deficit (CAD) is projected to remain manageable at approximately 1.3% of GDP."
                }),
                BulletPointsHiJson = JsonSerializer.Serialize(new[]
                {
                    "भारत दुनिया की सबसे तेजी से बढ़ती प्रमुख अर्थव्यवस्था बना हुआ है।",
                    "सामान्य मानसून के बाद कृषि क्षेत्र में सुधार से ग्रामीण खपत को समर्थन मिलने की उम्मीद है।",
                    "मुद्रास्फीति के धीरे-धीरे आरबीआई के 4.0% के मध्य-बिंदु लक्ष्य की ओर बढ़ने की उम्मीद है।",
                    "चालू खाता घाटा (CAD) सकल घरेलू उत्पाद के लगभग 1.3% पर प्रबंधनीय बने रहने का अनुमान है।"
                }),
                BankingTakeawayEn = "Comparison figures to memorize: World Bank = 7.0%, IMF = 7.0%, RBI Projection = 7.2%, ADB = 7.0%. Frequently tested in Banking General Awareness sections.",
                BankingTakeawayHi = "याद रखने योग्य तुलनात्मक आंकड़े: विश्व बैंक = 7.0%, आईएमएफ = 7.0%, आरबीआई अनुमान = 7.2%, एडीबी = 7.0%। बैंकिंग सामान्य जागरूकता अनुभाग में अक्सर पूछे जाने वाले प्रश्न।",
                StaticGkFactEn = "World Bank President: Ajay Banga | Headquarters: Washington D.C., USA | Member Countries: 189 | Flagship Report: Global Economic Prospects.",
                StaticGkFactHi = "विश्व बैंक अध्यक्ष: अजय बंगा | मुख्यालय: वाशिंगटन डी.सी., यूएसए | सदस्य देश: 189 | प्रमुख रिपोर्ट: वैश्विक आर्थिक संभावनाएं।",
                Importance = ImportanceLevel.High,
                TargetExams = ExamTag.AllBanking,
                Keywords = "World Bank, India Development Update, GDP Growth, Economy, FY25, CAD",
                SourceName = "World Bank India Development Update",
                SourceUrl = "https://worldbank.org",
                DisplayOrder = 2,
                IsFeatured = false
            };

            var item3 = new CurrentAffairItem
            {
                Id = Guid.NewGuid(),
                DigestId = digestToday.Id,
                CategoryId = 1, // Banking & Finance
                TitleEn = "State Bank of India Raises $500 Million via Second Green Bond Issuance",
                TitleHi = "भारतीय स्टेट बैंक (SBI) ने दूसरे ग्रीन बॉन्ड जारी करके 500 मिलियन डॉलर जुटाए",
                SummaryEn = "State Bank of India (SBI), the country's largest public sector lender, has successfully raised $500 million (approx ₹4,180 crore) by issuing senior unsecured green notes under its ESG financing framework.",
                SummaryHi = "देश के सबसे बड़े सार्वजनिक क्षेत्र के बैंक, भारतीय स्टेट बैंक (SBI) ने अपने ईएसजी वित्तपोषण ढांचे के तहत वरिष्ठ असुरक्षित ग्रीन नोट जारी करके 500 मिलियन डॉलर (लगभग ₹4,180 करोड़) सफलतापूर्वक जुटाए हैं।",
                BulletPointsEnJson = JsonSerializer.Serialize(new[]
                {
                    "The bonds have a maturity period of 5 years with a coupon rate of SOFR (Secured Overnight Financing Rate) + 115 bps.",
                    "The proceeds will be deployed into eligible green projects including solar farms, wind energy, and electric mobility infrastructure.",
                    "The notes will be listed on the Singapore Stock Exchange (SGX) and India International Exchange (India INX) at GIFT City, Gandhinagar.",
                    "SBI is the pioneer among Indian commercial banks in issuing syndicated green bonds."
                }),
                BulletPointsHiJson = JsonSerializer.Serialize(new[]
                {
                    "बॉन्ड की परिपक्वता अवधि 5 वर्ष है और इसकी कूपन दर SOFR + 115 बीपीएस है।",
                    "प्राप्त राशि सौर ऊर्जा फार्म, पवन ऊर्जा और इलेक्ट्रिक मोबिलिटी बुनियादी ढांचे सहित योग्य हरित परियोजनाओं में लगाई जाएगी।",
                    "नोट्स को सिंगापुर स्टॉक एक्सचेंज (एसजीएक्स) और गिफ्ट सिटी, गांधीनगर में इंडिया इंटरनेशनल एक्सचेंज (इंडिया आईएनएक्स) में सूचीबद्ध किया जाएगा।",
                    "एसबीआई सिंडिकेटेड ग्रीन बॉन्ड जारी करने वाले भारतीय वाणिज्यिक बैंकों में अग्रणी है।"
                }),
                BankingTakeawayEn = "GIFT City facts: Gujarat International Finance Tec-City located in Gandhinagar; regulated by IFSCA (International Financial Services Centres Authority), Chairman: K. Rajaraman.",
                BankingTakeawayHi = "गिफ्ट सिटी मुख्य तथ्य: गांधीनगर में स्थित गुजरात इंटरनेशनल फाइनेंस टेक-सिटी; आईएफएससीए द्वारा विनियमित, अध्यक्ष: के. राजारमन।",
                StaticGkFactEn = "SBI Chairman: C.S. Setty | Founded: 1 July 1955 (via SBI Act 1955 based on All India Rural Credit Survey Committee) | Headquarters: Mumbai.",
                StaticGkFactHi = "एसबीआई अध्यक्ष: सी.एस. सेट्टी | स्थापना: 1 जुलाई 1955 (अखिल भारतीय ग्रामीण ऋण सर्वेक्षण समिति की सिफारिश) | मुख्यालय: मुंबई।",
                Importance = ImportanceLevel.High,
                TargetExams = ExamTag.SbiPo,
                Keywords = "SBI, Green Bond, ESG, GIFT City, IFSCA, SOFR, Sustainable Finance",
                SourceName = "SBI Press Release / Financial Express",
                SourceUrl = "https://sbi.co.in",
                DisplayOrder = 3,
                IsFeatured = false
            };

            var item4 = new CurrentAffairItem
            {
                Id = Guid.NewGuid(),
                DigestId = digestToday.Id,
                CategoryId = 4, // Govt Schemes
                TitleEn = "Pradhan Mantri Jan Dhan Yojana (PMJDY) Completes 10 Years: Deposits Cross ₹2.31 Lakh Crore",
                TitleHi = "प्रधानमंत्री जन धन योजना (PMJDY) के 10 वर्ष पूरे: कुल जमा राशि ₹2.31 लाख करोड़ के पार",
                SummaryEn = "Launched on 28th August 2014, the National Mission for Financial Inclusion, PMJDY, marked its 10th anniversary with more than 53 crore bank accounts opened, of which 55.6% belong to women account holders.",
                SummaryHi = "28 अगस्त 2014 को शुरू किए गए वित्तीय समावेशन के राष्ट्रीय मिशन, पीएमजेडीवाई ने अपनी 10वीं वर्षगांठ मनाई, जिसमें 53 करोड़ से अधिक बैंक खाते खोले गए हैं, जिनमें से 55.6% महिला खाताधारकों के हैं।",
                BulletPointsEnJson = JsonSerializer.Serialize(new[]
                {
                    "Total accounts opened: Over 53.13 crore as of August 2024; Rural and semi-urban branches account for 66.6% of accounts.",
                    "Zero balance accounts dropped drastically from 58% in March 2015 to under 8% in 2024.",
                    "Free RuPay debit card provided with built-in accident insurance cover of ₹2 Lakh (for accounts opened after 28.08.2018).",
                    "Overdraft (OD) facility available up to ₹10,000 (with no conditions up to ₹2,000; age limit 18-65 years)."
                }),
                BulletPointsHiJson = JsonSerializer.Serialize(new[]
                {
                    "खोले गए कुल खाते: अगस्त 2024 तक 53.13 करोड़ से अधिक; ग्रामीण और अर्ध-शहरी शाखाओं में 66.6% खाते हैं।",
                    "जीरो बैलेंस खाते मार्च 2015 के 58% से भारी गिरावट के साथ 2024 में 8% से कम हो गए हैं।",
                    "₹2 लाख के अंतर्निहित दुर्घटना बीमा कवर के साथ निःशुल्क रुपे डेबिट कार्ड (28.08.2018 के बाद खुले खातों के लिए)।",
                    "₹10,000 तक की ओवरड्राफ्ट (ओडी) सुविधा उपलब्ध (₹2,000 तक बिना शर्त; आयु सीमा 18-65 वर्ष)।"
                }),
                BankingTakeawayEn = "Extremely high probability for IBPS PO, SBI PO, and Clerk interviews & mains exam. Remember OD limit: ₹10,000; RuPay insurance: ₹2 lakh; Slogan: 'Mera Khata Bhagya Vidhata'.",
                BankingTakeawayHi = "आईबीपीएस पीओ, एसबीआई पीओ और क्लर्क मुख्य परीक्षा और साक्षात्कार के लिए अत्यधिक महत्वपूर्ण। ओडी सीमा: ₹10,000; रुपे बीमा: ₹2 लाख; नारा: 'मेरा खाता भाग्य विधाता'।",
                StaticGkFactEn = "Operated under Department of Financial Services (DFS), Ministry of Finance. Nodal Minister: Nirmala Sitharaman.",
                StaticGkFactHi = "वित्तीय सेवाएं विभाग (डीएफएस), वित्त मंत्रालय के अधीन संचालित। नोडल मंत्री: निर्मला सीतारमण।",
                Importance = ImportanceLevel.PreviousYearsPattern,
                TargetExams = ExamTag.AllBanking,
                Keywords = "PMJDY, Jan Dhan Yojana, Financial Inclusion, RuPay Card, Overdraft, DFS",
                SourceName = "PIB (Press Information Bureau) Delhi",
                SourceUrl = "https://pib.gov.in",
                DisplayOrder = 4,
                IsFeatured = true
            };

            var item5 = new CurrentAffairItem
            {
                Id = Guid.NewGuid(),
                DigestId = digestToday.Id,
                CategoryId = 5, // Appointments
                TitleEn = "Government Appoints New Managing Directors for Major Public Sector Banks",
                TitleHi = "सरकार ने प्रमुख सार्वजनिक क्षेत्र के बैंकों के लिए नए प्रबंध निदेशकों की नियुक्ति की",
                SummaryEn = "The Appointments Committee of the Cabinet (ACC) approved recommendations of the Financial Services Institutions Bureau (FSIB) to appoint new Managing Directors & CEOs across leading PSBs.",
                SummaryHi = "मंत्रिमंडल की नियुक्ति समिति (ACC) ने वित्तीय सेवा संस्थान ब्यूरो (FSIB) की सिफारिशों को मंजूरी देते हुए प्रमुख सार्वजनिक क्षेत्र के बैंकों में नए प्रबंध निदेशकों और सीईओ की नियुक्ति की।",
                BulletPointsEnJson = JsonSerializer.Serialize(new[]
                {
                    "FSIB recommends appointments for top management in PSBs, public sector insurance companies, and financial institutions.",
                    "FSIB replaced the former Banks Board Bureau (BBB) in July 2022.",
                    "Current Chairman of FSIB is Bhanu Pratap Sharma, former Secretary, Department of Personnel and Training (DoPT).",
                    "Tenure of newly appointed PSB chiefs is typically 3 years or until superannuation."
                }),
                BulletPointsHiJson = JsonSerializer.Serialize(new[]
                {
                    "FSIB सार्वजनिक क्षेत्र के बैंकों, सरकारी बीमा कंपनियों और वित्तीय संस्थानों में शीर्ष प्रबंधन की नियुक्ति की सिफारिश करता है।",
                    "FSIB ने जुलाई 2022 में पूर्व बैंक बोर्ड ब्यूरो (BBB) का स्थान लिया था।",
                    "FSIB के वर्तमान अध्यक्ष भानु प्रताप शर्मा हैं, जो कार्मिक एवं प्रशिक्षण विभाग के पूर्व सचिव हैं।",
                    "नव नियुक्त पीएसबी प्रमुखों का कार्यकाल आमतौर पर 3 वर्ष या सेवानिवृत्ति तक होता है।"
                }),
                BankingTakeawayEn = "Question pattern: 'Which body recommends the appointment of Directors and Chairpersons in PSBs?' Answer: Financial Services Institutions Bureau (FSIB).",
                BankingTakeawayHi = "प्रश्न पैटर्न: 'सार्वजनिक क्षेत्र के बैंकों में निदेशकों और अध्यक्षों की नियुक्ति की सिफारिश कौन सी संस्था करती है?' उत्तर: वित्तीय सेवा संस्थान ब्यूरो (FSIB)।",
                StaticGkFactEn = "FSIB Headquarters: Mumbai, Maharashtra | Parent Ministry: Ministry of Finance.",
                StaticGkFactHi = "FSIB मुख्यालय: मुंबई, महाराष्ट्र | मूल मंत्रालय: वित्त मंत्रालय।",
                Importance = ImportanceLevel.High,
                TargetExams = ExamTag.IbpsPo,
                Keywords = "FSIB, Banks Board Bureau, Appointments, ACC, Public Sector Banks, PSB MD",
                SourceName = "DoPT / Ministry of Finance Notification",
                SourceUrl = "https://financialservices.gov.in",
                DisplayOrder = 5,
                IsFeatured = false
            };

            digestToday.Items.Add(item1);
            digestToday.Items.Add(item2);
            digestToday.Items.Add(item3);
            digestToday.Items.Add(item4);
            digestToday.Items.Add(item5);

            // Also create yesterday's archive entry for seamless calendar archive testing
            var digestYesterday = new DailyAffairDigest
            {
                Id = Guid.NewGuid(),
                DigestDate = yesterday,
                TitleEn = $"Daily Banking & Financial Current Affairs - {yesterday:dd MMMM yyyy}",
                TitleHi = $"दैनिक बैंकिंग और वित्तीय समसामयिकी - {yesterday:dd MMMM yyyy}",
                OverviewEn = "Yesterday's coverage highlighted SEBI's new T+0 settlement expansion, UPI transaction volumes reaching record highs, and Asian Development Bank's loan agreement for solar projects.",
                OverviewHi = "कल के कवरेज में सेबी के नए टी+0 सेटलमेंट विस्तार, यूपीआई लेनदेन की मात्रा के रिकॉर्ड स्तर पर पहुंचने और सौर परियोजनाओं के लिए एशियाई विकास बैंक के ऋण समझौते पर प्रकाश डाला गया।",
                BankingKeyMetricsJson = JsonSerializer.Serialize(keyMetrics),
                Status = PublishStatus.Published,
                PublishedAtUtc = DateTime.UtcNow.AddDays(-1),
                GeneratedBy = "AI Automated Banking Engine"
            };

            var itemYesterday1 = new CurrentAffairItem
            {
                Id = Guid.NewGuid(),
                DigestId = digestYesterday.Id,
                CategoryId = 1, // Banking & Finance
                TitleEn = "Unified Payments Interface (UPI) Clocks Over 15 Billion Transactions in a Single Month",
                TitleHi = "यूनिफाइड पेमेंट्स इंटरफेस (UPI) ने एक ही महीने में 15 बिलियन से अधिक लेनदेन दर्ज किए",
                SummaryEn = "NPCI data revealed that UPI transactions reached a monumental high of 15 billion transactions with total value surpassing ₹20.6 lakh crore, led by merchant payments and RuPay on UPI integration.",
                SummaryHi = "एनपीसीआई (NPCI) के आंकड़ों से पता चला कि यूपीआई लेनदेन 15 बिलियन लेनदेन के ऐतिहासिक आंकड़े तक पहुंच गया, जिसका कुल मूल्य ₹20.6 लाख करोड़ से अधिक था।",
                BulletPointsEnJson = JsonSerializer.Serialize(new[]
                {
                    "National Payments Corporation of India (NPCI) operates UPI under the Payment and Settlement Systems Act, 2007.",
                    "NPCI is an initiative of Reserve Bank of India (RBI) and Indian Banks' Association (IBA).",
                    "P2M (Person-to-Merchant) transactions accounted for over 62% of total transaction volume.",
                    "International adoption of UPI expanded to UAE, Singapore, Nepal, Bhutan, Mauritius, and Sri Lanka."
                }),
                BulletPointsHiJson = JsonSerializer.Serialize(new[]
                {
                    "भारतीय राष्ट्रीय भुगतान निगम (NPCI) भुगतान और निपटान प्रणाली अधिनियम, 2007 के तहत UPI संचालित करता है।",
                    "NPCI भारतीय रिजर्व बैंक (RBI) और भारतीय बैंक संघ (IBA) की एक संयुक्त पहल है।",
                    "व्यक्ति से व्यापारी (P2M) लेनदेन कुल लेनदेन की मात्रा का 62% से अधिक था।",
                    "यूपीआई का अंतरराष्ट्रीय विस्तार यूएई, सिंगापुर, नेपाल, भूटान, मॉरीशस और श्रीलंका तक हो गया है।"
                }),
                BankingTakeawayEn = "NPCI established in 2008 as a 'Not for Profit' company under Section 8 of Companies Act 2013. MD & CEO: Dilip Asbe. Core product questions appear in all banking prelims/mains.",
                BankingTakeawayHi = "एनपीसीआई की स्थापना 2008 में कंपनी अधिनियम की धारा 8 के तहत 'गैर-लाभकारी' कंपनी के रूप में की गई थी। एमडी और सीईओ: दिलीप असबे।",
                StaticGkFactEn = "NPCI Headquarters: Mumbai | Other key products: IMPS, RuPay, NACH, AePS, NETC FASTag.",
                StaticGkFactHi = "एनपीसीआई मुख्यालय: मुंबई | अन्य प्रमुख उत्पाद: IMPS, RuPay, NACH, AePS, NETC FASTag।",
                Importance = ImportanceLevel.MustRead,
                TargetExams = ExamTag.AllBanking,
                Keywords = "NPCI, UPI, Digital Payments, RuPay, Dilip Asbe, FinTech",
                SourceName = "NPCI Monthly Report",
                SourceUrl = "https://npci.org.in",
                DisplayOrder = 1,
                IsFeatured = true
            };

            digestYesterday.Items.Add(itemYesterday1);

            await context.DailyAffairDigests.AddRangeAsync(digestToday, digestYesterday);
            await context.SaveChangesAsync();
        }

        // 3. Seed Expected Exam Questions if empty
        if (!await context.ExpectedQuestions.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var currentMonth = $"{now.Year:D4}-{now.Month:D2}";
            var currentMonthDisplay = now.ToString("MMMM yyyy");

            var categories = await context.Categories.ToListAsync();
            var defaultCat = categories.FirstOrDefault()?.Id ?? 1;

            var curated = Services.AiAnalysisService.GetCuratedMonthQuestions(currentMonth);
            foreach (var q in curated)
            {
                var cat = categories.FirstOrDefault(c => c.Slug.Equals(q.CategorySlug, StringComparison.OrdinalIgnoreCase)) ?? categories.FirstOrDefault();
                var entity = new ExpectedQuestion
                {
                    Id = Guid.NewGuid(),
                    MonthYear = currentMonth,
                    MonthYearDisplay = currentMonthDisplay,
                    CategoryId = cat?.Id ?? defaultCat,
                    QuestionType = q.QuestionType,
                    DifficultyLevel = q.DifficultyLevel,
                    TargetExam = q.TargetExam,
                    QuestionEn = q.QuestionEn,
                    QuestionHi = q.QuestionHi,
                    OptionsEnJson = JsonSerializer.Serialize(q.OptionsEn),
                    OptionsHiJson = JsonSerializer.Serialize(q.OptionsHi),
                    CorrectAnswer = q.CorrectAnswer,
                    ExplanationEn = q.ExplanationEn,
                    ExplanationHi = q.ExplanationHi,
                    DeepAnalysisEn = q.DeepAnalysisEn,
                    DeepAnalysisHi = q.DeepAnalysisHi,
                    StaticConceptLinkEn = q.StaticConceptLinkEn,
                    StaticConceptLinkHi = q.StaticConceptLinkHi,
                    ExaminerTrapWarningEn = q.ExaminerTrapWarningEn,
                    ExaminerTrapWarningHi = q.ExaminerTrapWarningHi,
                    CreatedAtUtc = DateTime.UtcNow
                };
                context.ExpectedQuestions.Add(entity);
            }
            await context.SaveChangesAsync();
        }
    }
}
