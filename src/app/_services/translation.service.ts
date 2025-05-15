import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  languageNames = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' }
  ]
  languages = this.languageNames.map(lang => lang.code);
  defaultLang = 'en';
  currentLang = new BehaviorSubject<string>(this.translate.currentLang  || this.translate.getDefaultLang() || this.defaultLang);
  currentModuleKey = new BehaviorSubject<string>('common');

  constructor(private http: HttpClient, private translate: TranslateService) { 
    this.currentLang.subscribe((lang) => {
      this.switchLanguage(lang);
    });
  }

  switchLanguage(lang: string): void {
    const moduleKey = this.currentModuleKey.getValue();
    this.loadTranslation(moduleKey).then(() => {
      this.translate.use(lang).subscribe(() => {
        console.log('Language switched to:', lang);
      });
    });
  }

  loadTranslation(moduleKey: string): Promise<void> {
    this.currentModuleKey.next(moduleKey);
    const lang = this.currentLang.getValue();
    const path = `./assets/i18n/${moduleKey}/${lang}.json`;

    return this.http.get(path).toPromise().then(
      (translations) => {
        const existing = this.translate.translations[lang] || {};
        const merged = { ...existing, ...translations };
        this.translate.setTranslation(lang, merged, true);
      },
      (error) => {
        console.warn(`Could not load ${path}`);
      }
    );
  }
}
