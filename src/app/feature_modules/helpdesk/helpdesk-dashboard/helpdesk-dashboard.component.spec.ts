import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpdeskDashboardComponent } from './helpdesk-dashboard.component';

describe('HelpdeskDashboardComponent', () => {
  let component: HelpdeskDashboardComponent;
  let fixture: ComponentFixture<HelpdeskDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      declarations: [HelpdeskDashboardComponent],
      imports: [UiTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HelpdeskDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
