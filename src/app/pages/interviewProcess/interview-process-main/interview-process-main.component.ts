import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from 'src/app/common/common.service';
import { ApplicationStatusComponent } from '../application-status/application-status.component';
import { CandidatesComponent } from '../candidates/candidates.component';
import { CandidateDataFieldComponent } from '../candidate-data-field/candidate-data-field.component';
import { FeedbackFieldComponent } from '../feedback-field/feedback-field.component';
import { CandidateFeedbackComponent } from '../candidate-feedback/candidate-feedback.component';
import { ScheduleInterviewComponent } from '../schedule-interview/schedule-interview.component';
@Component({
  selector: 'app-interview-process-main',
  standalone: true,
  imports: [CommonModule,ApplicationStatusComponent,CandidatesComponent, CandidateDataFieldComponent,FeedbackFieldComponent,
    CandidateFeedbackComponent, ScheduleInterviewComponent],
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
