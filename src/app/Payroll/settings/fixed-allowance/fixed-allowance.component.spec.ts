import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedAllowanceComponent } from './fixed-allowance.component';

describe('FixedAllowanceComponent', () => {
  let component: FixedAllowanceComponent;
  let fixture: ComponentFixture<FixedAllowanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixedAllowanceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedAllowanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
