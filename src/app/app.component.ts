import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit} from 'ng-http-loader';
import { TranslateService } from '@ngx-translate/core';
import {IconService} from './_services/icon.service';
import { TranslationService } from './_services/translation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  constructor(private router:Router,private translate: TranslateService, private iconService: IconService, private translationService: TranslationService){
    // Set supported languages
    translate.addLangs(this.translationService.languages);
     // Set default language
     translate.setDefaultLang(this.translationService.defaultLang);
       // Load saved language or use browser language
    const savedLang = localStorage.getItem('language');

     // Use browser language if supported, else fallback to default
    const browserLang = translate.getBrowserLang();
    const langToUse = savedLang || (browserLang && translate.getLangs().includes(browserLang) ? browserLang : this.translationService.defaultLang);
    translate.use(langToUse).subscribe(() => {
      console.log('Language initialized:', langToUse);
    });

  }
  ngOnInit() { }

  isChatbotOpen = false;

  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;
  }
}