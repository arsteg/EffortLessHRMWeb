import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollHistoryComponent } from './payroll-history.component';

describe('PayrollHistoryComponent', () => {
  let component: PayrollHistoryComponent;
  let fixture: ComponentFixture<PayrollHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayrollHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PayrollHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
