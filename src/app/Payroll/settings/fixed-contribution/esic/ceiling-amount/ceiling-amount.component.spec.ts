import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CeilingAmountComponent } from './ceiling-amount.component';

describe('CeilingAmountComponent', () => {
  let component: CeilingAmountComponent;
  let fixture: ComponentFixture<CeilingAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CeilingAmountComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CeilingAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
