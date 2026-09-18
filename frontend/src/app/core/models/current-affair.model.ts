export interface BankingMetric {
  metricNameEn: string;
  metricNameHi: string;
  value: string;
  change?: string;
  note?: string;
}

export interface CurrentAffairItem {
  id: string;
  digestId: string;
  digestDate: string;
  categoryId: number;
  categoryNameEn: string;
  categoryNameHi: string;
  categoryIcon: string;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  bulletPointsEn: string[];
  bulletPointsHi: string[];
  bankingTakeawayEn: string;
  bankingTakeawayHi: string;
  staticGkFactEn: string;
  staticGkFactHi: string;
  importance: string;
  targetExams: string;
  keywordsList: string[];
  sourceUrl: string;
  sourceName: string;
  displayOrder: number;
  isFeatured: boolean;
  isBookmarked?: boolean;
  createdAtUtc: string;
}

export interface DailyDigest {
  id: string;
  digestDate: string;
  titleEn: string;
  titleHi: string;
  overviewEn: string;
  overviewHi: string;
  bankingKeyMetrics: BankingMetric[];
  status: string;
  publishedAtUtc?: string;
  generatedBy?: string;
  items: CurrentAffairItem[];
  totalItemsCount: number;
}

export interface FilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  examTag?: string;
  importance?: string;
  searchQuery?: string;
  language?: string;
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateOrUpdateAffairPayload {
  id?: string;
  digestDate: string;
  categoryId: number;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  bulletPointsEn: string[];
  bulletPointsHi: string[];
  bankingTakeawayEn: string;
  bankingTakeawayHi: string;
  staticGkFactEn: string;
  staticGkFactHi: string;
  importance: string;
  targetExams: string;
  keywords: string;
  sourceUrl?: string;
  sourceName?: string;
  displayOrder: number;
  isFeatured: boolean;
}
