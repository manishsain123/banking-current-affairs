import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, JobExecutionLog, TriggerJobResponse } from '../../core/services/admin.service';
import { CurrentAffairsService } from '../../core/services/current-affairs.service';
import { CurrentAffairItem } from '../../core/models/current-affair.model';
import { Category } from '../../core/models/category.model';
import { AffairFormModalComponent } from './affair-form-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AffairFormModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Admin Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center space-x-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <span class="inline-block w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>Operations & Management Portal</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin & Automation Dashboard
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Manage daily current affairs articles, monitor background jobs, and trigger automated AI synthesis.
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <a
            href="http://localhost:5000/hangfire"
            target="_blank"
            class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors">
            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Hangfire Dashboard</span>
          </a>
          <button
            (click)="openCreateModal()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Manual Note</span>
          </button>
        </div>
      </div>

      <!-- Automation Trigger Card -->
      <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-md mb-8">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center space-x-2 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Daily Automated Worker (.NET 8 + Hangfire + LLM)</span>
            </div>
            <h2 class="text-lg sm:text-xl font-extrabold mb-1">
              Automated Daily Notes Generator
            </h2>
            <p class="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Recurring job is pre-scheduled to run daily at <b>05:00 AM IST</b> (<code class="bg-blue-950/60 px-1 py-0.5 rounded text-blue-300">0 5 * * *</code>).
              You can also execute an instant on-demand AI fetch and bilingual translation below for any date.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-shrink-0">
            <input
              type="date"
              [(ngModel)]="syncDate"
              class="px-3 py-2.5 rounded-xl bg-slate-800/80 border border-blue-400/40 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              (click)="triggerSync()"
              [disabled]="isSyncing"
              class="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
              <svg *ngIf="isSyncing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg *ngIf="!isSyncing" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{{ isSyncing ? 'Generating Notes...' : 'Trigger AI Sync Now' }}</span>
            </button>
          </div>
        </div>

        <!-- Sync Result Banner -->
        <div *ngIf="syncResult" class="mt-4 pt-4 border-t border-blue-800/80 flex items-center justify-between text-xs text-blue-100">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full" [class.bg-emerald-400]="syncResult.status === 'Success'" [class.bg-rose-400]="syncResult.status !== 'Success'"></span>
            <span class="font-semibold">{{ syncResult.message }}</span>
          </div>
          <span class="text-blue-300">Items: {{ syncResult.itemsCreatedOrUpdated }} &bull; {{ syncResult.timestampUtc | date:'mediumTime' }}</span>
        </div>
      </div>

      <!-- Articles Management Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden mb-8">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 class="text-base font-bold text-slate-900">Current Affairs Articles</h3>
            <p class="text-xs text-slate-500">Showing notes for date: {{ selectedDate }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <input
              type="date"
              [(ngModel)]="selectedDate"
              (ngModelChange)="loadItemsForDate()"
              class="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500"
            />
            <button
              (click)="loadItemsForDate()"
              class="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Table of Items -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th class="px-6 py-3">Category</th>
                <th class="px-6 py-3">Headline (EN / HI)</th>
                <th class="px-6 py-3">Importance</th>
                <th class="px-6 py-3">Target Exam</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngIf="isLoadingItems">
                <td colspan="5" class="px-6 py-10 text-center text-slate-400">Loading articles...</td>
              </tr>
              <tr *ngIf="!isLoadingItems && items.length === 0">
                <td colspan="5" class="px-6 py-10 text-center text-slate-400">No articles found for {{ selectedDate }}. Use the trigger button or click 'Add Manual Note'.</td>
              </tr>
              <tr *ngFor="let item of items" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                    {{ item.categoryNameEn }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-900 max-w-md line-clamp-1">{{ item.titleEn }}</div>
                  <div class="text-[11px] text-slate-500 font-hindi max-w-md line-clamp-1">{{ item.titleHi }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                    [class.bg-rose-100]="item.importance === 'MustRead'"
                    [class.text-rose-800]="item.importance === 'MustRead'"
                    [class.bg-slate-100]="item.importance !== 'MustRead'">
                    {{ item.importance }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                  {{ item.targetExams }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button
                    (click)="openEditModal(item)"
                    class="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    (click)="deleteItem(item)"
                    class="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Background Automation History Log -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Background Automation Execution History</span>
          <button (click)="loadJobHistory()" class="text-xs text-blue-600 hover:underline">Refresh</button>
        </h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th class="px-4 py-2.5">Executed At</th>
                <th class="px-4 py-2.5">Job Name</th>
                <th class="px-4 py-2.5">Target Date</th>
                <th class="px-4 py-2.5">Trigger Source</th>
                <th class="px-4 py-2.5">Status</th>
                <th class="px-4 py-2.5">Items</th>
                <th class="px-4 py-2.5">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let log of jobHistory">
                <td class="px-4 py-3 whitespace-nowrap">{{ log.startedAtUtc | date:'short' }}</td>
                <td class="px-4 py-3 font-semibold text-slate-900">{{ log.jobName }}</td>
                <td class="px-4 py-3 whitespace-nowrap">{{ log.targetDate }}</td>
                <td class="px-4 py-3">{{ log.triggerSource }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                    [class.bg-emerald-100]="log.status === 'Success'"
                    [class.text-emerald-800]="log.status === 'Success'"
                    [class.bg-rose-100]="log.status === 'Failed'"
                    [class.text-rose-800]="log.status === 'Failed'">
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-4 py-3 font-bold">{{ log.itemsCreatedOrUpdated }}</td>
                <td class="px-4 py-3 max-w-xs truncate text-slate-500" [title]="log.logMessage || ''">
                  {{ log.logMessage || 'Completed' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <app-affair-form-modal
        *ngIf="showModal"
        [itemToEdit]="selectedItemForEdit"
        [initialDate]="selectedDate"
        [categories]="categories"
        (close)="showModal = false"
        (saved)="onArticleSaved()">
      </app-affair-form-modal>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private currentAffairsService = inject(CurrentAffairsService);

  syncDate: string = new Date().toISOString().split('T')[0];
  selectedDate: string = new Date().toISOString().split('T')[0];

  isSyncing: boolean = false;
  syncResult: TriggerJobResponse | null = null;

  items: CurrentAffairItem[] = [];
  categories: Category[] = [];
  jobHistory: JobExecutionLog[] = [];
  isLoadingItems: boolean = false;

  showModal: boolean = false;
  selectedItemForEdit?: CurrentAffairItem;

  ngOnInit(): void {
    this.loadCategories();
    this.loadItemsForDate();
    this.loadJobHistory();
  }

  loadCategories(): void {
    this.currentAffairsService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => console.warn('Could not load categories')
    });
  }

  loadItemsForDate(): void {
    this.isLoadingItems = true;
    this.currentAffairsService.getDigestByDate(this.selectedDate).subscribe({
      next: (digest) => {
        this.items = digest.items;
        this.isLoadingItems = false;
      },
      error: () => {
        this.items = [];
        this.isLoadingItems = false;
      }
    });
  }

  loadJobHistory(): void {
    this.adminService.getJobHistory(10).subscribe({
      next: (history) => this.jobHistory = history,
      error: () => console.warn('Could not load job history')
    });
  }

  triggerSync(): void {
    this.isSyncing = true;
    this.syncResult = null;

    this.adminService.triggerDailySync(this.syncDate).subscribe({
      next: (res) => {
        this.syncResult = res;
        this.isSyncing = false;
        this.selectedDate = this.syncDate;
        this.loadItemsForDate();
        this.loadJobHistory();
      },
      error: (err: any) => {
        this.isSyncing = false;
        alert('Job trigger failed: ' + (err?.message || err));
      }
    });
  }

  openCreateModal(): void {
    this.selectedItemForEdit = undefined;
    this.showModal = true;
  }

  openEditModal(item: CurrentAffairItem): void {
    this.selectedItemForEdit = item;
    this.showModal = true;
  }

  deleteItem(item: CurrentAffairItem): void {
    if (confirm(`Are you sure you want to delete "${item.titleEn}"?`)) {
      this.adminService.deleteItem(item.id).subscribe({
        next: () => {
          this.loadItemsForDate();
        },
        error: (err: any) => alert('Delete failed: ' + (err?.message || err))
      });
    }
  }

  onArticleSaved(): void {
    this.showModal = false;
    this.loadItemsForDate();
  }
}
