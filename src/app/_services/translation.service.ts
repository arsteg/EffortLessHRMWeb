import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private http: HttpClient, private translate: TranslateService) { }

  loadTranslation(moduleKey: string): Promise<void> {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
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
