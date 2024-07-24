import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunFnfPayrollComponent } from './run-fnf-payroll.component';

describe('RunFnfPayrollComponent', () => {
  let component: RunFnfPayrollComponent;
  let fixture: ComponentFixture<RunFnfPayrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunFnfPayrollComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RunFnfPayrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
