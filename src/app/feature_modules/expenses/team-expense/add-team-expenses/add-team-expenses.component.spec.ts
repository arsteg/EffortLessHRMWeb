import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeamExpensesComponent } from './add-team-expenses.component';

describe('AddTeamExpensesComponent', () => {
  let component: AddTeamExpensesComponent;
  let fixture: ComponentFixture<AddTeamExpensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTeamExpensesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTeamExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
