import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CurrentAffairsService } from '../../core/services/current-affairs.service';
import { LanguageService } from '../../core/services/language.service';

interface CalendarDay {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasDigest: boolean;
}

@Component({
  selector: 'app-archive-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Top Title -->
      <div class="mb-8">
        <div class="flex items-center space-x-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
          <span class="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
          <span>Historical Archive & Revision</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Current Affairs Calendar & Archive
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Select any date from the interactive calendar or history list to study past banking notes.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Calendar Column -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
            <!-- Calendar Navigation -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-slate-900">
                {{ currentMonthName }} {{ currentYear }}
              </h2>
              <div class="flex items-center space-x-2">
                <button
                  (click)="changeMonth(-1)"
                  class="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  (click)="changeMonth(1)"
                  class="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Weekday Headers -->
            <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <!-- Calendar Days Grid -->
            <div class="grid grid-cols-7 gap-2">
              <div
                *ngFor="let day of calendarDays"
                (click)="onSelectDay(day)"
                [class.opacity-30]="!day.isCurrentMonth"
                [class.cursor-pointer]="day.hasDigest"
                [class.cursor-not-allowed]="!day.hasDigest"
                [class.bg-blue-50]="day.hasDigest"
                [class.border-blue-400]="day.hasDigest"
                [class.text-blue-900]="day.hasDigest"
                [class.font-bold]="day.hasDigest"
                [class.border-slate-100]="!day.hasDigest"
                [class.ring-2]="day.isToday"
                [class.ring-blue-600]="day.isToday"
                class="min-h-[70px] sm:min-h-[85px] p-2 border rounded-xl flex flex-col justify-between transition-all hover:scale-[1.02] relative group">
                <div class="flex items-center justify-between">
                  <span class="text-xs sm:text-sm">{{ day.dayNumber }}</span>
                  <span *ngIf="day.isToday" class="text-[9px] uppercase px-1 rounded bg-blue-600 text-white font-semibold">Today</span>
                </div>

                <div *ngIf="day.hasDigest" class="mt-auto">
                  <div class="flex items-center space-x-1 text-[10px] text-blue-700 font-medium">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span class="hidden sm:inline">Digest Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded bg-blue-50 border border-blue-400"></span>
                <span>Published Digest</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="w-3 h-3 rounded ring-2 ring-blue-600"></span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Available Dates List Sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
            <h3 class="text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span>Published Digests</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                {{ availableDates().length }} Total
              </span>
            </h3>

            <div *ngIf="isLoading" class="py-12 text-center text-slate-400 text-xs">
              Loading available dates...
            </div>

            <div *ngIf="!isLoading && availableDates().length === 0" class="py-8 text-center text-slate-400 text-xs">
              No historical digests found.
            </div>

            <div *ngIf="!isLoading" class="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              <div
                *ngFor="let dt of availableDates()"
                (click)="openDate(dt)"
                class="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between group">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    {{ getDay(dt) }}
                  </div>
                  <div>
                    <div class="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {{ formatDisplayDate(dt) }}
                    </div>
                    <div class="text-[11px] text-slate-400">Daily Current Affairs</div>
                  </div>
                </div>
                <svg class="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ArchiveCalendarComponent implements OnInit {
  private service = inject(CurrentAffairsService);
  private router = inject(Router);
  langService = inject(LanguageService);

  availableDates = signal<string[]>([]);
  isLoading = true;

  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];

  get currentMonthName(): string {
    return new Date(this.currentYear, this.currentMonth).toLocaleString('default', { month: 'long' });
  }

  ngOnInit(): void {
    this.fetchDates();
  }

  fetchDates(): void {
    this.isLoading = true;
    this.service.getArchiveDates().subscribe({
      next: (dates) => {
        this.availableDates.set(dates);
        this.buildCalendar();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  buildCalendar(): void {
    const datesSet = new Set(this.availableDates());
    const firstDayIndex = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];
    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(this.currentYear, this.currentMonth - 1, daysInPrevMonth - i);
      const str = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: str,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: str === todayStr,
        hasDigest: datesSet.has(str)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(this.currentYear, this.currentMonth, i);
      const str = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        date: d,
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: str === todayStr,
        hasDigest: datesSet.has(str)
      });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(this.currentYear, this.currentMonth + 1, i);
      const str = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr: str,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: str === todayStr,
        hasDigest: datesSet.has(str)
      });
    }

    this.calendarDays = days;
  }

  changeMonth(delta: number): void {
    this.currentMonth += delta;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.buildCalendar();
  }

  onSelectDay(day: CalendarDay): void {
    if (day.hasDigest) {
      this.openDate(day.dateStr);
    }
  }

  openDate(dateStr: string): void {
    this.router.navigate(['/date', dateStr]);
  }

  getDay(dateStr: string): string {
    return dateStr.split('-')[2];
  }

  formatDisplayDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
