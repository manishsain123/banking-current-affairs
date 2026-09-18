import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankingMetric } from '../../../core/models/current-affair.model';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-financial-ticker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 shadow-md border border-slate-800 text-white mb-6">
      <div class="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <div class="flex items-center space-x-2">
          <div class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
          <h3 class="text-xs sm:text-sm font-bold tracking-wide uppercase text-amber-400 flex items-center space-x-2">
            <span>
              {{ langService.isHindi() ? 'दैनिक बैंकिंग और वित्तीय मुख्य दरें' : 'Banking & Financial Policy Rates' }}
            </span>
            <span *ngIf="langService.isDual()" class="text-[11px] text-slate-400 font-normal lowercase">
              (दैनिक प्रमुख दरें)
            </span>
          </h3>
        </div>
        <span class="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
          Source: RBI MPC Guidelines
        </span>
      </div>

      <!-- Metrics Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div *ngFor="let metric of metrics" class="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 hover:border-blue-500/50 transition-all hover:bg-slate-800">
          <div class="text-[11px] text-slate-300 font-medium truncate mb-1">
            <span *ngIf="!langService.isHindi()">{{ metric.metricNameEn }}</span>
            <span *ngIf="langService.isHindi()" class="font-hindi">{{ metric.metricNameHi }}</span>
            <div *ngIf="langService.isDual() && metric.metricNameHi" class="text-[10px] text-slate-400 font-hindi truncate">
              {{ metric.metricNameHi }}
            </div>
          </div>
          <div class="flex items-baseline space-x-2">
            <span class="text-base sm:text-lg font-extrabold text-blue-300 tracking-tight">{{ metric.value }}</span>
            <span *ngIf="metric.change" class="text-[10px] px-1 rounded bg-slate-700 text-slate-300 font-mono">
              {{ metric.change }}
            </span>
          </div>
          <div *ngIf="metric.note" class="text-[10px] text-slate-400 truncate mt-0.5" [title]="metric.note">
            {{ metric.note }}
          </div>
        </div>
      </div>
    </div>
  `
})
export class FinancialTickerComponent {
  @Input() metrics: BankingMetric[] = [];
  langService = inject(LanguageService);
}
