import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CurrentAffairsService } from '../../core/services/current-affairs.service';
import { DailyDigest, CurrentAffairItem } from '../../core/models/current-affair.model';
import { Category } from '../../core/models/category.model';
import { LanguageService } from '../../core/services/language.service';
import { FinancialTickerComponent } from './components/financial-ticker.component';
import { AffairCardComponent } from './components/affair-card.component';

@Component({
  selector: 'app-daily-digest',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FinancialTickerComponent, AffairCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Date Navigation Header Banner -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <span class="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
              <span>Daily Banking General Awareness</span>
            </div>
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
              <span *ngIf="!langService.isHindi()">{{ digest()?.titleEn || 'Loading Current Affairs...' }}</span>
              <span *ngIf="langService.isHindi()" class="font-hindi">{{ digest()?.titleHi || 'समसामयिकी लोड हो रही है...' }}</span>
            </h1>
            <p *ngIf="digest()?.overviewEn" class="text-xs sm:text-sm text-slate-500 mt-1.5 line-clamp-2">
              {{ langService.isHindi() ? digest()?.overviewHi : digest()?.overviewEn }}
            </p>
          </div>

          <!-- Date Selector & Navigation Controls -->
          <div class="flex items-center space-x-2 self-start sm:self-center flex-shrink-0 no-print">
            <button
              (click)="navigateDay(-1)"
              title="Previous Day"
              class="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="relative">
              <input
                type="date"
                [ngModel]="currentDateStr()"
                (ngModelChange)="onDateChange($event)"
                class="px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              (click)="navigateDay(1)"
              [disabled]="isToday()"
              [class.opacity-40]="isToday()"
              title="Next Day"
              class="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              *ngIf="!isToday()"
              (click)="goToToday()"
              class="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-200">
              Today
            </button>
          </div>
        </div>
      </div>

      <!-- Financial Highlights Policy Ticker -->
      <app-financial-ticker
        *ngIf="digest()?.bankingKeyMetrics && digest()!.bankingKeyMetrics.length > 0"
        [metrics]="digest()!.bankingKeyMetrics">
      </app-financial-ticker>

      <!-- Category Filter Pills & Search Bar -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6 no-print space-y-3.5">
        <!-- Search & Exam Select -->
        <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div class="relative flex-grow">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
              placeholder="Search by keywords (e.g. RBI, Repo, MUDRA, SBI, SEBI, IMF)..."
              class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
            <button
              *ngIf="searchQuery"
              (click)="searchQuery = ''; applyFilters()"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Target Exam Filter Dropdown -->
          <div class="sm:w-56 flex-shrink-0">
            <select
              [(ngModel)]="selectedExamTag"
              (change)="applyFilters()"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All Banking & Insurance Exams</option>
              <option value="SbiPo">SBI PO & Clerk</option>
              <option value="IbpsPo">IBPS PO & Clerk</option>
              <option value="RbiGradeB">RBI Grade B & Assistant</option>
              <option value="LicAao">LIC AAO & Insurance</option>
              <option value="Nabard">NABARD Grade A</option>
            </select>
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <button
            (click)="selectCategory(null)"
            [class.bg-blue-600]="selectedCategoryId === null"
            [class.text-white]="selectedCategoryId === null"
            [class.bg-slate-100]="selectedCategoryId !== null"
            [class.text-slate-700]="selectedCategoryId !== null"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all hover:bg-blue-500 hover:text-white">
            All Categories ({{ totalItemsCount() }})
          </button>

          <button
            *ngFor="let cat of categories"
            (click)="selectCategory(cat.id)"
            [class.bg-blue-600]="selectedCategoryId === cat.id"
            [class.text-white]="selectedCategoryId === cat.id"
            [class.bg-slate-100]="selectedCategoryId !== cat.id"
            [class.text-slate-700]="selectedCategoryId !== cat.id"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all hover:bg-blue-500 hover:text-white flex items-center space-x-1.5">
            <span>{{ langService.isHindi() ? cat.nameHi : cat.nameEn }}</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-16">
        <div class="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div class="text-sm font-medium text-slate-500">Loading daily notes for {{ currentDateStr() }}...</div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && errorMessage" class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-6">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-rose-900 mb-1">{{ errorMessage }}</h3>
        <p class="text-xs text-rose-700 mb-4">You can browse the calendar archive or trigger automated generation in the admin portal.</p>
        <div class="flex justify-center space-x-3">
          <a routerLink="/archive" class="px-4 py-2 rounded-xl bg-white border border-rose-200 text-xs font-bold text-rose-800 hover:bg-rose-50">
            Browse Archive
          </a>
          <a routerLink="/admin" class="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700">
            Open Admin & Generate
          </a>
        </div>
      </div>

      <!-- Current Affairs Articles List -->
      <div *ngIf="!isLoading && !errorMessage">
        <!-- Results Counter -->
        <div class="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <span>Showing <b>{{ filteredItems().length }}</b> banking current affairs notes</span>
          <span class="text-slate-400">Date: {{ currentDateStr() }}</span>
        </div>

        <!-- Empty Filter Results -->
        <div *ngIf="filteredItems().length === 0" class="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-sm font-bold text-slate-700 mb-1">No notes match your filter criteria</h3>
          <p class="text-xs text-slate-500 mb-3">Try clearing your search query or selecting "All Categories".</p>
          <button (click)="resetFilters()" class="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
            Clear Filters
          </button>
        </div>

        <!-- Cards -->
        <app-affair-card
          *ngFor="let item of filteredItems()"
          [item]="item">
        </app-affair-card>
      </div>
    </div>
  `
})
export class DailyDigestComponent implements OnInit {
  private service = inject(CurrentAffairsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  langService = inject(LanguageService);

  digest = signal<DailyDigest | null>(null);
  filteredItems = signal<CurrentAffairItem[]>([]);
  totalItemsCount = signal<number>(0);
  currentDateStr = signal<string>(this.formatDate(new Date()));

  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  selectedExamTag: string = 'All';
  searchQuery: string = '';

  isLoading: boolean = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadCategories();

    this.route.paramMap.subscribe(params => {
      const dateParam = params.get('date');
      if (dateParam) {
        this.currentDateStr.set(dateParam);
        this.loadDigestByDate(dateParam);
      } else {
        this.loadTodayDigest();
      }
    });
  }

  loadCategories(): void {
    this.service.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => console.warn('Could not load categories')
    });
  }

  loadTodayDigest(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.service.getTodayDigest().subscribe({
      next: (d) => {
        this.digest.set(d);
        this.currentDateStr.set(d.digestDate);
        this.totalItemsCount.set(d.items.length);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'No current affairs digest found for today yet.';
      }
    });
  }

  loadDigestByDate(dateStr: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.service.getDigestByDate(dateStr).subscribe({
      next: (d) => {
        this.digest.set(d);
        this.totalItemsCount.set(d.items.length);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = `No notes found for ${dateStr}.`;
      }
    });
  }

  selectCategory(catId: number | null): void {
    this.selectedCategoryId = catId;
    this.applyFilters();
  }

  applyFilters(): void {
    const current = this.digest();
    if (!current) {
      this.filteredItems.set([]);
      return;
    }

    let items = [...current.items];

    // Category filter
    if (this.selectedCategoryId !== null) {
      items = items.filter(i => i.categoryId === this.selectedCategoryId);
    }

    // Exam Tag filter
    if (this.selectedExamTag !== 'All') {
      items = items.filter(i => i.targetExams === this.selectedExamTag || i.targetExams === 'AllBanking');
    }

    // Search query filter
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.trim().toLowerCase();
      items = items.filter(i =>
        i.titleEn.toLowerCase().includes(q) ||
        i.titleHi.toLowerCase().includes(q) ||
        i.summaryEn.toLowerCase().includes(q) ||
        i.summaryHi.toLowerCase().includes(q) ||
        (i.bankingTakeawayEn && i.bankingTakeawayEn.toLowerCase().includes(q)) ||
        (i.keywordsList && i.keywordsList.some(k => k.toLowerCase().includes(q)))
      );
    }

    this.filteredItems.set(items);
  }

  resetFilters(): void {
    this.selectedCategoryId = null;
    this.selectedExamTag = 'All';
    this.searchQuery = '';
    this.applyFilters();
  }

  navigateDay(delta: number): void {
    const current = new Date(this.currentDateStr());
    current.setDate(current.getDate() + delta);
    const newDateStr = this.formatDate(current);
    this.onDateChange(newDateStr);
  }

  onDateChange(newDateStr: string): void {
    if (!newDateStr) return;
    this.currentDateStr.set(newDateStr);
    this.router.navigate(['/date', newDateStr]);
  }

  goToToday(): void {
    const todayStr = this.formatDate(new Date());
    this.currentDateStr.set(todayStr);
    this.router.navigate(['/']);
  }

  isToday(): boolean {
    return this.currentDateStr() === this.formatDate(new Date());
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
