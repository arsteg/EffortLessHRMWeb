import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-lwf-slab',
  templateUrl: './lwf-slab.component.html',
  styleUrl: './lwf-slab.component.css'
})
export class LwfSlabComponent {
  states: any;
  lwfSlabs: any;
  selectedData: any;
  isEdit: boolean = false;
  lwfSLabForm: FormGroup;
  closeResult: string = '';
  recordsPerPage: number = 10;
  totalRecords: number;
  currentPage: number = 1;
  searchText: string = '';
  selectedState: string = '';
  stateTouched: boolean = false;
  @Input() selectedRecord: any;
  eligibleStates: any;
  route: any;
  constructor(private payrollService: PayrollService,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private toast: ToastrService,
    private dialog: MatDialog
  ) {
    this.lwfSLabForm = this.fb.group({
      fixedContribution: ['', Validators.required],
      employeeAmount: [0, Validators.required],
      employerAmount: [0, Validators.required],
      
    })
  }

  ngOnInit() {
    this.payrollService.getAllStates().subscribe((res: any) => {
      this.eligibleStates = res.data;
    }); 
    this.getCompanyState();
    
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.getLwfSlab();
  }
  clearForm() {
    this.isEdit = false;
    this.lwfSLabForm.patchValue({
      fixedContribution: this.selectedRecord?._id,
      employeeAmount: 0,
      employerAmount: 0
    })
  }
  onRecordsPerPageChange(recordsPerPage: number) {
    this.recordsPerPage = recordsPerPage;
    this.getLwfSlab();
  }

  getLwfSlab() {
    const pagination = {
      skip: ((this.currentPage - 1) * this.recordsPerPage).toString(),
      next: this.recordsPerPage.toString(),
      state:this.selectedState
    };
    this.payrollService.getLWFByState(pagination).subscribe((res: any) => {
      this.lwfSlabs = res.data;
      this.totalRecords = res.total;
    })
  }
  getCompanyState()
  {
    this.companyService.getCompany().subscribe((res: any) => {
      this.selectedState = res.data.company.state;
      this.getLwfSlab();
    })
  }
  editRecord() {
    console.log(this.selectedData);
    this.lwfSLabForm.patchValue(this.selectedData);
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  onSubmission() {
    const payload = {
      ...this.lwfSLabForm.value,
      state: this.selectedState
    };
  
    if (!this.isEdit) {
      this.payrollService.addLWF(payload).subscribe((res) => {  
        this.getLwfSlab();     
        this.toast.success('Successfully Added!!!', 'LWF Slab');
      }, (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || 'LWF Slab can not be added.';
        this.toast.error(errorMessage, 'Error!');  });
    } else {
      this.payrollService.updateLWF(this.selectedData._id, payload).subscribe((res) => {      
        this.getLwfSlab();   
        this.lwfSLabForm.reset();
        this.toast.success('Successfully Updated!!!', 'LWF Slab');
      }, (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || 'LWF Slab can not be updated.';
        this.toast.error(errorMessage, 'Error!');
      });
    }  
    this.closeModal(); // Optionally close the modal after submission
  }  

  deleteRecord(_id: string) {
    this.payrollService.deleteLWF(_id).subscribe((res: any) => {
      const index = this.lwfSlabs.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.lwfSlabs.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'LWF Slab');
    },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
        || 'LWF Slab can not be deleted.';
        this.toast.error(errorMessage, 'Error!');   })

  }


  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteRecord(id);
      }
    });
  }
  handleAdd(modal: any) {
    this.stateTouched = true;
    if (!this.selectedState) {
      this.toast.warning('Please select a state before adding.');
      return;
    }
  
    this.isEdit = false;
    this.clearForm();
    this.open(modal);
  }
  
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
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
}
