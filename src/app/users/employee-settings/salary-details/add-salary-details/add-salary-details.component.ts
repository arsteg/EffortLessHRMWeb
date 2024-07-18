import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'app-add-salary-details',
  templateUrl: './add-salary-details.component.html',
  styleUrl: './add-salary-details.component.css'
})
export class AddSalaryDetailsComponent {
  @Output() backToSalaryDetails = new EventEmitter<void>();
  disableSelect = new FormControl(false);

  constructor() { }

  ngOnInit() {
    console.log('add salary details page')
  }

}
