import { Component } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';

@Component({
  selector: 'app-pf-charges',
  templateUrl: './pf-charges.component.html',
  styleUrl: './pf-charges.component.css'
})
export class PfChargesComponent {
  searchText: string = '';
  pfCharges: any;

  constructor(private payroll: PayrollService){}
  ngOnInit(){
    let payload ={
      next: '',
      skip: ''
    }
    this.payroll.getAllPFCharges(payload).subscribe(res=>{
      this.pfCharges = res.data;
    })
  }
}
