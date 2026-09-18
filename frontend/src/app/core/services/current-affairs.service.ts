import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DailyDigest, CurrentAffairItem, FilterParams } from '../models/current-affair.model';
import { Category } from '../models/category.model';
import { BookmarkService } from './bookmark.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CurrentAffairsService {
  private http = inject(HttpClient);
  private bookmarkService = inject(BookmarkService);
  private baseUrl = environment.apiUrl;

  getTodayDigest(): Observable<DailyDigest> {
    const userId = this.bookmarkService.getUserId();
    const params = new HttpParams().set('userId', userId);
    return this.http.get<DailyDigest>(`${this.baseUrl}/currentaffairs/today`, { params });
  }

  getDigestByDate(dateStr: string): Observable<DailyDigest> {
    const userId = this.bookmarkService.getUserId();
    const params = new HttpParams().set('userId', userId);
    return this.http.get<DailyDigest>(`${this.baseUrl}/currentaffairs/date/${dateStr}`, { params });
  }

  getArchiveDates(year?: number, month?: number): Observable<string[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<string[]>(`${this.baseUrl}/currentaffairs/archive-dates`, { params });
  }

  searchCurrentAffairs(filter: FilterParams): Observable<CurrentAffairItem[]> {
    let params = new HttpParams();
    const userId = this.bookmarkService.getUserId();
    params = params.set('userId', userId);

    if (filter.date) params = params.set('date', filter.date);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    if (filter.examTag) params = params.set('examTag', filter.examTag);
    if (filter.importance) params = params.set('importance', filter.importance);
    if (filter.searchQuery) params = params.set('searchQuery', filter.searchQuery);
    if (filter.targetGroup) params = params.set('targetGroup', filter.targetGroup);
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<CurrentAffairItem[]>(`${this.baseUrl}/currentaffairs/search`, { params });
  }

  getItemById(id: string): Observable<CurrentAffairItem> {
    const userId = this.bookmarkService.getUserId();
    const params = new HttpParams().set('userId', userId);
    return this.http.get<CurrentAffairItem>(`${this.baseUrl}/currentaffairs/items/${id}`, { params });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }
}
