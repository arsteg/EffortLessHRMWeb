import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleInterviewComponent } from './schedule-interview.component';

describe('ScheduleInterviewComponent', () => {
  let component: ScheduleInterviewComponent;
  let fixture: ComponentFixture<ScheduleInterviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiTestingModule, ScheduleInterviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleInterviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select[formControlName="candidate"]');
    expect(select).not.toBeNull();
    expect(component.scheduleInterviewForm.get('candidate')).not.toBeNull();
  });
});
