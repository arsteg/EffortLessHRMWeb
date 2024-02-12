import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from 'src/app/common/common.service';
import { ApplicationStatusComponent } from '../application-status/application-status.component';
@Component({
  selector: 'app-interview-process-main',
  standalone: true,
  imports: [CommonModule,ApplicationStatusComponent],
  templateUrl: './interview-process-main.component.html',
  styleUrl: './interview-process-main.component.css'
})
export class InterviewProcessMainComponent {
  selectedTab : number = 1;

  constructor(private commonService: CommonService) { }

  selectTab(tabIndex: number) {
    this.commonService.setSelectedTab(tabIndex);
    this.selectedTab = tabIndex;
  }
}
