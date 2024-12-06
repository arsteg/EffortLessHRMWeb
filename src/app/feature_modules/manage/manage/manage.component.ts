import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/_services/common.Service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  selectedTab : number = 1;

  constructor(private commonService: CommonService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
  //   this.route.fragment.subscribe(fragment => {
  //     if (fragment === 'tab3') {
  //         this.selectedTab = 3;
  //     }
  // });
  }
  selectTab(tabIndex: number) {
    this.commonService.setSelectedTab(tabIndex);
    this.selectedTab = tabIndex;
  }

  handleBackClick() {
    console.log(this.selectTab)
    this.selectedTab = 3;
    console.log(this.selectTab)
  }

}
