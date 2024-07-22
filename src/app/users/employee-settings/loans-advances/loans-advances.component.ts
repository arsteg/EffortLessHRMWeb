import { Component } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-loans-advances',
  templateUrl: './loans-advances.component.html',
  styleUrl: './loans-advances.component.css'
})
export class UserLoansAdvancesComponent {
  isEdit: boolean = false;
  searchText: string = '';
  loansAdvances: any;
  closeResult: string = '';

constructor( private modalService: NgbModal){}
  deleteLoansAdvances(id: string): void {
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
  deleteLoansAdvance(id: string) {
    // this.expenseService.deleteAdvanceCategory(id).subscribe((res: any) => {
    //   this.getAllAdvanceCategories();
    //   this.toast.success('Successfully Deleted!!!', 'Advance Category')
    // },
    //   (err) => {
    //     this.toast.error('This category is already being used in an expense template!'
    //       , 'Advance Category, Can not be deleted!')
    //   })
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
  open(content: any) {

    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

}
