import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatIconModule } from '@angular/material/icon';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { IconService } from './_services/icon.service';
import { TranslationService } from './_services/translation.service';

@Component({ selector: 'app-chatbot', template: 'Chat panel' })
class ChatbotStubComponent {}

describe('AppComponent', () => {
  let translate: jasmine.SpyObj<TranslateService>;
  beforeEach(async () => {
    translate = jasmine.createSpyObj('TranslateService', ['addLangs', 'setDefaultLang', 'getBrowserLang', 'getLangs', 'use']);
    translate.getBrowserLang.and.returnValue('en');
    translate.getLangs.and.returnValue(['en', 'es', 'fr']);
    translate.use.and.returnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterTestingModule, MatIconModule],
      declarations: [AppComponent, ChatbotStubComponent],
      providers: [
        { provide: TranslateService, useValue: translate },
        { provide: IconService, useValue: {} },
        { provide: TranslationService, useValue: { languages: ['en', 'es', 'fr'], defaultLang: 'en' } }
      ]
    }).compileComponents();
  });

  it('renders the application route outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).not.toBeNull();
  });

  it('opens and closes chat through a named native button', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button.chatbot-icon');
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Open chat');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Close chat');
    expect(fixture.nativeElement.querySelector('#hrm-chat-panel')).not.toBeNull();
    button.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#hrm-chat-panel')).toBeNull();
  });

  it('registers supported languages and the default', () => {
    TestBed.createComponent(AppComponent);
    expect(translate.addLangs).toHaveBeenCalledWith(['en', 'es', 'fr']);
    expect(translate.setDefaultLang).toHaveBeenCalledWith('en');
  });
});
