import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppAndWebsiteUsageComponent } from './app-and-website-usage.component';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { CommonService } from 'src/app/_services/common.Service';

describe('AppAndWebsiteUsageComponent', () => {
  let component: AppAndWebsiteUsageComponent;
  let fixture: ComponentFixture<AppAndWebsiteUsageComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ AppAndWebsiteUsageComponent ]
    })
    .compileComponents();

    TestBed.inject(CommonService).setCurrentUserRole('Employee');
    fixture = TestBed.createComponent(AppAndWebsiteUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('uses the selected user model to select report options', async () => {
    component.members = [{ id: 'unit-test-user', name: 'Test Employee', email: 'employee@example.invalid' }];
    component.selectedUser = ['unit-test-user'];
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const select: MatSelect = fixture.debugElement.query(By.directive(MatSelect)).componentInstance;
    expect(select.value).toEqual(['unit-test-user']);
    expect(select.options.first.selected).toBeTrue();
  });
});
