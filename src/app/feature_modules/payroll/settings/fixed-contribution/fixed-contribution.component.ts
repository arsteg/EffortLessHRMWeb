import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { PayrollService } from 'src/app/_services/payroll.service';
import { Offcanvas } from 'bootstrap';
@Component({
  selector: 'app-fixed-contribution',
  templateUrl: './fixed-contribution.component.html',
  styleUrls: ['./fixed-contribution.component.css']
})
export class FixedContributionComponent {
  fixedContribution: any;
  searchText: string = '';
  closeResult: string = '';
  selectedRecord: any;
  isEdit: boolean = false;
  showOffcanvas: boolean = false;
  @ViewChild('offcanvasContent', { read: ViewContainerRef }) offcanvasContent: ViewContainerRef;
  offcanvasInstance: any;
  public sortOrder: string = '';


  constructor(private payroll: PayrollService) { }

  ngOnInit() {
    this.getFixedContribution();
  }
  getFixedContribution() {
    let payload = {
      skip: '',
      next: '10'
    }
    this.payroll.getFixedContribution(payload).subscribe((data: any) => {
      this.fixedContribution = data.data;
    });
  }

  openOffcanvas(offcanvasId: string) {
    this.showOffcanvas = true;
    const offcanvasElement = document.getElementById(offcanvasId);
    if (!this.offcanvasInstance) {
      this.offcanvasInstance = new Offcanvas(offcanvasElement);
    }
    this.offcanvasInstance.show();
  }
  
  closeOffcanvas() {
    const offcanvas = document.getElementById('contribution');
    if (offcanvas) {
      offcanvas.classList.remove('show'); // This is just an example to hide the offcanvas.
    }
    // this.showOffcanvas = false;
  }
}