import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackFieldComponent } from './feedback-field.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { InterviewProcessService } from 'src/app/_services/interviewProcess.service';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';

describe('FeedbackFieldComponent', () => {
  let component: FeedbackFieldComponent;
  let fixture: ComponentFixture<FeedbackFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackFieldComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: InterviewProcessService, useValue: { getAllFeedbackFields: () => of({ data: [] }) } },
        { provide: ToastrService, useValue: jasmine.createSpyObj('ToastrService', ['success', 'error']) }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('keeps name and type required in an empty form', () => {
    expect(component.feedbackFieldForm.valid).toBeFalse();
    expect(component.feedbackFieldForm.get('fieldName').hasError('required')).toBeTrue();
    expect(component.feedbackFieldForm.get('fieldType').hasError('required')).toBeTrue();
    expect(component.filteredFeedbackFields).toEqual([]);
  });
});
