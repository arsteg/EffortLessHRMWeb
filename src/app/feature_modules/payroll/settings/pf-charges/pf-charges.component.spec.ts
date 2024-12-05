import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfChargesComponent } from './pf-charges.component';

describe('PfChargesComponent', () => {
  let component: PfChargesComponent;
  let fixture: ComponentFixture<PfChargesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfChargesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PfChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
