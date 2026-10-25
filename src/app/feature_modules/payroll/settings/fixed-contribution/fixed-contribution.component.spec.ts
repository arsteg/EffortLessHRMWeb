import { DeductionComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/lwf/deduction/deduction.component';
import { LwfSlabComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/lwf/lwf-slab/lwf-slab.component';
import { LwfComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/lwf/lwf.component';
import { PtSlabComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/pt/pt-slab/pt-slab.component';
import { PtComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/pt/pt.component';
import { CeilingAmountComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/esic/ceiling-amount/ceiling-amount.component';
import { ContributionComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/esic/contribution/contribution.component';
import { EsicComponent } from 'src/app/feature_modules/payroll/settings/fixed-contribution/esic/esic.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedContributionComponent } from './fixed-contribution.component';

describe('FixedContributionComponent', () => {
  let component: FixedContributionComponent;
  let fixture: ComponentFixture<FixedContributionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [EsicComponent, ContributionComponent, CeilingAmountComponent, PtComponent, PtSlabComponent, LwfComponent, LwfSlabComponent, DeductionComponent, FixedContributionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedContributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
