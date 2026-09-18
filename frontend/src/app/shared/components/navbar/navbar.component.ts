import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LanguageService, LanguageMode } from '../../../core/services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800 no-print">
      <!-- Top Banking Sub-banner -->
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-1 text-xs text-blue-100 flex justify-between items-center tracking-wide border-b border-blue-800/40">
        <div class="flex items-center space-x-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
          <span class="font-bold text-amber-400 uppercase tracking-wider text-[11px]">Exam Scope:</span>
          <span class="text-slate-300 text-[11px] hidden sm:inline">SBI PO &bull; IBPS PO &bull; <b class="text-emerald-300">IBPS RRB PO/Clerk (Gramin Bank)</b> &bull; RBI Grade B &bull; NABARD &bull; LIC AAO</span>
        </div>
        <div class="flex items-center space-x-3 flex-shrink-0">
          <span class="text-slate-400 text-[11px] hidden md:inline">Daily Automation &#64; 5:00 AM IST</span>
          <button (click)="triggerPrint()" title="Print / Save as PDF" class="flex items-center space-x-1 hover:text-white transition-colors bg-blue-800/50 hover:bg-blue-700/60 px-2 py-0.5 rounded text-xs font-semibold text-blue-200">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>PDF / Print</span>
          </button>
        </div>
      </div>

      <!-- Main Navigation Bar -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Branding -->
          <div class="flex items-center space-x-3">
            <a routerLink="/" class="flex items-center space-x-2.5 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div class="font-black text-lg leading-tight tracking-tight flex items-center space-x-1.5">
                  <span class="text-white">Bank</span>
                  <span class="text-blue-400 font-extrabold">DCA</span>
                </div>
                <div class="text-[10px] text-slate-400 font-medium">Banking & Insurance Exam Hub</div>
              </div>
            </a>
          </div>

          <!-- Desktop Center Nav Links -->
          <nav class="hidden lg:flex items-center space-x-1">
            <a routerLink="/" routerLinkActive="bg-slate-800 text-blue-400 font-bold border border-slate-700/60" [routerLinkActiveOptions]="{exact: true}" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center space-x-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Today's Notes</span>
            </a>

            <a routerLink="/exam-zone" routerLinkActive="bg-indigo-900/80 text-indigo-200 font-bold border border-indigo-700" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white hover:bg-indigo-900/60 transition-all flex items-center space-x-1.5 bg-indigo-950/50 border border-indigo-800/40">
              <svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>Exam Target Zone</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold uppercase">AI MCQs</span>
            </a>

            <!-- Dedicated RRB & Agriculture Navigation Link -->
            <a routerLink="/rrb-agriculture" routerLinkActive="bg-emerald-950/80 text-emerald-200 font-bold border border-emerald-600" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-900/50 transition-all flex items-center space-x-1.5 bg-emerald-950/40 border border-emerald-800/40">
              <span>🌾</span>
              <span>RRB & Agriculture</span>
              <span class="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black uppercase">Special</span>
            </a>

            <a routerLink="/archive" routerLinkActive="bg-slate-800 text-blue-400 font-bold border border-slate-700/60" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center space-x-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Date Archive</span>
            </a>

            <a routerLink="/bookmarks" routerLinkActive="bg-slate-800 text-blue-400 font-bold border border-slate-700/60" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center space-x-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Saved / Revision</span>
            </a>

            <a routerLink="/admin" routerLinkActive="bg-slate-800 text-blue-400 font-bold border border-slate-700/60" class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center space-x-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Admin</span>
            </a>
          </nav>

          <!-- Right: Bilingual Toggle & Mobile Hamburger -->
          <div class="flex items-center space-x-2">
            <!-- Language Switcher Pill -->
            <div class="bg-slate-800 p-1 rounded-xl border border-slate-700/80 flex items-center space-x-1 shadow-inner">
              <button
                (click)="setLang('en')"
                [class.bg-blue-600]="langService.isEnglish()"
                [class.text-white]="langService.isEnglish()"
                [class.text-slate-400]="!langService.isEnglish()"
                class="px-2 py-1 text-xs font-bold rounded-lg transition-all hover:text-white"
                title="View in English">
                EN
              </button>
              <button
                (click)="setLang('hi')"
                [class.bg-blue-600]="langService.isHindi()"
                [class.text-white]="langService.isHindi()"
                [class.text-slate-400]="!langService.isHindi()"
                class="px-2 py-1 text-xs font-bold rounded-lg transition-all hover:text-white"
                title="हिंदी में देखें">
                हिंदी
              </button>
              <button
                (click)="setLang('dual')"
                [class.bg-blue-600]="langService.isDual()"
                [class.text-white]="langService.isDual()"
                [class.text-slate-400]="!langService.isDual()"
                class="px-2 py-1 text-xs font-bold rounded-lg transition-all hover:text-white flex items-center space-x-1"
                title="Dual View (English + हिंदी)">
                <span>Dual</span>
                <span class="text-[9px] opacity-80 font-normal">द्विभाषी</span>
              </button>
            </div>

            <!-- Mobile Hamburger Button -->
            <button
              (click)="isMobileMenuOpen = !isMobileMenuOpen"
              class="lg:hidden p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Toggle Menu">
              <svg *ngIf="!isMobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngIf="isMobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Dropdown Menu -->
        <div *ngIf="isMobileMenuOpen" class="lg:hidden py-3 border-t border-slate-800 space-y-1.5 pb-4">
          <a
            routerLink="/"
            (click)="isMobileMenuOpen = false"
            [routerLinkActiveOptions]="{exact: true}"
            routerLinkActive="bg-slate-800 text-blue-400 font-bold"
            class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
            📅 Today's Daily Notes
          </a>

          <a
            routerLink="/exam-zone"
            (click)="isMobileMenuOpen = false"
            routerLinkActive="bg-indigo-950 text-indigo-300 font-bold"
            class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-indigo-300 hover:bg-indigo-900/50 hover:text-white flex items-center justify-between">
            <span>🎯 Exam Target Zone (AI MCQs)</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black uppercase">Month-Wise</span>
          </a>

          <a
            routerLink="/rrb-agriculture"
            (click)="isMobileMenuOpen = false"
            routerLinkActive="bg-emerald-950 text-emerald-300 font-bold"
            class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-300 hover:bg-emerald-900/50 hover:text-white flex items-center justify-between">
            <span>🌾 RRB & Agriculture Special</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black uppercase">75% PSL Hub</span>
          </a>

          <a
            routerLink="/archive"
            (click)="isMobileMenuOpen = false"
            routerLinkActive="bg-slate-800 text-blue-400 font-bold"
            class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
            🗓️ Date Archive & Calendar
          </a>

          <a
            routerLink="/bookmarks"
            (click)="isMobileMenuOpen = false"
            routerLinkActive="bg-slate-800 text-blue-400 font-bold"
            class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
            ⭐ Saved Revision Deck
          </a>

          <a
            routerLink="/admin"
            (click)="isMobileMenuOpen = false"
            routerLinkActive="bg-slate-800 text-blue-400 font-bold"
            class="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white">
            ⚙️ Operations & Automation Admin
          </a>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  langService = inject(LanguageService);
  private router = inject(Router);

  isMobileMenuOpen = false;

  setLang(mode: LanguageMode): void {
    this.langService.setLanguage(mode);
  }

  triggerPrint(): void {
    window.print();
  }
}
