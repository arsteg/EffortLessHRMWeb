import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoansAdvancesComponent } from './view-loans-advances.component';

describe('ViewLoansAdvancesComponent', () => {
  let component: ViewLoansAdvancesComponent;
  let fixture: ComponentFixture<ViewLoansAdvancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewLoansAdvancesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewLoansAdvancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
