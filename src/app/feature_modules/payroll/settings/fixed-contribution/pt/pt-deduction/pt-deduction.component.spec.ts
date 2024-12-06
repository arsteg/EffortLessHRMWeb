import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PtDeductionComponent } from './pt-deduction.component';

describe('PtDeductionComponent', () => {
  let component: PtDeductionComponent;
  let fixture: ComponentFixture<PtDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PtDeductionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PtDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
