import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CurrentAffairsService } from '../../core/services/current-affairs.service';
import { ExamQuestionService } from '../../core/services/exam-question.service';
import { CurrentAffairItem } from '../../core/models/current-affair.model';
import { ExpectedQuestion } from '../../core/models/expected-question.model';
import { LanguageService } from '../../core/services/language.service';
import { BookmarkService } from '../../core/services/bookmark.service';
import { AffairCardComponent } from '../daily-digest/components/affair-card.component';
import { DeepAnalysisCardComponent } from '../exam-zone/components/deep-analysis-card.component';

@Component({
  selector: 'app-rrb-agriculture',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AffairCardComponent, DeepAnalysisCardComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- RRB Header Banner -->
      <div class="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 mb-8 relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <svg class="w-80 h-80 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div class="relative z-10">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1.5">
              <span>🌾</span>
              <span>Dedicated Exam Hub</span>
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              IBPS RRB PO &bull; RRB Clerk &bull; NABARD Grade A
            </span>
          </div>

          <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            RRB & Agriculture Banking Special
          </h1>
          <p class="text-xs sm:text-sm text-emerald-100/80 max-w-3xl leading-relaxed mb-6">
            Comprehensive coverage of Regional Rural Banks (RRBs), NABARD policy directives, Priority Sector Lending (75% RRB quota), Kisan Credit Card (KCC), PACS digitalization, and rural economic schemes.
          </p>

          <!-- Rapid Rural Banking Metrics -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            <div class="bg-slate-900/80 border border-emerald-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">RRB PSL Target</div>
              <div class="text-lg sm:text-xl font-black text-white mt-0.5">75%</div>
              <div class="text-[10px] text-slate-400">of ANBC (vs 40% SCBs)</div>
            </div>

            <div class="bg-slate-900/80 border border-emerald-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Agri Sub-Target</div>
              <div class="text-lg sm:text-xl font-black text-white mt-0.5">54%</div>
              <div class="text-[10px] text-slate-400">Total agriculture lending</div>
            </div>

            <div class="bg-slate-900/80 border border-emerald-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Shareholding</div>
              <div class="text-lg sm:text-xl font-black text-white mt-0.5">50:15:35</div>
              <div class="text-[10px] text-slate-400">Center : State : Sponsor</div>
            </div>

            <div class="bg-slate-900/80 border border-emerald-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">KCC Net Rate</div>
              <div class="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">4.0% p.a.</div>
              <div class="text-[10px] text-slate-400">3% Prompt Repayment</div>
            </div>

            <div class="bg-slate-900/80 border border-emerald-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">First RRB</div>
              <div class="text-sm sm:text-base font-black text-amber-300 mt-0.5">Prathama Bank</div>
              <div class="text-[10px] text-slate-400">2 Oct 1975, Moradabad</div>
            </div>

            <div class="bg-slate-900/80 border border-emerald-800/60 rounded-xl p-3 backdrop-blur-sm">
              <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active RRBs</div>
              <div class="text-lg sm:text-xl font-black text-white mt-0.5">43 Banks</div>
              <div class="text-[10px] text-slate-400">Post-amalgamation</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation Switcher -->
      <div class="flex items-center space-x-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1 no-print">
        <button
          (click)="activeTab = 'notes'"
          [class.border-emerald-600]="activeTab === 'notes'"
          [class.text-emerald-700]="activeTab === 'notes'"
          [class.font-bold]="activeTab === 'notes'"
          [class.border-transparent]="activeTab !== 'notes'"
          [class.text-slate-500]="activeTab !== 'notes'"
          class="px-4 py-2.5 border-b-2 text-sm whitespace-nowrap transition-all hover:text-emerald-600 flex items-center space-x-2">
          <span>📰</span>
          <span>RRB & Agriculture Current Affairs ({{ rrbItems.length }})</span>
        </button>

        <button
          (click)="activeTab = 'questions'"
          [class.border-emerald-600]="activeTab === 'questions'"
          [class.text-emerald-700]="activeTab === 'questions'"
          [class.font-bold]="activeTab === 'questions'"
          [class.border-transparent]="activeTab !== 'questions'"
          [class.text-slate-500]="activeTab !== 'questions'"
          class="px-4 py-2.5 border-b-2 text-sm whitespace-nowrap transition-all hover:text-emerald-600 flex items-center space-x-2">
          <span>🎯</span>
          <span>Exam Expected Questions ({{ rrbQuestions.length }})</span>
        </button>

        <button
          (click)="activeTab = 'cheatsheet'"
          [class.border-emerald-600]="activeTab === 'cheatsheet'"
          [class.text-emerald-700]="activeTab === 'cheatsheet'"
          [class.font-bold]="activeTab === 'cheatsheet'"
          [class.border-transparent]="activeTab !== 'cheatsheet'"
          [class.text-slate-500]="activeTab !== 'cheatsheet'"
          class="px-4 py-2.5 border-b-2 text-sm whitespace-nowrap transition-all hover:text-emerald-600 flex items-center space-x-2">
          <span>⚡</span>
          <span>Static Banking & Committee Cheat Sheet</span>
        </button>
      </div>

      <!-- TAB 1: RRB CURRENT AFFAIRS -->
      <div *ngIf="activeTab === 'notes'">
        <div *ngIf="isLoading" class="text-center py-16">
          <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <div class="text-sm font-medium text-slate-500">Loading RRB and rural agriculture updates...</div>
        </div>

        <div *ngIf="!isLoading && rrbItems.length === 0" class="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <div class="text-3xl mb-2">🌾</div>
          <h3 class="text-base font-bold text-slate-800">No RRB-specific items found for today</h3>
          <p class="text-xs text-slate-500 mt-1">Browse the Date Archive or take a look at the static cheat sheet.</p>
        </div>

        <div *ngIf="!isLoading && rrbItems.length > 0">
          <app-affair-card
            *ngFor="let item of rrbItems"
            [item]="item"
            (bookmarkToggled)="onBookmarkToggled($event)">
          </app-affair-card>
        </div>
      </div>

      <!-- TAB 2: RRB EXPECTED QUESTIONS -->
      <div *ngIf="activeTab === 'questions'">
        <div *ngIf="isLoadingQuestions" class="text-center py-16">
          <div class="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <div class="text-sm font-medium text-slate-500">Loading RRB & NABARD exam questions...</div>
        </div>

        <div *ngIf="!isLoadingQuestions && rrbQuestions.length === 0" class="bg-white rounded-2xl p-10 text-center border border-slate-200">
          <div class="text-3xl mb-2">📝</div>
          <h3 class="text-base font-bold text-slate-800">No expected questions synthesized for this group yet</h3>
          <p class="text-xs text-slate-500 mt-1">Visit the Exam Target Zone to run monthly AI synthesis.</p>
          <a routerLink="/exam-zone" class="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700">
            Open Exam Target Zone
          </a>
        </div>

        <div *ngIf="!isLoadingQuestions && rrbQuestions.length > 0" class="space-y-6">
          <div
            *ngFor="let q of rrbQuestions; let idx = index"
            class="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all">
            <!-- Question Header -->
            <div class="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
              <div class="flex items-center space-x-2">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  {{ idx + 1 }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {{ q.targetExam }}
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                  {{ q.difficultyLevel }}
                </span>
              </div>
              <span class="text-xs text-slate-400 font-medium">{{ q.monthYearDisplay }}</span>
            </div>

            <!-- Question Text -->
            <div class="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-4 whitespace-pre-line">
              <div *ngIf="!langService.isHindi()">{{ q.questionEn }}</div>
              <div *ngIf="langService.isHindi()" class="font-hindi">{{ q.questionHi }}</div>
              <div *ngIf="langService.isDual() && q.questionHi" class="mt-2 text-xs sm:text-sm font-semibold text-slate-600 font-hindi border-l-2 border-emerald-400 pl-3 py-1 bg-slate-50 rounded-r">
                {{ q.questionHi }}
              </div>
            </div>

            <!-- 5 MCQ Options -->
            <div class="space-y-2 mb-4">
              <button
                *ngFor="let opt of (langService.isHindi() ? q.optionsHi : q.optionsEn); let optIdx = index"
                (click)="selectAnswer(q.id, getOptionLetter(optIdx))"
                [class.bg-emerald-50]="selectedAnswers[q.id] === getOptionLetter(optIdx) && q.correctAnswer === getOptionLetter(optIdx)"
                [class.border-emerald-500]="selectedAnswers[q.id] === getOptionLetter(optIdx) && q.correctAnswer === getOptionLetter(optIdx)"
                [class.bg-rose-50]="selectedAnswers[q.id] === getOptionLetter(optIdx) && q.correctAnswer !== getOptionLetter(optIdx)"
                [class.border-rose-400]="selectedAnswers[q.id] === getOptionLetter(optIdx) && q.correctAnswer !== getOptionLetter(optIdx)"
                [class.bg-slate-50]="selectedAnswers[q.id] !== getOptionLetter(optIdx)"
                [class.border-slate-200]="selectedAnswers[q.id] !== getOptionLetter(optIdx)"
                class="w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between">
                <span>{{ opt }}</span>
                <span *ngIf="selectedAnswers[q.id]" class="text-xs font-bold">
                  <span *ngIf="getOptionLetter(optIdx) === q.correctAnswer" class="text-emerald-600">✓ Correct</span>
                  <span *ngIf="selectedAnswers[q.id] === getOptionLetter(optIdx) && q.correctAnswer !== getOptionLetter(optIdx)" class="text-rose-600">✗ Your Choice</span>
                </span>
              </button>
            </div>

            <!-- Deep Analysis & Rationale (Visible after answering or toggled) -->
            <div *ngIf="selectedAnswers[q.id] || showExplanations[q.id]">
              <div class="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs sm:text-sm text-slate-800 mb-3">
                <div class="font-bold text-emerald-950 mb-1 flex items-center space-x-1.5">
                  <span class="text-emerald-700">✓ Correct Answer: Option {{ q.correctAnswer }}</span>
                </div>
                <p *ngIf="!langService.isHindi()" class="leading-relaxed">{{ q.explanationEn }}</p>
                <p *ngIf="langService.isHindi()" class="leading-relaxed font-hindi">{{ q.explanationHi }}</p>
                <p *ngIf="langService.isDual() && q.explanationHi" class="mt-2 text-xs text-slate-600 font-hindi border-l-2 border-emerald-400 pl-2">
                  {{ q.explanationHi }}
                </p>
              </div>

              <!-- Static Concept & Trap Warnings -->
              <app-deep-analysis-card [question]="q"></app-deep-analysis-card>
            </div>

            <div *ngIf="!selectedAnswers[q.id]" class="pt-2">
              <button
                (click)="showExplanations[q.id] = !showExplanations[q.id]"
                class="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors">
                {{ showExplanations[q.id] ? 'Hide Explanation' : 'View Answer & Explanation' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: STATIC RRB GK CHEAT SHEET -->
      <div *ngIf="activeTab === 'cheatsheet'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Card 1: Statutory RRB Background -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div class="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm mb-3">
              <span>🏛️</span>
              <span>Genesis & Legislative Origin</span>
            </div>
            <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>M. Narasimham Committee (1975)</b>: Recommended creation of rural commercial banks to combine local touch with commercial discipline.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>First RRB</b>: Prathama Bank (sponsored by Syndicate Bank, established on 2nd October 1975 at Moradabad, Uttar Pradesh).</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Governing Act</b>: Regional Rural Banks Act, 1976.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Regulatory Architecture</b>: Regulated by the Reserve Bank of India (RBI) and inspected/supervised by NABARD under Section 35(6) of Banking Regulation Act, 1949.</span>
              </li>
            </ul>
          </div>

          <!-- Card 2: Shareholding & Amalgamation -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div class="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm mb-3">
              <span>📊</span>
              <span>Capital Structure & Amalgamation</span>
            </div>
            <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Capital Subscription Ratio</b>: Central Government: <b>50%</b>, State Government: <b>15%</b>, Sponsor Bank: <b>35%</b>.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Amalgamation Path</b>: Count consolidated from 196 RRBs in 1990 down to 43 operational RRBs currently across India under 'One State, One RRB' initiative.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Capital Adequacy (CRAR)</b>: RRBs are mandated to maintain minimum 9% CRAR (Capital to Risk-Weighted Assets Ratio).</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>States without RRBs</b>: Goa and Sikkim are the only two states with no RRBs.</span>
              </li>
            </ul>
          </div>

          <!-- Card 3: Priority Sector Lending (PSL) Specifics -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div class="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm mb-3">
              <span>🎯</span>
              <span>Priority Sector Lending (PSL) Targets</span>
            </div>
            <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Total PSL Mandate</b>: <b>75%</b> of Adjusted Net Bank Credit (ANBC) or CEOBE (highest among all scheduled banks along with SFBs).</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Agriculture Sub-target</b>: <b>54%</b> of total credit dedicated to farm credit, agriculture infrastructure, and allied activities.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Weaker Sections</b>: <b>15%</b> of ANBC must be disbursed to small/marginal farmers and weaker sections.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Shortfall Penalty</b>: Deficit in PSL achievement is deposited into the Rural Infrastructure Development Fund (RIDF) managed by NABARD.</span>
              </li>
            </ul>
          </div>

          <!-- Card 4: KCC & Rural Financial Schemes -->
          <div class="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
            <div class="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm mb-3">
              <span>💳</span>
              <span>Kisan Credit Card (KCC) & Rural Schemes</span>
            </div>
            <ul class="space-y-2.5 text-xs sm:text-sm text-slate-700">
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>KCC Inception</b>: Formulated in 1998 on recommendations of <b>R.V. Gupta Committee</b> by NABARD.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Interest Rate Math</b>: Benchmark lending rate 9% &rarr; 2% Interest Subvention (IS) brings it to 7% &rarr; 3% Prompt Repayment Incentive (PRI) brings effective interest rate to <b>4% p.a.</b> for loans up to ₹3 Lakh.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Animal Husbandry & Fisheries</b>: KCC extended to allied sectors with loan limit up to ₹2 Lakh at the same 4% effective interest rate.</span>
              </li>
              <li class="flex items-start space-x-2">
                <span class="font-bold text-emerald-600 min-w-4">&bull;</span>
                <span><b>Collateral-free limit</b>: RBI raised collateral-free agricultural loan threshold from ₹1 Lakh to <b>₹1.60 Lakh</b>.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RrbAgricultureComponent implements OnInit {
  currentAffairsService = inject(CurrentAffairsService);
  examQuestionService = inject(ExamQuestionService);
  langService = inject(LanguageService);
  bookmarkService = inject(BookmarkService);

  activeTab: 'notes' | 'questions' | 'cheatsheet' = 'notes';

  rrbItems: CurrentAffairItem[] = [];
  rrbQuestions: ExpectedQuestion[] = [];
  isLoading = true;
  isLoadingQuestions = true;

  selectedAnswers: Record<string, string> = {};
  showExplanations: Record<string, boolean> = {};

  ngOnInit(): void {
    this.loadRrbNotes();
    this.loadRrbQuestions();
  }

  loadRrbNotes(): void {
    this.isLoading = true;
    this.currentAffairsService.searchCurrentAffairs({ targetGroup: 'RRB_Agriculture', pageSize: 30 }).subscribe({
      next: (items: CurrentAffairItem[]) => {
        this.rrbItems = items;
        this.isLoading = false;
      },
      error: () => {
        // Fallback: fetch today's digest and filter
        this.currentAffairsService.getTodayDigest().subscribe({
          next: (digest) => {
            this.rrbItems = digest.items.filter(i =>
              i.examTargetGroup === 'RRB_Agriculture' ||
              i.targetExams.includes('Rrb') ||
              i.categoryNameEn.includes('Rural') ||
              i.categoryId === 10
            );
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
    });
  }

  loadRrbQuestions(): void {
    this.isLoadingQuestions = true;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    this.examQuestionService.getQuestions(currentMonth, undefined, undefined, undefined, 'RRB_Agriculture').subscribe({
      next: (questions: ExpectedQuestion[]) => {
        this.rrbQuestions = questions;
        this.isLoadingQuestions = false;
      },
      error: () => {
        this.isLoadingQuestions = false;
      }
    });
  }

  selectAnswer(questionId: string, answer: string): void {
    this.selectedAnswers[questionId] = answer;
  }

  getOptionLetter(idx: number): string {
    return String.fromCharCode(65 + idx);
  }

  onBookmarkToggled(id: string): void {
    // Handled in bookmark service
  }
}
