import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { RequestApprovalComponent } from 'src/app/feature_modules/manual-time/requestApproval/requestApproval.component';
import { productivityAppsApprovalComponent } from 'src/app/feature_modules/approvals/productivityAppsApproval/productivityAppsApproval.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalsComponent } from './approvals.component';

describe('ApprovalsComponent', () => {
  let component: ApprovalsComponent;
  let fixture: ComponentFixture<ApprovalsComponent>;

  beforeEach(useEmployeeSessionFixture);
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [productivityAppsApprovalComponent, RequestApprovalComponent,  ApprovalsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
