import { DeductionComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/lwf/deduction/deduction.component';
import { LwfSlabComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/lwf/lwf-slab/lwf-slab.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LwfComponent } from './lwf.component';

describe('LwfComponent', () => {
  let component: LwfComponent;
  let fixture: ComponentFixture<LwfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [LwfSlabComponent, DeductionComponent, LwfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LwfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
