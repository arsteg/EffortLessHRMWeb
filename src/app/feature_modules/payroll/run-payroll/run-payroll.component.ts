import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-run-payroll',
  templateUrl: './run-payroll.component.html',
  styleUrls: ['./run-payroll.component.css']
})
export class RunPayrollComponent implements OnInit {
  selectedTab: string = 'run-payroll';
  showTabs: boolean = true;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedTab = params['tab'] || 'run-payroll';
    });
  }

  selectTab(tabIndex: string) {
    this.selectedTab = tabIndex;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: this.selectedTab },
      queryParamsHandling: 'merge'
    });
  }

  toggleView() {
    this.showTabs = !this.showTabs;
  }
  
}
