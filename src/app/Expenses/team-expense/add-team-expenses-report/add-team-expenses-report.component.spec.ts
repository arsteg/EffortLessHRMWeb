import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTeamExpensesReportComponent } from './add-team-expenses-report.component';

describe('AddTeamExpensesReportComponent', () => {
  let component: AddTeamExpensesReportComponent;
  let fixture: ComponentFixture<AddTeamExpensesReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddTeamExpensesReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddTeamExpensesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
