import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrUpdateAffairPayload, CurrentAffairItem } from '../models/current-affair.model';
import { environment } from '../../../environments/environment';

export interface JobExecutionLog {
  id: string;
  jobName: string;
  targetDate: string;
  startedAtUtc: string;
  completedAtUtc?: string;
  status: string;
  itemsCreatedOrUpdated: number;
  logMessage?: string;
  errorDetails?: string;
  triggerSource: string;
}

export interface TriggerJobResponse {
  executionId: string;
  jobName: string;
  targetDate: string;
  status: string;
  statusText: string;
  itemsCreatedOrUpdated: number;
  message: string;
  timestampUtc: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  createItem(payload: CreateOrUpdateAffairPayload): Observable<CurrentAffairItem> {
    return this.http.post<CurrentAffairItem>(`${this.baseUrl}/admin/items`, payload);
  }

  updateItem(id: string, payload: CreateOrUpdateAffairPayload): Observable<CurrentAffairItem> {
    return this.http.put<CurrentAffairItem>(`${this.baseUrl}/admin/items/${id}`, payload);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/admin/items/${id}`);
  }

  triggerDailySync(date?: string): Observable<TriggerJobResponse> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    return this.http.post<TriggerJobResponse>(`${this.baseUrl}/jobs/trigger-daily-sync`, {}, { params });
  }

  getJobHistory(count: number = 10): Observable<JobExecutionLog[]> {
    const params = new HttpParams().set('count', count.toString());
    return this.http.get<JobExecutionLog[]>(`${this.baseUrl}/jobs/history`, { params });
  }
}
