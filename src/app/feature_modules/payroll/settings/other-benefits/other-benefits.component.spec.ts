import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherBenefitsComponent } from './other-benefits.component';

describe('OtherBenefitsComponent', () => {
  let component: OtherBenefitsComponent;
  let fixture: ComponentFixture<OtherBenefitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtherBenefitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtherBenefitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
