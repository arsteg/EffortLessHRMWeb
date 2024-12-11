import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-view-salary-details',
  templateUrl: './view-salary-details.component.html',
  styleUrl: './view-salary-details.component.css'
})
export class ViewSalaryDetailsComponent {
  @Output() backToSalaryDetails = new EventEmitter<void>();

}
