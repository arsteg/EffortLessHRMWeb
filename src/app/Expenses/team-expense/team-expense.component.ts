import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-team-expense',
  templateUrl: './team-expense.component.html',
  styleUrl: './team-expense.component.css'
})
export class TeamExpenseComponent {
  selectedTabs = 1;
  @Input() selectedTab: number;
  ngOnInit() {
    console.log(this.selectedTab);
  }
  selectTab(tabIndex: number) {
    this.selectedTabs = tabIndex;
  }

}
