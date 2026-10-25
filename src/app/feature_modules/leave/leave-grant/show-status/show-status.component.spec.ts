import { AddLeaveComponent } from 'src/app/feature_modules/leave/leave-grant/add-leave/add-leave.component';
import { UpdateStatusComponent } from 'src/app/feature_modules/leave/leave-grant/update-status/update-status.component';
import { ViewLeaveComponent } from 'src/app/feature_modules/leave/leave-grant/view-leave/view-leave.component';
import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowStatusComponent } from './show-status.component';

describe('ShowStatusComponent', () => {
  let component: ShowStatusComponent;
  let fixture: ComponentFixture<ShowStatusComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ViewLeaveComponent, UpdateStatusComponent, AddLeaveComponent, ShowStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
