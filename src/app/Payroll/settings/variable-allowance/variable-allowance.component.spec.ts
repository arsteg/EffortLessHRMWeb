import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VariableAllowanceComponent } from './variable-allowance.component';

describe('VariableAllowanceComponent', () => {
  let component: VariableAllowanceComponent;
  let fixture: ComponentFixture<VariableAllowanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VariableAllowanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VariableAllowanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
