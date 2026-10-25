import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { TimelineComponent } from 'src/app/feature_modules/reports/timeline/timeline.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineManagementComponent } from './timeline-management.component';

describe('TimelineManagementComponent', () => {
  let component: TimelineManagementComponent;
  let fixture: ComponentFixture<TimelineManagementComponent>;

  beforeEach(useEmployeeSessionFixture);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      declarations: [TimelineComponent, TimelineManagementComponent],
      imports: [UiTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimelineManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
