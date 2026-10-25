import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnDutyComponent } from './add-on-duty.component';

describe('AddOnDutyComponent', () => {
  let component: AddOnDutyComponent;
  let fixture: ComponentFixture<AddOnDutyComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [AddOnDutyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddOnDutyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
