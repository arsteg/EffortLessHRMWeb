import { Component, inject, Input } from '@angular/core';
import { TranslationService } from 'src/app/_services/translation.service';

@Component({
  selector: 'hrm-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css'
})
export class LanguageSelectorComponent {
  private translationService = inject(TranslationService);
  @Input() cssClass: string;
  languages = this.translationService.languageNames;

  switchLanguage(language: string): void {
    this.translationService.currentLang.next(language);
  }

  get currentLang(): string {
    return this.translationService.currentLang.getValue();
  }

}
