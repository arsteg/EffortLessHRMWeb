import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.css']
})
export class ExpensesComponent implements OnInit {
  selectedTab = 1;
  view = localStorage.getItem('adminView');

  constructor() { }

  ngOnInit(): void {
  }

  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }
}