import { Component } from '@angular/core';

@Component({
  selector: 'app-deduction',
  templateUrl: './deduction.component.html',
  styleUrl: './deduction.component.css'
})
export class DeductionComponent {
  months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  deductionMonth: any;
ngOnInit(){
  console.log('testing...')
}
}
