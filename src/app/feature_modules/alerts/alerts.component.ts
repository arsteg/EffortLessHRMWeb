import { Component, OnInit } from '@angular/core'; 
import { Role } from 'src/app/models/role.model';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  Role = Role;
  selectedTab: number = 4;
  view: Role | null = null;
  constructor() { }

  ngOnInit(): void {
    const storedRole = localStorage.getItem('adminView') as Role;
    this.view = storedRole;

    if (this.view === Role.Admin) {
      this.selectedTab = 5;
    }
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

  goToNotificationTabFromChild() {
    this.selectTab(4);
  }

}
