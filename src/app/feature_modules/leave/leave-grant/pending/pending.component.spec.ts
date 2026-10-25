import { AddLeaveComponent } from 'src/app/feature_modules/leave/leave-grant/add-leave/add-leave.component';
import { UpdateStatusComponent } from 'src/app/feature_modules/leave/leave-grant/update-status/update-status.component';
import { ViewLeaveComponent } from 'src/app/feature_modules/leave/leave-grant/view-leave/view-leave.component';
import { ShowStatusComponent } from 'src/app/feature_modules/leave/leave-grant/show-status/show-status.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingComponent } from './pending.component';

describe('PendingComponent', () => {
  let component: PendingComponent;
  let fixture: ComponentFixture<PendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ShowStatusComponent, ViewLeaveComponent, UpdateStatusComponent, AddLeaveComponent, PendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
