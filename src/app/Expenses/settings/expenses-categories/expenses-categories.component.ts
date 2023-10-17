import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-expenses-categories',
  templateUrl: './expenses-categories.component.html',
  styleUrls: ['./expenses-categories.component.css']
})
export class ExpensesCategoriesComponent implements OnInit {
  searchText: string = '';
  changeMode: 'Add' | 'Update' = 'Add'; 
  closeResult: string = '';
  selectedExpenseType: string = ''
  categoryFields: any[] = [];

  constructor(private modalService: NgbModal,
    private dialog: MatDialog) { }

  ngOnInit(): void {
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }
  open(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  clearselectedRequest(){
    
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      // data: asset,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
      }
      (err) => {
        // this.toast.error('Can not be Deleted', 'Error!');
      };
    });
  }
 
  addCategoryField() {
    // Add an empty field to the array
    this.categoryFields.push({});
  }
  removeCatgoryField(index: number) {
    // Remove the field at the specified index from the array
    this.categoryFields.splice(index, 1);
  }
  submit(){
    console.log('Form submitted with expense type: ', this.selectedExpenseType);

  }

}
