import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppWebsiteSettingsComponent } from './app-website-settings.component';

describe('AppWebsiteSettingsComponent', () => {
  let component: AppWebsiteSettingsComponent;
  let fixture: ComponentFixture<AppWebsiteSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
});
