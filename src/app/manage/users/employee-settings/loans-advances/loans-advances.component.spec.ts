import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoansAdvancesComponent } from './loans-advances.component';

describe('LoansAdvancesComponent', () => {
  let component: LoansAdvancesComponent;
  let fixture: ComponentFixture<LoansAdvancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoansAdvancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoansAdvancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
