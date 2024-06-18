import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableDeductionComponent } from './variable-deduction.component';

describe('VariableDeductionComponent', () => {
  let component: VariableDeductionComponent;
  let fixture: ComponentFixture<VariableDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariableDeductionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariableDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
