import { Component } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrl: './payslips.component.css'
})
export class PayslipsComponent {
  closeResult: string = '';
  searchText: string = '';
  showPayslipDetail: boolean;

  constructor(private modalService: NgbModal) { }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  viewPayslip() {
    // this.selectedPayslip = payslip;
    this.showPayslipDetail = true;
  }

  closePayslipDetail() {
    this.showPayslipDetail = false;
    // this.selectedPayslip = null;
  }
}