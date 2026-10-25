import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppWebsiteSettingsComponent } from './app-website-settings.component';

describe('AppWebsiteSettingsComponent', () => {
  let component: AppWebsiteSettingsComponent;
  let fixture: ComponentFixture<AppWebsiteSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ AppWebsiteSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppWebsiteSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('keeps productivity radio selection in the submitted reactive form', () => {
    const radio: HTMLInputElement = fixture.nativeElement.querySelector('#productivityno');
    radio.click();
    fixture.detectChanges();
    expect(component.addForm.get('isProductive').value).toBeFalse();
  });
});
