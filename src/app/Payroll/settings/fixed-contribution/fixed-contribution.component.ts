import { Component, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  @ViewChild('drawer') drawer: MatDrawer;
  showFiller = false;

  constructor(private payroll: PayrollService,
    private modalService: NgbModal
  ){}

  ngOnInit(){
    this.getFixedContribution();
  }
  getFixedContribution(){
    let payload ={
      skip: '',
      next: ''
    }
    this.payroll.getFixedContribution(payload).subscribe(data => {
      this.fixedContribution = data.data;
    });
  }

  // open(content: any) {
  //   this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
  //     this.closeResult = `Closed with: ${result}`;

  //   }, (reason) => {

  //     this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //   });
  // }

  // private getDismissReason(reason: any): string {
  //   if (reason === ModalDismissReasons.ESC) {
  //     return 'by pressing ESC';
  //   } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
  //     return 'by clicking on a backdrop';
  //   } else {
  //     return `with: ${reason}`;
  //   }
  // }

  openDrawer(fc: any) {
    this.selectedRecord = fc;
    this.isEdit = true;
    this.drawer.open();
  }
}
