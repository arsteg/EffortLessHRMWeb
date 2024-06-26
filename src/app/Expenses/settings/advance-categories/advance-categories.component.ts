import { Component,OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpensesService } from 'src/app/_services/expenses.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-advance-categories',
  templateUrl: './advance-categories.component.html',
  styleUrl: './advance-categories.component.css'
})
export class AdvanceCategoriesComponent implements OnInit{
  searchText: '';
  isEdit = false;
  field: any = [];
  selectedCategory: any;
  p: number = 1;
  updatedCategory: any;
  originalFields: any[] = [];
  changeMode: 'Add' | 'Update' = 'Add';
  addCategory: FormGroup;
  closeResult: string = '';
  advanceCategories: any;
  changesMade: boolean =false;
  initialLabelValue:string;
  public sortOrder: string = '';
  updateButtonClicked = false;
  totalRecords: number
  recordsPerPage: number = 10;
  currentPage: number = 1;

  constructor(private fb: FormBuilder,
    private dialog: MatDialog,
    private modalService: NgbModal,
    private expenseService: ExpensesService ,
    private toast: ToastrService) {    
  
        this.addCategory = this.fb.group({
          label: ['', Validators.required]
       
        }) 
        // this.initialLabelValue = this.addCategory.get('label').value;
  
  }
  ngOnInit(){
   this.getAllAdvanceCategories();
  }
  onCancel() {
    this.isEdit = false;
    this.addCategory.reset();
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
  clearselectedRequest() {
    this.isEdit = false;
    this.addCategory.reset();
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllAdvanceCategories();
  }

  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getAllAdvanceCategories();
  }
  getAllAdvanceCategories() {
    let pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString()
    };
    this.expenseService.getAdvanceCatgories(pagination).subscribe((res: any) => {
      this.advanceCategories = res.data;
      this.totalRecords = res.total;
    })
  }

  addAdvanceCategories() {
    if (this.changeMode === 'Add') {
      let payload = {     
        label: this.addCategory.value['label'],  
      };

      this.expenseService.addAdvanceCategory(payload).subscribe((res: any) => {
        const newCategory = res.data;
        this.toast.success('Advance Category Created!', 'Successfully');
        this.advanceCategories.push(newCategory)
        if (this.addCategory.value['label'].length > 0) {
          let fieldsPayload = {
            fields: this.addCategory.value['label'],
            expenseCategory: newCategory._id
          };
        }
        this.clearselectedRequest();
      },
        err => {
          this.toast.error('This category is already exist', 'Error!!!')
        });
    }
    
  }

  updateAdvanceCategory() {
    let categoryPayload = {
      label: this.addCategory.value['label']
    };
  
    if (this.addCategory.get('label').dirty) {
      this.expenseService.updateAdvanceCategory(this.selectedCategory?._id, categoryPayload).subscribe((res: any) => {
        this.updatedCategory = res.data._id;
        this.toast.success('Advance Category Updated!', 'Successfully');
        this.getAllAdvanceCategories();
      },
      (err)=>{
        this.toast.error('Advance Category can not be Updated!', 'Error');
      });
    }
  }  

  editAdvanceCategory(category, index) {
    this.isEdit = true;
    this.selectedCategory = category;
    console.log(this.selectedCategory)
   
      this.addCategory.patchValue({
        
        label: category.label,      
        expenseCategory: this.selectedCategory._id,
      });
      console.log(this.addCategory.value)     
     this.changesMade=false;
  }

  

 
  deleteAdvancecate(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteAdvanceCategory(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }
  deleteAdvanceCategory(id: string) {
    this.expenseService.deleteAdvanceCategory(id).subscribe((res: any) => {
      this.getAllAdvanceCategories();
      this.toast.success('Successfully Deleted!!!', 'Advance Category')
    },
      (err) => {
        this.toast.error('This category is already being used in an expense template!'
          , 'Advance Category, Can not be deleted!')
      })
  }

}