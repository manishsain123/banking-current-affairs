import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-slate-900 text-slate-400 border-t border-slate-800 mt-auto py-10 no-print text-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <!-- Col 1 -->
          <div>
            <div class="flex items-center space-x-2 mb-3">
              <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                B
              </div>
              <span class="text-white font-bold text-base">BankDCA Portal</span>
            </div>
            <p class="text-xs text-slate-400 leading-relaxed">
              Automated bilingual daily current affairs specially crafted for banking aspirants targeting SBI, IBPS, RBI, and Insurance examinations.
            </p>
          </div>

          <!-- Col 2 -->
          <div>
            <h4 class="text-white text-xs font-semibold uppercase tracking-wider mb-3">Key Exam Coverage</h4>
            <ul class="space-y-1.5 text-xs">
              <li><span class="hover:text-blue-400 transition-colors">SBI PO & SBI Clerk (General Awareness)</span></li>
              <li><span class="hover:text-blue-400 transition-colors">IBPS PO / Clerk / SO (Banking Awareness)</span></li>
              <li><span class="hover:text-blue-400 transition-colors">RBI Grade B (Phase 1 & Phase 2 ESI/FM)</span></li>
              <li><span class="hover:text-blue-400 transition-colors">LIC AAO / GIC / NIACL AO (Insurance)</span></li>
              <li><span class="hover:text-blue-400 transition-colors">NABARD Grade A & SEBI Grade A</span></li>
            </ul>
          </div>

          <!-- Col 3 -->
          <div>
            <h4 class="text-white text-xs font-semibold uppercase tracking-wider mb-3">Syllabus Categories</h4>
            <ul class="space-y-1.5 text-xs">
              <li><span>RBI Circulars & Monetary Policy</span></li>
              <li><span>Key Financial Ratios & Repo Rates</span></li>
              <li><span>Government Schemes & PMJDY</span></li>
              <li><span>Banking Mergers & Appointments</span></li>
              <li><span>Static GK & Banking Terms</span></li>
            </ul>
          </div>

          <!-- Col 4 -->
          <div>
            <h4 class="text-white text-xs font-semibold uppercase tracking-wider mb-3">System Architecture</h4>
            <div class="space-y-2 text-xs">
              <div class="flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Backend: .NET 8 Web API & EF Core</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Scheduler: Hangfire Automation (05:00 AM)</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>AI: Gemini / OpenAI Integration</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Frontend: Angular 18 + Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; 2026 BankDCA. Curated for Banking Aspirants. All rights reserved.</p>
          <div class="flex space-x-4 mt-2 sm:mt-0">
            <span>Bilingual English / हिंदी</span>
            <span>&bull;</span>
            <span>Daily Archive System</span>
            <span>&bull;</span>
            <span>Offline Revision Bookmarks</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
