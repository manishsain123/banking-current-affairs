import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpectedQuestion } from '../../../core/models/expected-question.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-deep-analysis-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-blue-50/50 p-4 sm:p-5 text-slate-800 shadow-sm">
      <!-- Section Header -->
      <div class="flex items-center space-x-2 text-indigo-900 font-bold text-xs uppercase tracking-wider mb-3">
        <svg class="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span>
          {{ langService.isHindi() ? 'गहन पृष्ठभूमि विश्लेषण और स्थैतिक बैंकिंग लिंक' : 'Deep Background Analysis & Static Banking Context' }}
        </span>
      </div>

      <!-- Deep Analysis Rationale -->
      <div class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-3.5">
        <div *ngIf="!langService.isHindi()">
          {{ question.deepAnalysisEn }}
        </div>
        <div *ngIf="langService.isHindi()" class="font-hindi">
          {{ question.deepAnalysisHi }}
        </div>
        <div *ngIf="langService.isDual() && question.deepAnalysisHi" class="mt-2 text-xs text-slate-600 font-hindi border-l-2 border-indigo-400 pl-2.5 bg-white/60 py-1 rounded-r">
          {{ question.deepAnalysisHi }}
        </div>
      </div>

      <!-- Static Banking Concept Link -->
      <div *ngIf="question.staticConceptLinkEn || question.staticConceptLinkHi" class="mb-3 bg-white/80 border border-indigo-200/80 rounded-lg p-3 flex items-start space-x-2.5">
        <div class="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
          §
        </div>
        <div class="text-xs text-slate-700">
          <span class="font-bold text-indigo-950">
            {{ langService.isHindi() ? 'संबद्ध स्थैतिक बैंकिंग अवधारणा / अधिनियम:' : 'Static Banking Concept / Statutory Link:' }}
          </span>
          <span *ngIf="!langService.isHindi()"> {{ question.staticConceptLinkEn }}</span>
          <span *ngIf="langService.isHindi()" class="font-hindi"> {{ question.staticConceptLinkHi }}</span>
          <div *ngIf="langService.isDual() && question.staticConceptLinkHi" class="text-[11px] text-slate-500 font-hindi mt-0.5">
            {{ question.staticConceptLinkHi }}
          </div>
        </div>
      </div>

      <!-- Examiner Trap Warning Box -->
      <div *ngIf="question.examinerTrapWarningEn || question.examinerTrapWarningHi" class="bg-amber-50/90 border border-amber-300 rounded-lg p-3 flex items-start space-x-2.5">
        <div class="w-5 h-5 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
          ⚠️
        </div>
        <div class="text-xs text-amber-900">
          <span class="font-bold text-amber-950">
            {{ langService.isHindi() ? 'परीक्षक की चाल (सामान्य भ्रम):' : 'Examiner Trap Warning (Common Confusion):' }}
          </span>
          <span *ngIf="!langService.isHindi()"> {{ question.examinerTrapWarningEn }}</span>
          <span *ngIf="langService.isHindi()" class="font-hindi"> {{ question.examinerTrapWarningHi }}</span>
          <div *ngIf="langService.isDual() && question.examinerTrapWarningHi" class="text-[11px] text-amber-800 font-hindi mt-0.5">
            {{ question.examinerTrapWarningHi }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeepAnalysisCardComponent {
  @Input({ required: true }) question!: ExpectedQuestion;
  langService = inject(LanguageService);
}
