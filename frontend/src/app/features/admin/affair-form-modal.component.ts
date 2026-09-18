import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrentAffairItem, CreateOrUpdateAffairPayload } from '../../core/models/current-affair.model';
import { Category } from '../../core/models/category.model';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-affair-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-base sm:text-lg font-bold">
              {{ isEditing ? 'Edit Current Affair Article' : 'Create New Banking Current Affair' }}
            </h2>
            <p class="text-xs text-slate-400">Provide bilingual details (English & Hindi) for banking aspirants.</p>
          </div>
          <button (click)="close.emit()" class="text-slate-400 hover:text-white p-1 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Body -->
        <form (ngSubmit)="save()" class="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          <!-- Meta Row: Date & Category & Sector & Importance & Exam -->
          <div class="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Target Date *</label>
              <input
                type="date"
                [(ngModel)]="formData.digestDate"
                name="digestDate"
                required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                [(ngModel)]="formData.categoryId"
                name="categoryId"
                required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500">
                <option *ngFor="let cat of categories" [value]="cat.id">
                  {{ cat.nameEn }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Sector Vertical *</label>
              <select
                [(ngModel)]="formData.examTargetGroup"
                name="examTargetGroup"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500">
                <option value="CommercialBanks">🏛️ Commercial Banks</option>
                <option value="RRB_Agriculture">🌾 RRB & Agriculture</option>
                <option value="Regulatory">📜 Regulatory</option>
                <option value="Insurance">🛡️ Insurance</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Importance *</label>
              <select
                [(ngModel)]="formData.importance"
                name="importance"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500">
                <option value="MustRead">★ Must Read</option>
                <option value="High">High Priority</option>
                <option value="Standard">Standard</option>
                <option value="PreviousYearsPattern">PYQ Pattern</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Target Exam *</label>
              <select
                [(ngModel)]="formData.targetExams"
                name="targetExams"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500">
                <option value="AllBanking">All Banking & Insurance</option>
                <option value="IbpsRrb">🌾 IBPS RRB PO / Clerk</option>
                <option value="SbiPo">🏛️ SBI PO / Clerk</option>
                <option value="IbpsPo">🏛️ IBPS PO / Clerk</option>
                <option value="RbiGradeB">📜 RBI Grade B</option>
                <option value="LicAao">🛡️ LIC AAO</option>
                <option value="Nabard">🌾 NABARD</option>
              </select>
            </div>
          </div>

          <!-- Bilingual Headlines -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">English Headline *</label>
              <input
                type="text"
                [(ngModel)]="formData.titleEn"
                name="titleEn"
                placeholder="e.g. RBI Keeps Repo Rate Unchanged at 6.50%"
                required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Hindi Headline (हिंदी शीर्षक) *</label>
              <input
                type="text"
                [(ngModel)]="formData.titleHi"
                name="titleHi"
                placeholder="उदा. आरबीआई ने नीतिगत रेपो दर 6.50% पर अपरिवर्तित रखी"
                required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium font-hindi focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Bilingual Summary -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">English Summary *</label>
              <textarea
                [(ngModel)]="formData.summaryEn"
                name="summaryEn"
                rows="3"
                required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                placeholder="Crisp 2-3 sentences summarizing the news..."></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Hindi Summary (हिंदी सारांश) *</label>
              <textarea
                [(ngModel)]="formData.summaryHi"
                name="summaryHi"
                rows="3"
                required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium font-hindi focus:ring-2 focus:ring-blue-500"
                placeholder="2-3 वाक्यों में संक्षिप्त सारांश..."></textarea>
            </div>
          </div>

          <!-- Bilingual Bullet Points (1 per line) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">English Bullet Points (One per line)</label>
              <textarea
                [(ngModel)]="bulletPointsEnRaw"
                name="bulletPointsEnRaw"
                rows="4"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                placeholder="Bullet point 1&#10;Bullet point 2"></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Hindi Bullet Points (हिंदी बिंदु - प्रति पंक्ति एक)</label>
              <textarea
                [(ngModel)]="bulletPointsHiRaw"
                name="bulletPointsHiRaw"
                rows="4"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium font-hindi focus:ring-2 focus:ring-blue-500"
                placeholder="मुख्य बिंदु 1&#10;मुख्य बिंदु 2"></textarea>
            </div>
          </div>

          <!-- Banking Takeaway Box & Static GK Fact -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-amber-800 mb-1">Banking Takeaway (English)</label>
              <textarea
                [(ngModel)]="formData.bankingTakeawayEn"
                name="bankingTakeawayEn"
                rows="2"
                class="w-full px-3 py-2 border border-amber-200 bg-amber-50/50 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                placeholder="Specific section/clause tested in Banking exams..."></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-amber-800 mb-1">Banking Takeaway (हिंदी)</label>
              <textarea
                [(ngModel)]="formData.bankingTakeawayHi"
                name="bankingTakeawayHi"
                rows="2"
                class="w-full px-3 py-2 border border-amber-200 bg-amber-50/50 rounded-xl text-xs font-medium font-hindi focus:ring-2 focus:ring-amber-500"
                placeholder="परीक्षा विशेष दृष्टिकोण..."></textarea>
            </div>
          </div>

          <!-- Static GK Fact & Keywords -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Static GK Fact (English)</label>
              <input
                type="text"
                [(ngModel)]="formData.staticGkFactEn"
                name="staticGkFactEn"
                placeholder="HQ: Mumbai, Governor: Shaktikanta Das"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Static GK Fact (हिंदी)</label>
              <input
                type="text"
                [(ngModel)]="formData.staticGkFactHi"
                name="staticGkFactHi"
                placeholder="मुख्यालय: मुंबई, स्थापना: 1935"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium font-hindi focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Keywords (Comma separated)</label>
              <input
                type="text"
                [(ngModel)]="formData.keywords"
                name="keywords"
                placeholder="RBI, Repo, Monetary Policy"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Source Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Source Name</label>
              <input
                type="text"
                [(ngModel)]="formData.sourceName"
                name="sourceName"
                placeholder="e.g. The Hindu, RBI Official Bulletin"
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Source URL</label>
              <input
                type="url"
                [(ngModel)]="formData.sourceUrl"
                name="sourceUrl"
                placeholder="https://..."
                class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- Footer Action Buttons -->
          <div class="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              (click)="close.emit()"
              class="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="isSaving"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50">
              {{ isSaving ? 'Saving...' : (isEditing ? 'Update Article' : 'Publish Article') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AffairFormModalComponent implements OnInit {
  @Input() itemToEdit?: CurrentAffairItem;
  @Input() initialDate: string = new Date().toISOString().split('T')[0];
  @Input() categories: Category[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private adminService = inject(AdminService);

  isEditing: boolean = false;
  isSaving: boolean = false;

  bulletPointsEnRaw: string = '';
  bulletPointsHiRaw: string = '';

  formData: CreateOrUpdateAffairPayload = {
    digestDate: '',
    categoryId: 1,
    examTargetGroup: 'CommercialBanks',
    titleEn: '',
    titleHi: '',
    summaryEn: '',
    summaryHi: '',
    bulletPointsEn: [],
    bulletPointsHi: [],
    bankingTakeawayEn: '',
    bankingTakeawayHi: '',
    staticGkFactEn: '',
    staticGkFactHi: '',
    importance: 'High',
    targetExams: 'AllBanking',
    keywords: '',
    sourceName: '',
    sourceUrl: '',
    displayOrder: 1,
    isFeatured: false
  };

  ngOnInit(): void {
    if (this.itemToEdit) {
      this.isEditing = true;
      this.formData = {
        id: this.itemToEdit.id,
        digestDate: this.itemToEdit.digestDate,
        categoryId: this.itemToEdit.categoryId,
        examTargetGroup: this.itemToEdit.examTargetGroup || 'CommercialBanks',
        titleEn: this.itemToEdit.titleEn,
        titleHi: this.itemToEdit.titleHi,
        summaryEn: this.itemToEdit.summaryEn,
        summaryHi: this.itemToEdit.summaryHi,
        bulletPointsEn: this.itemToEdit.bulletPointsEn,
        bulletPointsHi: this.itemToEdit.bulletPointsHi,
        bankingTakeawayEn: this.itemToEdit.bankingTakeawayEn,
        bankingTakeawayHi: this.itemToEdit.bankingTakeawayHi,
        staticGkFactEn: this.itemToEdit.staticGkFactEn,
        staticGkFactHi: this.itemToEdit.staticGkFactHi,
        importance: this.itemToEdit.importance,
        targetExams: this.itemToEdit.targetExams,
        keywords: this.itemToEdit.keywordsList?.join(', ') || '',
        sourceName: this.itemToEdit.sourceName,
        sourceUrl: this.itemToEdit.sourceUrl,
        displayOrder: this.itemToEdit.displayOrder,
        isFeatured: this.itemToEdit.isFeatured
      };
      this.bulletPointsEnRaw = (this.itemToEdit.bulletPointsEn || []).join('\n');
      this.bulletPointsHiRaw = (this.itemToEdit.bulletPointsHi || []).join('\n');
    } else {
      this.formData.digestDate = this.initialDate;
      if (this.categories.length > 0) {
        this.formData.categoryId = this.categories[0].id;
      }
    }
  }

  save(): void {
    this.formData.bulletPointsEn = this.bulletPointsEnRaw
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.formData.bulletPointsHi = this.bulletPointsHiRaw
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    this.isSaving = true;

    if (this.isEditing && this.formData.id) {
      this.adminService.updateItem(this.formData.id, this.formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.saved.emit();
        },
        error: (err: any) => {
          this.isSaving = false;
          alert('Error updating item: ' + (err?.message || err));
        }
      });
    } else {
      this.adminService.createItem(this.formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.saved.emit();
        },
        error: (err: any) => {
          this.isSaving = false;
          alert('Error creating item: ' + (err?.message || err));
        }
      });
    }
  }
}
