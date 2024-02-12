import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewProcessMainComponent } from './interview-process-main.component';

describe('InterviewProcessMainComponent', () => {
  let component: InterviewProcessMainComponent;
  let fixture: ComponentFixture<InterviewProcessMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterviewProcessMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterviewProcessMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
