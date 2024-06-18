import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDeductionComponent } from './fixed-deduction.component';

describe('FixedDeductionComponent', () => {
  let component: FixedDeductionComponent;
  let fixture: ComponentFixture<FixedDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedDeductionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
