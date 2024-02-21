import { Component } from '@angular/core';

@Component({
  selector: 'app-team-expense',
  templateUrl: './team-expense.component.html',
  styleUrl: './team-expense.component.css'
})
export class TeamExpenseComponent {
  selectedTab = 1;
  ngOnInit(){
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

}
