export interface ExpectedQuestion {
  id: string;
  monthYear: string;
  monthYearDisplay: string;
  categoryId: number;
  categoryNameEn: string;
  categoryNameHi: string;
  questionType: string;
  difficultyLevel: string;
  targetExam: string;
  examTargetGroup?: string;

  // Bilingual Question
  questionEn: string;
  questionHi: string;

  // Deserialized Options A, B, C, D, E
  optionsEn: string[];
  optionsHi: string[];

  correctAnswer: string; // "A", "B", "C", "D", or "E"

  // Bilingual Explanations
  explanationEn: string;
  explanationHi: string;

  // Deep Analysis & Static Links
  deepAnalysisEn: string;
  deepAnalysisHi: string;
  staticConceptLinkEn: string;
  staticConceptLinkHi: string;
  examinerTrapWarningEn: string;
  examinerTrapWarningHi: string;

  relatedAffairItemId?: string;
  createdAtUtc: string;
}

export interface MonthArchiveSummary {
  monthYear: string;
  monthYearDisplay: string;
  questionCount: number;
  currentAffairsCount: number;
  isAnalyzed: boolean;
}

export interface GenerateQuestionsRequest {
  monthYear: string;
  targetQuestionCount?: number;
  targetExam?: string;
}

export interface GenerateQuestionsResponse {
  monthYear: string;
  questionsGenerated: number;
  message: string;
  questions: ExpectedQuestion[];
}
