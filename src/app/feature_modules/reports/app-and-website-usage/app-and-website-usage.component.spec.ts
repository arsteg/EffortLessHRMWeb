import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAndWebsiteUsageComponent } from './app-and-website-usage.component';

describe('AppAndWebsiteUsageComponent', () => {
  let component: AppAndWebsiteUsageComponent;
  let fixture: ComponentFixture<AppAndWebsiteUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppAndWebsiteUsageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppAndWebsiteUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
