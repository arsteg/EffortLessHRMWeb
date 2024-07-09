import { Component, ViewChild } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { MatDrawer } from '@angular/material/sidenav';
@Component({
  selector: 'app-fixed-contribution',
  templateUrl: './fixed-contribution.component.html',
  styleUrl: './fixed-contribution.component.css'
})
export class FixedContributionComponent {
  fixedContribution: any;
  searchText: string = '';
  closeResult: string = '';
  selectedRecord: any;
  isEdit: boolean = false;
  // @ViewChild('drawer') drawer: MatDrawer;

  constructor(private payroll: PayrollService  ) { }

  ngOnInit() {
    this.getFixedContribution();
  }
  getFixedContribution() {
    let payload = {
      skip: '',
      next: ''
    }
    this.payroll.getFixedContribution(payload).subscribe(data => {
      this.fixedContribution = data.data;
    });
  }

  // openDrawer(fc: any) {
  //   this.selectedRecord = fc;
  //   this.isEdit = true;
  //   this.drawer.open();
  // }
}
