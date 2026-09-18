import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExamQuestionService } from '../../core/services/exam-question.service';
import { CurrentAffairsService } from '../../core/services/current-affairs.service';
import { ExpectedQuestion, MonthArchiveSummary } from '../../core/models/expected-question.model';
import { Category } from '../../core/models/category.model';
import { LanguageService } from '../../core/services/language.service';
import { DeepAnalysisCardComponent } from './components/deep-analysis-card.component';

@Component({
  selector: 'app-exam-zone',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DeepAnalysisCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Top Title Banner -->
      <div class="bg-gradient-to-r from-fintech-dark via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-slate-800 mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div class="flex items-center space-x-2 text-fintech-gold text-xs font-bold uppercase tracking-wider mb-2">
              <span class="w-2.5 h-2.5 rounded-full bg-fintech-gold animate-pulse"></span>
              <span>AI Exam-Level Analysis & Target Zone</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Expected Exam Questions & Deep Analysis
            </h1>
            <p class="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Synthesized specifically from monthly current affairs covering SBI PO, IBPS PO, IBPS RRB PO/Clerk, and RBI Grade B statement-based patterns with statutory banking concepts and examiner trap warnings.
            </p>
          </div>

          <!-- Score Card & AI Generator Action -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-shrink-0 no-print">
            <!-- Score Pill -->
            <div class="bg-slate-800/90 border border-slate-700/80 rounded-xl px-4 py-3 text-center w-full sm:w-auto shadow-sm">
              <div class="text-[11px] text-slate-400 uppercase font-semibold">Your Accuracy</div>
              <div class="text-xl font-black text-fintech-gold">
                {{ userCorrectCount() }}/{{ userAttemptedCount() }}
                <span class="text-xs font-medium text-slate-400">({{ getAccuracy() }}%)</span>
              </div>
            </div>

            <!-- Trigger AI Month Generator -->
            <button
              (click)="triggerAiGeneration()"
              [disabled]="isGenerating"
              class="px-5 py-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 w-full sm:w-auto disabled:opacity-50">
              <svg *ngIf="isGenerating" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg *ngIf="!isGenerating" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span>{{ isGenerating ? 'AI Generating Questions...' : 'Run Month AI Analysis' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Month Selector & Filters Bar -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 mb-8 no-print space-y-4">
        <!-- Month Selector Pills -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Select Month:</span>
            <div class="flex items-center space-x-1.5 overflow-x-auto">
              <button
                *ngFor="let m of availableMonths()"
                (click)="selectMonth(m.monthYear)"
                [class.bg-slate-900]="selectedMonthYear() === m.monthYear"
                [class.text-white]="selectedMonthYear() === m.monthYear"
                [class.bg-slate-100]="selectedMonthYear() !== m.monthYear"
                [class.text-slate-700]="selectedMonthYear() !== m.monthYear"
                class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all hover:bg-slate-800 hover:text-white flex items-center space-x-1.5">
                <span>{{ m.monthYearDisplay }}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full"
                  [class.bg-slate-700]="selectedMonthYear() === m.monthYear"
                  [class.bg-slate-200]="selectedMonthYear() !== m.monthYear">
                  {{ m.questionCount }}
                </span>
              </button>
            </div>
          </div>

          <button
            (click)="triggerPrint()"
            class="text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center space-x-1">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Question Paper</span>
          </button>
        </div>

        <!-- Target Group Vertical Filter Pills -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100 pb-3">
          <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Exam Vertical:</span>
          
          <button
            (click)="selectTargetGroup('All')"
            [class.bg-slate-900]="selectedTargetGroup === 'All'"
            [class.text-white]="selectedTargetGroup === 'All'"
            [class.bg-slate-100]="selectedTargetGroup !== 'All'"
            [class.text-slate-700]="selectedTargetGroup !== 'All'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all hover:bg-slate-800 hover:text-white">
            All Verticals
          </button>

          <button
            (click)="selectTargetGroup('RRB_Agriculture')"
            [class.bg-emerald-700]="selectedTargetGroup === 'RRB_Agriculture'"
            [class.text-white]="selectedTargetGroup === 'RRB_Agriculture'"
            [class.bg-emerald-50]="selectedTargetGroup !== 'RRB_Agriculture'"
            [class.text-emerald-800]="selectedTargetGroup !== 'RRB_Agriculture'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-emerald-300 hover:bg-emerald-700 hover:text-white flex items-center space-x-1">
            <span>🌾 RRB & Agriculture (75% PSL)</span>
          </button>

          <button
            (click)="selectTargetGroup('CommercialBanks')"
            [class.bg-blue-800]="selectedTargetGroup === 'CommercialBanks'"
            [class.text-white]="selectedTargetGroup === 'CommercialBanks'"
            [class.bg-blue-50]="selectedTargetGroup !== 'CommercialBanks'"
            [class.text-blue-800]="selectedTargetGroup !== 'CommercialBanks'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-blue-200 hover:bg-blue-800 hover:text-white flex items-center space-x-1">
            <span>🏛️ SBI & IBPS Commercial</span>
          </button>

          <button
            (click)="selectTargetGroup('Regulatory')"
            [class.bg-purple-800]="selectedTargetGroup === 'Regulatory'"
            [class.text-white]="selectedTargetGroup === 'Regulatory'"
            [class.bg-purple-50]="selectedTargetGroup !== 'Regulatory'"
            [class.text-purple-800]="selectedTargetGroup !== 'Regulatory'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-purple-200 hover:bg-purple-800 hover:text-white flex items-center space-x-1">
            <span>📜 RBI Grade B & Regulatory</span>
          </button>

          <button
            (click)="selectTargetGroup('Insurance')"
            [class.bg-amber-700]="selectedTargetGroup === 'Insurance'"
            [class.text-white]="selectedTargetGroup === 'Insurance'"
            [class.bg-amber-50]="selectedTargetGroup !== 'Insurance'"
            [class.text-amber-800]="selectedTargetGroup !== 'Insurance'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border border-amber-300 hover:bg-amber-700 hover:text-white flex items-center space-x-1">
            <span>🛡️ LIC & Insurance (IRDAI)</span>
          </button>
        </div>

        <!-- Filter Dropdowns -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Category Filter -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
            <select
              [(ngModel)]="selectedCategoryId"
              (change)="loadQuestions()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-fintech-navy">
              <option [ngValue]="null">All Categories</option>
              <option *ngFor="let cat of categories" [ngValue]="cat.id">
                {{ langService.isHindi() ? cat.nameHi : cat.nameEn }}
              </option>
            </select>
          </div>

          <!-- Question Type Filter -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 mb-1">Question Type</label>
            <select
              [(ngModel)]="selectedQuestionType"
              (change)="loadQuestions()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-fintech-navy">
              <option value="All">All Formats (Statement & Standard)</option>
              <option value="StatementBased">Statement-Based (RBI/SBI PO pattern)</option>
              <option value="StandardMCQ">Standard 5-Option MCQs</option>
            </select>
          </div>

          <!-- Difficulty Filter -->
          <div>
            <label class="block text-[11px] font-semibold text-slate-500 mb-1">Difficulty Level</label>
            <select
              [(ngModel)]="selectedDifficulty"
              (change)="loadQuestions()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-fintech-navy">
              <option value="All">All Difficulty Levels</option>
              <option value="Moderate">Moderate (Prelims / Clerk)</option>
              <option value="ExamLevel">Exam Level (SBI/IBPS PO Mains)</option>
              <option value="HardPhase2">Hard / Analytical (RBI Grade B Phase 2)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-16">
        <div class="inline-block w-8 h-8 border-4 border-fintech-navy border-t-transparent rounded-full animate-spin mb-3"></div>
        <div class="text-sm font-medium text-slate-500">Loading exam questions for {{ selectedMonthYear() }}...</div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && questions().length === 0" class="bg-white rounded-2xl p-12 text-center border border-slate-200 mb-8">
        <div class="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 class="text-base font-bold text-slate-800 mb-1">No questions found for {{ selectedMonthYear() }} under selected filter</h3>
        <p class="text-xs text-slate-500 mb-5 max-w-md mx-auto">
          Click the button below to generate exam-grade questions with AI, or try selecting "All Verticals".
        </p>
        <button
          (click)="triggerAiGeneration()"
          [disabled]="isGenerating"
          class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
          {{ isGenerating ? 'Analyzing with AI...' : 'Generate Questions with AI' }}
        </button>
      </div>

      <!-- Questions List -->
      <div *ngIf="!isLoading && questions().length > 0" class="space-y-6">
        <div class="text-xs text-slate-500 px-1 flex items-center justify-between">
          <span>Showing <b>{{ questions().length }}</b> expected questions for {{ selectedMonthYear() }}</span>
          <span class="text-fintech-navy font-bold">Click any option to verify your answer instantly</span>
        </div>

        <!-- Question Card -->
        <div
          *ngFor="let q of questions(); let i = index"
          class="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-6 transition-all hover:shadow-md break-inside-avoid">
          <!-- Card Header Badges -->
          <div class="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                Q{{ i + 1 }}
              </span>

              <!-- Target Group Vertical Chip -->
              <span *ngIf="q.examTargetGroup === 'RRB_Agriculture'" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                🌾 RRB Special
              </span>
              <span *ngIf="q.examTargetGroup === 'CommercialBanks' || !q.examTargetGroup" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                🏛️ Commercial Banks
              </span>
              <span *ngIf="q.examTargetGroup === 'Regulatory'" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
                📜 Regulatory
              </span>
              <span *ngIf="q.examTargetGroup === 'Insurance'" class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                🛡️ Insurance
              </span>

              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                {{ langService.isHindi() ? q.categoryNameHi : q.categoryNameEn }}
              </span>

              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                {{ q.questionType === 'StatementBased' ? 'Statement-Based' : 'Standard MCQ' }}
              </span>

              <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                [class.bg-rose-100]="q.difficultyLevel === 'HardPhase2'"
                [class.text-rose-800]="q.difficultyLevel === 'HardPhase2'"
                [class.bg-amber-100]="q.difficultyLevel === 'ExamLevel'"
                [class.text-amber-800]="q.difficultyLevel === 'ExamLevel'"
                [class.bg-emerald-100]="q.difficultyLevel === 'Moderate'"
                [class.text-emerald-800]="q.difficultyLevel === 'Moderate'">
                {{ q.difficultyLevel }}
              </span>

              <span class="text-[11px] text-slate-500 font-semibold">
                🎯 {{ q.targetExam }}
              </span>
            </div>

            <!-- Attempt Status Indicator -->
            <div *ngIf="userAnswers[q.id]" class="text-xs font-bold flex items-center space-x-1">
              <span *ngIf="userAnswers[q.id].isCorrect" class="text-emerald-600 flex items-center space-x-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Correct!</span>
              </span>
              <span *ngIf="!userAnswers[q.id].isCorrect" class="text-rose-600 flex items-center space-x-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <span>Incorrect</span>
              </span>
            </div>
          </div>

          <!-- Question Body -->
          <div class="mb-5">
            <div *ngIf="!langService.isHindi()" class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line">
              {{ q.questionEn }}
            </div>
            <div *ngIf="langService.isHindi()" class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed font-hindi whitespace-pre-line">
              {{ q.questionHi }}
            </div>
            <div *ngIf="langService.isDual() && q.questionHi" class="mt-2 text-xs sm:text-sm text-slate-600 font-hindi border-l-2 border-fintech-navy pl-3 py-1 bg-slate-50/80 rounded-r whitespace-pre-line">
              {{ q.questionHi }}
            </div>
          </div>

          <!-- Options List -->
          <div class="space-y-2.5 mb-5">
            <div
              *ngFor="let opt of (langService.isHindi() ? q.optionsHi : q.optionsEn); let optIndex = index"
              (click)="selectOption(q, getOptionLetter(optIndex))"
              [class.cursor-pointer]="!userAnswers[q.id]"
              [class.bg-emerald-50]="isOptionCorrect(q, getOptionLetter(optIndex))"
              [class.border-emerald-500]="isOptionCorrect(q, getOptionLetter(optIndex))"
              [class.text-emerald-950]="isOptionCorrect(q, getOptionLetter(optIndex))"
              [class.bg-rose-50]="isOptionSelectedWrong(q, getOptionLetter(optIndex))"
              [class.border-rose-400]="isOptionSelectedWrong(q, getOptionLetter(optIndex))"
              [class.text-rose-950]="isOptionSelectedWrong(q, getOptionLetter(optIndex))"
              [class.hover:bg-slate-50]="!userAnswers[q.id]"
              [class.hover:border-slate-300]="!userAnswers[q.id]"
              class="p-3 sm:p-3.5 rounded-xl border border-slate-200 transition-all flex items-start space-x-3 text-xs sm:text-sm font-medium">
              <span
                class="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0"
                [class.bg-emerald-600]="isOptionCorrect(q, getOptionLetter(optIndex))"
                [class.text-white]="isOptionCorrect(q, getOptionLetter(optIndex))"
                [class.bg-rose-600]="isOptionSelectedWrong(q, getOptionLetter(optIndex))"
                [class.text-white]="isOptionSelectedWrong(q, getOptionLetter(optIndex))"
                [class.bg-slate-100]="!userAnswers[q.id]"
                [class.text-slate-700]="!userAnswers[q.id]">
                {{ getOptionLetter(optIndex) }}
              </span>
              <div class="flex-grow pt-0.5">
                <span>{{ opt }}</span>
                <div *ngIf="langService.isDual() && q.optionsHi[optIndex]" class="text-[11px] text-slate-500 font-hindi mt-0.5">
                  {{ q.optionsHi[optIndex] }}
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Actions: Toggle Explanation & Deep Analysis -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 no-print">
            <button
              (click)="toggleExpanded(q.id)"
              class="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1">
              <span>{{ expandedQuestions[q.id] ? 'Hide Detailed Analysis & Explanation' : 'View Deep Analysis & Explanation' }}</span>
              <svg class="w-4 h-4 transform transition-transform" [class.rotate-180]="expandedQuestions[q.id]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <span *ngIf="userAnswers[q.id]" class="text-xs text-slate-400">
              Answer: <b class="text-emerald-700">Option {{ q.correctAnswer }}</b>
            </span>
          </div>

          <!-- Detailed Explanation & Deep Analysis Card -->
          <div *ngIf="expandedQuestions[q.id]" class="mt-4 pt-4 border-t border-slate-100">
            <!-- Explanation Box -->
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-3">
              <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
                <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Answer Explanation & Key Takeaway (Correct: Option {{ q.correctAnswer }})</span>
              </div>
              <div class="text-xs sm:text-sm text-slate-700 leading-relaxed">
                <div *ngIf="!langService.isHindi()">{{ q.explanationEn }}</div>
                <div *ngIf="langService.isHindi()" class="font-hindi">{{ q.explanationHi }}</div>
                <div *ngIf="langService.isDual() && q.explanationHi" class="mt-2 text-xs text-slate-600 font-hindi border-l-2 border-emerald-500 pl-2.5 py-0.5">
                  {{ q.explanationHi }}
                </div>
              </div>
            </div>

            <!-- Deep Analysis Component -->
            <app-deep-analysis-card [question]="q"></app-deep-analysis-card>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ExamZoneComponent implements OnInit {
  private examService = inject(ExamQuestionService);
  private currentAffairsService = inject(CurrentAffairsService);
  langService = inject(LanguageService);

  availableMonths = signal<MonthArchiveSummary[]>([]);
  questions = signal<ExpectedQuestion[]>([]);
  selectedMonthYear = signal<string>(this.formatCurrentMonthYear());

  categories: Category[] = [];
  selectedCategoryId: number | null = null;
  selectedQuestionType: string = 'All';
  selectedDifficulty: string = 'All';
  selectedTargetGroup: string = 'All';

  isLoading = true;
  isGenerating = false;

  expandedQuestions: { [id: string]: boolean } = {};
  userAnswers: { [id: string]: { selected: string; isCorrect: boolean } } = {};

  userAttemptedCount = signal<number>(0);
  userCorrectCount = signal<number>(0);

  ngOnInit(): void {
    this.loadCategories();
    this.loadMonths();
  }

  loadCategories(): void {
    this.currentAffairsService.getCategories().subscribe({
      next: (cats) => this.categories = cats,
      error: () => console.warn('Could not load categories')
    });
  }

  loadMonths(): void {
    this.examService.getAvailableMonths().subscribe({
      next: (months) => {
        this.availableMonths.set(months);
        if (months.length > 0) {
          const withQuestions = months.find(m => m.questionCount > 0);
          const target = withQuestions ? withQuestions.monthYear : months[0].monthYear;
          this.selectedMonthYear.set(target);
          this.loadQuestions();
        } else {
          this.loadQuestions();
        }
      },
      error: () => this.loadQuestions()
    });
  }

  selectTargetGroup(group: string): void {
    this.selectedTargetGroup = group;
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.isLoading = true;
    this.examService.getQuestions(
      this.selectedMonthYear(),
      this.selectedCategoryId ?? undefined,
      this.selectedDifficulty,
      this.selectedQuestionType,
      this.selectedTargetGroup
    ).subscribe({
      next: (items) => {
        this.questions.set(items);
        this.isLoading = false;
      },
      error: () => {
        this.questions.set([]);
        this.isLoading = false;
      }
    });
  }

  selectMonth(my: string): void {
    this.selectedMonthYear.set(my);
    this.loadQuestions();
  }

  triggerAiGeneration(): void {
    this.isGenerating = true;
    this.examService.generateMonthQuestions({
      monthYear: this.selectedMonthYear()
    }).subscribe({
      next: (res) => {
        this.isGenerating = false;
        this.loadMonths();
        this.loadQuestions();
      },
      error: (err: any) => {
        this.isGenerating = false;
        alert('Failed to generate questions: ' + (err?.message || err));
      }
    });
  }

  selectOption(q: ExpectedQuestion, optionLetter: string): void {
    if (this.userAnswers[q.id]) return; // already answered

    const isCorrect = q.correctAnswer.trim().toUpperCase() === optionLetter.trim().toUpperCase();
    this.userAnswers[q.id] = { selected: optionLetter, isCorrect };

    this.userAttemptedCount.update(c => c + 1);
    if (isCorrect) {
      this.userCorrectCount.update(c => c + 1);
    }

    this.expandedQuestions[q.id] = true;
  }

  isOptionCorrect(q: ExpectedQuestion, optionLetter: string): boolean {
    const ans = this.userAnswers[q.id];
    if (!ans) return false;
    return q.correctAnswer.trim().toUpperCase() === optionLetter.trim().toUpperCase();
  }

  isOptionSelectedWrong(q: ExpectedQuestion, optionLetter: string): boolean {
    const ans = this.userAnswers[q.id];
    if (!ans) return false;
    return ans.selected === optionLetter && !ans.isCorrect;
  }

  getOptionLetter(index: number): string {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    return letters[index] || 'A';
  }

  toggleExpanded(id: string): void {
    this.expandedQuestions[id] = !this.expandedQuestions[id];
  }

  getAccuracy(): number {
    const att = this.userAttemptedCount();
    if (att === 0) return 0;
    return Math.round((this.userCorrectCount() / att) * 100);
  }

  triggerPrint(): void {
    window.print();
  }

  private formatCurrentMonthYear(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
