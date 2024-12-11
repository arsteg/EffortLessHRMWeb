import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateFeedbackComponent } from './candidate-feedback.component';

describe('CandidateFeedbackComponent', () => {
  let component: CandidateFeedbackComponent;
  let fixture: ComponentFixture<CandidateFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateFeedbackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CandidateFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
