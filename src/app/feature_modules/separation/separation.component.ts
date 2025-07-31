import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-separation',
  templateUrl: './separation.component.html',
  styleUrls: ['./separation.component.css']
})
export class SeparationComponent implements OnInit {
  selectedTab: number = 0;
  view = localStorage.getItem('adminView');

  constructor(private router: Router, private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
      this.view === 'user' ? this.onTabChange(0) : this.onTabChange(1);
  }
  selectTab(tabIndex: number) {
    this.selectedTab = tabIndex;
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    const path = index === 0 ? 'resignation' : 'termination';
    this.router.navigate([path], { relativeTo: this.route });
  }
}
