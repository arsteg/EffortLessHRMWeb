import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPayslipComponent } from './view-payslip.component';

describe('ViewPayslipComponent', () => {
  let component: ViewPayslipComponent;
  let fixture: ComponentFixture<ViewPayslipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewPayslipComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPayslipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
