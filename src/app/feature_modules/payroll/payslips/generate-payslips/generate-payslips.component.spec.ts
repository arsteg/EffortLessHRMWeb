import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratePayslipsComponent } from './generate-payslips.component';

describe('GeneratePayslipsComponent', () => {
  let component: GeneratePayslipsComponent;
  let fixture: ComponentFixture<GeneratePayslipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeneratePayslipsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GeneratePayslipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
