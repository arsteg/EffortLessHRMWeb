import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarDeductionComponent } from './var-deduction.component';

describe('VarDeductionComponent', () => {
  let component: VarDeductionComponent;
  let fixture: ComponentFixture<VarDeductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [VarDeductionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VarDeductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
