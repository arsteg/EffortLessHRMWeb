import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDeductionComponent } from './employee-deduction.component';

describe('EmployeeDeductionComponent', () => {
  let component: EmployeeDeductionComponent;
  let fixture: ComponentFixture<EmployeeDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeDeductionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmployeeDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
