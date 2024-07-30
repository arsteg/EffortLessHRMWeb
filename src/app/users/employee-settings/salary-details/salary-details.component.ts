import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-salary-details',
  templateUrl: './salary-details.component.html',
  styleUrl: './salary-details.component.css'
})

export class SalaryDetailsComponent {
  searchText: string = '';
  isEdit: boolean = false;
  selectedRecord: any;
  salaryDetails: any;
  closeResult: string;
  showViewSalaryDetails: boolean = false;
  showAddSalaryDetails: boolean = false;
  @Input() selectedUser: any;
  constructor(private modalService: NgbModal) { }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  open(content: any) {

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  deleteAdvancecate(id: string): void {
    // const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    //   width: '400px',

    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result === 'delete') {
    //     this.deleteAdvanceCategory(id);
    //   }
    //   err => {
    //     this.toast.error('Can not be Deleted', 'Error!')
    //   }
    // });
  }
  deleteAdvanceCategory(id: string) {
    // this.expenseService.deleteAdvanceCategory(id).subscribe((res: any) => {
    //   this.getAllAdvanceCategories();
    //   this.toast.success('Successfully Deleted!!!', 'Advance Category')
    // },
    //   (err) => {
    //     this.toast.error('This category is already being used in an expense template!'
    //       , 'Advance Category, Can not be deleted!')
    //   })
  }

  toggleToViewSalaryDetails(){
    this.showViewSalaryDetails = !this.showViewSalaryDetails;
  }
  goBackToSalaryDetails() {
    this.showViewSalaryDetails = false;
    this.showAddSalaryDetails = false;
  }
}
