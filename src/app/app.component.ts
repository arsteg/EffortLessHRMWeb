import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Spinkit} from 'ng-http-loader';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
 

  constructor(private router:Router,private translate: TranslateService){
    // Set supported languages
    translate.addLangs(['en', 'es', 'fr']);
     // Set default language
     translate.setDefaultLang('en');
       // Load saved language or use browser language
    const savedLang = localStorage.getItem('language');

     // Use browser language if supported, else fallback to default
    const browserLang = translate.getBrowserLang();
    const langToUse = savedLang || (browserLang && translate.getLangs().includes(browserLang) ? browserLang : 'en');
    translate.use(langToUse).subscribe(() => {
      console.log('Language initialized:', langToUse);
    });

  }
  ngOnInit() {

  }
  switchLanguage(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value;
    this.translate.use(lang);
  }
  isChatbotOpen = false;

  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;
  }
}