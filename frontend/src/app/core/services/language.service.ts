import { Injectable, signal } from '@angular/core';

export type LanguageMode = 'en' | 'hi' | 'dual';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'bankdca_lang_pref';

  // Default to dual view for optimal bilingual exam preparation
  currentLanguage = signal<LanguageMode>(this.getInitialLanguage());

  setLanguage(mode: LanguageMode): void {
    this.currentLanguage.set(mode);
    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch {
      // Ignore localStorage issues in private mode
    }
  }

  isEnglish(): boolean {
    return this.currentLanguage() === 'en';
  }

  isHindi(): boolean {
    return this.currentLanguage() === 'hi';
  }

  isDual(): boolean {
    return this.currentLanguage() === 'dual';
  }

  private getInitialLanguage(): LanguageMode {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved === 'en' || saved === 'hi' || saved === 'dual') {
        return saved;
      }
    } catch { }
    return 'dual'; // default to dual view so students get best of both!
  }
}
