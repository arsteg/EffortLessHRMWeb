import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-run-payroll',
  templateUrl: './run-payroll.component.html',
  styleUrls: ['./run-payroll.component.css']
})
export class RunPayrollComponent implements OnInit {
  selectedTabIndex: number = 0;
  showTabs: boolean = true;

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const tab = params['tab'] || 'run-payroll';
      this.selectedTabIndex = tab === 'run-payroll' ? 0 : 1;
    });
  }

  selectTab(index: number) {
    this.selectedTabIndex = index;
    const tab = index === 0 ? 'run-payroll' : 'fnf-run-payroll';
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  toggleView() {
    this.showTabs = !this.showTabs;
  }
}
