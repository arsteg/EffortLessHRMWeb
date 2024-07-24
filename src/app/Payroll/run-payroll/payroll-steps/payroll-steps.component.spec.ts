import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollStepsComponent } from './payroll-steps.component';

describe('PayrollStepsComponent', () => {
  let component: PayrollStepsComponent;
  let fixture: ComponentFixture<PayrollStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayrollStepsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayrollStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
