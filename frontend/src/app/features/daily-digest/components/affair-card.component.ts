import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentAffairItem } from '../../../core/models/current-affair.model';
import { LanguageService } from '../../../core/services/language.service';
import { BookmarkService } from '../../../core/services/bookmark.service';

@Component({
  selector: 'app-affair-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-200/90 transition-all p-5 md:p-6 mb-5 break-inside-avoid relative group">
      <!-- Top Badges & Meta Header -->
      <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Exam Target Group Chip -->
          <span
            *ngIf="item.examTargetGroup === 'RRB_Agriculture' || item.targetExams?.includes('Rrb')"
            class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span>🌾</span>
            <span>RRB & Agri Special</span>
          </span>

          <span
            *ngIf="item.examTargetGroup === 'Regulatory' || item.targetExams?.includes('Rbi')"
            class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
            <span>📜</span>
            <span>Regulatory Bodies</span>
          </span>

          <span
            *ngIf="item.examTargetGroup === 'Insurance' || item.targetExams?.includes('Lic')"
            class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span>🛡️</span>
            <span>Insurance Exam</span>
          </span>

          <span
            *ngIf="(!item.examTargetGroup || item.examTargetGroup === 'CommercialBanks') && !item.targetExams?.includes('Rrb') && !item.targetExams?.includes('Lic')"
            class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span>🏛️</span>
            <span>Commercial Banks</span>
          </span>

          <!-- Category Badge -->
          <span class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <span>{{ isCardHindi ? item.categoryNameHi : item.categoryNameEn }}</span>
          </span>

          <!-- Importance Level Badge -->
          <span
            [class.bg-rose-50]="item.importance === 'MustRead' || item.importance === 'PreviousYearsPattern'"
            [class.text-rose-700]="item.importance === 'MustRead' || item.importance === 'PreviousYearsPattern'"
            [class.border-rose-300]="item.importance === 'MustRead' || item.importance === 'PreviousYearsPattern'"
            [class.bg-amber-50]="item.importance === 'High'"
            [class.text-amber-700]="item.importance === 'High'"
            [class.border-amber-300]="item.importance === 'High'"
            [class.bg-slate-50]="item.importance === 'Standard'"
            [class.text-slate-600]="item.importance === 'Standard'"
            [class.border-slate-200]="item.importance === 'Standard'"
            class="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border">
            {{ item.importance === 'MustRead' ? '★ Must Read' : (item.importance === 'PreviousYearsPattern' ? 'PYQ High Frequency' : item.importance) }}
          </span>

          <!-- Target Exam Badge -->
          <span class="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
            🎯 {{ formatExamTag(item.targetExams) }}
          </span>
        </div>

        <!-- Action Controls: In-Card Language Toggle, Speech, Bookmark -->
        <div class="flex items-center space-x-1 no-print">
          <!-- In-Card Quick Language Flip -->
          <button
            (click)="toggleCardLanguage()"
            [title]="isCardHindi ? 'Switch card to English' : 'इस कार्ड को हिंदी में देखें'"
            class="px-2 py-1 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors">
            {{ isCardHindi ? 'EN' : 'हिंदी' }}
          </button>

          <!-- Text-to-Speech Audio Button -->
          <button
            (click)="speakText()"
            [title]="isSpeaking ? 'Stop Reading' : 'Listen to Article (Audio)'"
            class="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <svg *ngIf="!isSpeaking" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <svg *ngIf="isSpeaking" class="w-4 h-4 text-rose-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>

          <!-- Bookmark Toggle Button -->
          <button
            (click)="onToggleBookmark()"
            [title]="bookmarkService.isBookmarked(item.id) ? 'Remove from Saved Deck' : 'Save for Revision Deck'"
            class="p-2 rounded-lg transition-colors"
            [class.text-amber-500]="bookmarkService.isBookmarked(item.id)"
            [class.bg-amber-50]="bookmarkService.isBookmarked(item.id)"
            [class.text-slate-400]="!bookmarkService.isBookmarked(item.id)"
            [class.hover:text-amber-500]="!bookmarkService.isBookmarked(item.id)"
            [class.hover:bg-amber-50]="!bookmarkService.isBookmarked(item.id)">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Headline -->
      <div class="mb-3">
        <h2 *ngIf="!isCardHindi" class="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
          {{ item.titleEn }}
        </h2>
        <h2 *ngIf="isCardHindi" class="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug font-hindi">
          {{ item.titleHi }}
        </h2>
        <!-- Dual View Subtitle -->
        <div *ngIf="langService.isDual() && item.titleHi && !isCardHindi" class="mt-1 text-sm sm:text-base font-semibold text-slate-600 font-hindi">
          {{ item.titleHi }}
        </div>
      </div>

      <!-- Overview Summary -->
      <div class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
        <p *ngIf="!isCardHindi" class="mb-2">
          {{ item.summaryEn }}
        </p>
        <p *ngIf="isCardHindi" class="mb-2 font-hindi text-slate-800">
          {{ item.summaryHi }}
        </p>
        <!-- Dual View Secondary Paragraph -->
        <p *ngIf="langService.isDual() && item.summaryHi && !isCardHindi" class="text-xs sm:text-sm text-slate-600 font-hindi border-l-2 border-blue-400 pl-3 py-1 bg-slate-50/70 rounded-r">
          {{ item.summaryHi }}
        </p>
      </div>

      <!-- Key Exam Bullet Points -->
      <div class="mb-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
          <span>{{ isCardHindi ? 'मुख्य परीक्षा बिंदु (Exam High-Yield Facts)' : 'Key Exam Bullet Points' }}</span>
        </h4>

        <!-- English Bullet points -->
        <ul *ngIf="!isCardHindi" class="space-y-2 text-xs sm:text-sm text-slate-700">
          <li *ngFor="let pt of item.bulletPointsEn" class="flex items-start space-x-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
            <span>{{ pt }}</span>
          </li>
        </ul>

        <!-- Hindi Bullet points -->
        <ul *ngIf="isCardHindi" class="space-y-2 text-xs sm:text-sm text-slate-700 font-hindi">
          <li *ngFor="let pt of item.bulletPointsHi" class="flex items-start space-x-2">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0"></span>
            <span>{{ pt }}</span>
          </li>
        </ul>

        <!-- Dual View Hindi Bullet Points (compact display) -->
        <div *ngIf="langService.isDual() && item.bulletPointsHi && item.bulletPointsHi.length > 0 && !isCardHindi" class="mt-3 pt-3 border-t border-slate-200/70">
          <span class="text-[11px] font-semibold text-slate-400 block mb-1 font-hindi">हिंदी मुख्य बिंदु:</span>
          <ul class="space-y-1.5 text-xs text-slate-600 font-hindi">
            <li *ngFor="let pt of item.bulletPointsHi" class="flex items-start space-x-2">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
              <span>{{ pt }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Banking & Financial Exam Takeaway Callout Box -->
      <div *ngIf="item.bankingTakeawayEn || item.bankingTakeawayHi" class="bg-gradient-to-r from-amber-50/90 to-orange-50/50 border-l-4 border-amber-500 p-3.5 rounded-r-2xl mb-3 text-xs sm:text-sm">
        <div class="flex items-center space-x-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider mb-1">
          <svg class="w-4 h-4 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
          <span>Banking Exam Takeaway / परीक्षा विशेष तथ्य</span>
        </div>
        <div *ngIf="!isCardHindi" class="text-amber-950 font-medium leading-relaxed">
          {{ item.bankingTakeawayEn }}
        </div>
        <div *ngIf="isCardHindi" class="text-amber-950 font-medium leading-relaxed font-hindi">
          {{ item.bankingTakeawayHi }}
        </div>
        <div *ngIf="langService.isDual() && item.bankingTakeawayHi && !isCardHindi" class="text-xs text-amber-900/80 mt-1 font-hindi">
          {{ item.bankingTakeawayHi }}
        </div>
      </div>

      <!-- Static GK & Statutory Fact Box -->
      <div *ngIf="item.staticGkFactEn || item.staticGkFactHi" class="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 mb-4 text-xs text-slate-700 flex items-start space-x-2.5">
        <div class="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
          GK
        </div>
        <div>
          <span class="font-bold text-indigo-950">Static Banking GK Fact: </span>
          <span *ngIf="!isCardHindi">{{ item.staticGkFactEn }}</span>
          <span *ngIf="isCardHindi" class="font-hindi">{{ item.staticGkFactHi }}</span>
          <div *ngIf="langService.isDual() && item.staticGkFactHi && !isCardHindi" class="text-[11px] text-slate-600 font-hindi mt-0.5">
            {{ item.staticGkFactHi }}
          </div>
        </div>
      </div>

      <!-- Bottom Card Footer: Tags & Sourcing -->
      <div class="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-slate-400 font-medium">Keywords:</span>
          <span *ngFor="let kw of item.keywordsList" class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
            #{{ kw }}
          </span>
        </div>

        <div class="flex items-center space-x-3">
          <span *ngIf="item.sourceName" class="italic text-slate-400">
            Source: {{ item.sourceName }}
          </span>
          <a *ngIf="item.sourceUrl" [href]="item.sourceUrl" target="_blank" rel="noopener" class="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-0.5 no-print">
            <span>Read Original</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  `
})
export class AffairCardComponent {
  @Input({ required: true }) item!: CurrentAffairItem;
  @Output() bookmarkToggled = new EventEmitter<string>();

  langService = inject(LanguageService);
  bookmarkService = inject(BookmarkService);

  isSpeaking = false;
  cardLocalLang: 'default' | 'en' | 'hi' = 'default';

  get isCardHindi(): boolean {
    if (this.cardLocalLang === 'hi') return true;
    if (this.cardLocalLang === 'en') return false;
    return this.langService.isHindi();
  }

  toggleCardLanguage(): void {
    if (this.cardLocalLang === 'default') {
      this.cardLocalLang = this.langService.isHindi() ? 'en' : 'hi';
    } else {
      this.cardLocalLang = this.cardLocalLang === 'hi' ? 'en' : 'hi';
    }
  }

  onToggleBookmark(): void {
    this.bookmarkService.toggleBookmark(this.item.id).subscribe({
      next: () => this.bookmarkToggled.emit(this.item.id)
    });
  }

  speakText(): void {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (this.isSpeaking) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      return;
    }

    const textToSpeak = this.isCardHindi
      ? `${this.item.titleHi}. ${this.item.summaryHi}`
      : `${this.item.titleEn}. ${this.item.summaryEn}`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = this.isCardHindi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      this.isSpeaking = false;
    };
    utterance.onerror = () => {
      this.isSpeaking = false;
    };

    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  formatExamTag(tag: string): string {
    if (!tag || tag === 'AllBanking') return 'All Banking & Insurance';
    if (tag === 'SbiPo') return 'SBI PO / Clerk';
    if (tag === 'IbpsPo') return 'IBPS PO';
    if (tag === 'IbpsRrb' || tag === 'IbpsRrbPo' || tag === 'IbpsRrbClerk') return 'IBPS RRB PO / Clerk';
    if (tag === 'RbiGradeB') return 'RBI Grade B / Assistant';
    if (tag === 'LicAao') return 'LIC AAO / Insurance';
    if (tag === 'Nabard') return 'NABARD Grade A';
    if (tag === 'CommercialBanks') return 'Commercial Banks';
    if (tag === 'RegulatoryBodies') return 'Regulatory Bodies';
    if (tag === 'InsuranceSpecial') return 'Insurance Special';
    return tag;
  }
}
