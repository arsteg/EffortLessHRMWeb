import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generate-payslips',
  templateUrl: './generate-payslips.component.html',
  styleUrl: './generate-payslips.component.css'
})
export class GeneratePayslipsComponent {
  @Input() payslip: any;
  @Output() close = new EventEmitter<void>();
}
