import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ExpectedQuestion,
  MonthArchiveSummary,
  GenerateQuestionsRequest,
  GenerateQuestionsResponse
} from '../models/expected-question.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExamQuestionService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/examquestions`;

  getAvailableMonths(): Observable<MonthArchiveSummary[]> {
    return this.http.get<MonthArchiveSummary[]>(`${this.baseUrl}/months`);
  }

  getQuestions(
    monthYear: string,
    categoryId?: number,
    difficulty?: string,
    questionType?: string
  ): Observable<ExpectedQuestion[]> {
    let params = new HttpParams().set('monthYear', monthYear);

    if (categoryId) params = params.set('categoryId', categoryId.toString());
    if (difficulty && difficulty !== 'All') params = params.set('difficulty', difficulty);
    if (questionType && questionType !== 'All') params = params.set('questionType', questionType);

    return this.http.get<ExpectedQuestion[]>(this.baseUrl, { params });
  }

  getQuestionById(id: string): Observable<ExpectedQuestion> {
    return this.http.get<ExpectedQuestion>(`${this.baseUrl}/${id}`);
  }

  generateMonthQuestions(payload: GenerateQuestionsRequest): Observable<GenerateQuestionsResponse> {
    return this.http.post<GenerateQuestionsResponse>(`${this.baseUrl}/generate`, payload);
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
