import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineComponent } from './timeline.component';
import { ReportsService } from '../../../_services/reports.service';
import { of } from 'rxjs';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ TimelineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('clears stale hours when the selected date has no logs', () => {
    spyOn(TestBed.inject(ReportsService), 'getTimeline').and.returnValue(of({ data: [] }) as any);
    component.hours = [0, 1];
    component.logs = [{ startTime: '2026-10-25T09:00:00' }];
    expect(() => component.getTimeLine()).not.toThrow();
    expect(component.hours).toEqual([]);
    expect(component.logs).toEqual([]);
    fixture.detectChanges();
  });
});
