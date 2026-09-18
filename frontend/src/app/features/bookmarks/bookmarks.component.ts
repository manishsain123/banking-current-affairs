import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BookmarkService } from '../../core/services/bookmark.service';
import { Bookmark } from '../../core/models/bookmark.model';
import { LanguageService } from '../../core/services/language.service';
import { AffairCardComponent } from '../daily-digest/components/affair-card.component';

@Component({
  selector: 'app-bookmarks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AffairCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center space-x-2 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span>High-Priority Revision Folder</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Current Affairs
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized revision deck for SBI PO, IBPS Clerk, and RBI Grade B examinations.
          </p>
        </div>

        <button
          (click)="triggerPrint()"
          class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center space-x-2 self-start sm:self-auto no-print">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span>Print / Save Revision Deck</span>
        </button>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 mb-6 no-print">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="applyFilter()"
            placeholder="Filter your saved notes..."
            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-16">
        <div class="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <div class="text-sm font-medium text-slate-500">Loading your saved revision notes...</div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredBookmarks().length === 0" class="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <div class="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7 fill-current" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1">No saved notes found</h3>
        <p class="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          While browsing daily current affairs, click the bookmark icon to save high-probability exam questions here for quick last-minute revision.
        </p>
        <a routerLink="/" class="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors">
          Browse Today's Notes
        </a>
      </div>

      <!-- Saved Cards -->
      <div *ngIf="!isLoading && filteredBookmarks().length > 0">
        <div class="text-xs text-slate-500 mb-4 px-1">
          <b>{{ filteredBookmarks().length }}</b> articles saved for exam revision
        </div>

        <div *ngFor="let b of filteredBookmarks()">
          <app-affair-card
            *ngIf="b.item"
            [item]="b.item"
            (bookmarkToggled)="onBookmarkToggled($event)">
          </app-affair-card>
        </div>
      </div>
    </div>
  `
})
export class BookmarksComponent implements OnInit {
  private bookmarkService = inject(BookmarkService);
  langService = inject(LanguageService);

  bookmarks = signal<Bookmark[]>([]);
  filteredBookmarks = signal<Bookmark[]>([]);
  isLoading = true;
  searchQuery: string = '';

  ngOnInit(): void {
    this.loadBookmarks();
  }

  loadBookmarks(): void {
    this.isLoading = true;
    this.bookmarkService.getUserBookmarks().subscribe({
      next: (data) => {
        this.bookmarks.set(data);
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    let list = [...this.bookmarks()];
    if (this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter(b =>
        b.item?.titleEn.toLowerCase().includes(q) ||
        b.item?.titleHi.toLowerCase().includes(q) ||
        b.item?.summaryEn.toLowerCase().includes(q)
      );
    }
    this.filteredBookmarks.set(list);
  }

  onBookmarkToggled(itemId: string): void {
    // Remove toggled item from list
    const updated = this.bookmarks().filter(b => b.itemId !== itemId);
    this.bookmarks.set(updated);
    this.applyFilter();
  }

  triggerPrint(): void {
    window.print();
  }
}
