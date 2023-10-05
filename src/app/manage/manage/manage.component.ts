import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/common/common.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  selectedTab : number = 1;

  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
  }
  selectTab(tabIndex: number) {
    this.commonService.setSelectedTab(tabIndex);
    this.selectedTab = tabIndex;
  }
}
