import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiBenefitsComponent } from './flexi-benefits.component';

describe('FlexiBenefitsComponent', () => {
  let component: FlexiBenefitsComponent;
  let fixture: ComponentFixture<FlexiBenefitsComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [FlexiBenefitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FlexiBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
