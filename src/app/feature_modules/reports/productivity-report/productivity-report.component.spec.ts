import { useEmployeeSessionFixture } from 'src/testing/session-fixture';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductivityReportComponent } from './productivity-report.component';

describe('ProductivityReportComponent', () => {
  let component: ProductivityReportComponent;
  let fixture: ComponentFixture<ProductivityReportComponent>;

  beforeEach(useEmployeeSessionFixture);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ ProductivityReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductivityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
