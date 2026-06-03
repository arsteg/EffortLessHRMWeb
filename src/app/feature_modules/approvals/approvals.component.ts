import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent implements OnInit {
  selectedTab: number = 0;
  constructor(
    private route: ActivatedRoute
    ) { }

  ngOnInit(): void {
    // Check for tab query parameter to auto-select the correct tab
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'manual-time') {
        this.selectedTab = 1; // Manual Time tab index
      } else if (params['tab'] === 'productivity') {
        this.selectedTab = 0; // Productivity Apps tab index
      }
    });
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }


}
