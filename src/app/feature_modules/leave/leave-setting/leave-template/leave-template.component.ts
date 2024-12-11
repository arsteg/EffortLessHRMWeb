import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { LeaveService } from 'src/app/_services/leave.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-leave-Template',
  templateUrl: './leave-template.component.html',
  styleUrls: ['./leave-template.component.css']
})
export class LeaveTemplateComponent implements OnInit {
  closeResult: string = '';
  searchText: string = '';
  changeMode: 'Add' | 'Next' = 'Add';
  step: number = 1;
  leaveTemplate: any[] = [];
  templates: any;
  @Output() LeaveTableRefreshed: EventEmitter<void> = new EventEmitter<void>();
  selectedTemplateId: any;
  isEdit: boolean = false;
  public sortOrder: string = ''; // 'asc' or 'desc'
  recordsPerPageOptions: number[] = [5, 10, 25, 50, 100]; // Add the available options for records per page
  recordsPerPage: number = 10; // Default records per page
  totalRecords: number=0; // Total number of records
  currentPage: number = 1;
  skip: string = '0';
  next = '10';


  constructor(private modalService: NgbModal,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private toast: ToastrService) { }

  ngOnInit(): void {   
    this.getLeaveTemplates();
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title',  backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      this.getLeaveTemplates();
    });
  }

  setFormValues(templateData: any) {
    this.leaveService.selectedTemplate.next(templateData);
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

  onChangeStep(event) {
    this.step = event;
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
      // this.addTemplateForm.reset();
    }
  }

  refreshLeaveTemplateTable() {
    const requestBody = { "skip": 0, "next": 100000 };
    this.leaveService.getLeavetemplates(requestBody).subscribe(
      (res) => {
        this.templates = res.data;
        this.getLeaveTemplates();
        //this.LeaveTableRefreshed.emit();
        
      },
      (error) => {
        console.error('Error refreshing leave template table:', error);
      }
    );
  }

  getLeaveTemplates() {
    const requestBody = { "skip": this.skip, "next": this.next };
    this.leaveService.getLeavetemplates(requestBody).subscribe((res: any) => {
      if(res.status=="success"){
        this.leaveTemplate = res.data;
        this.totalRecords = res.total;
        this.currentPage = Math.floor(parseInt(this.skip) / parseInt(this.next)) + 1;
      }
    })
  }
  
  deleteTemplate(_id: string) {
    this.leaveService.deleteTemplate(_id).subscribe((res: any) => {
      this.getLeaveTemplates();
      if(res != null){
        const index = this.templates.findIndex(temp => temp._id === _id);
        if (index !== -1) {
          this.templates.splice(index, 1);
        }
      }
      this.toast.success('Successfully Deleted!!!', 'Leave Template')
    },
      (err) => {
        this.toast.error('This Leave is already being used! Leave template, Can not be deleted!')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
    });
  }

  clearRequest() {
    if (this.changeMode == 'Add') {
      this.isEdit == true;
    }
  }
  calculateTotalEmployees(leaveTemp: any): number {
    let totalEmployees = 0;
    for (const category of leaveTemp.applicableCategories) {
      totalEmployees += category.templateApplicableCategoryEmployee.length;
    }
  
    return totalEmployees;
    console.log(totalEmployees)
  }

  // //Pagging related functions
  nextPagination() {
    if (!this.isNextButtonDisabled()) {
      const newSkip = (parseInt(this.skip) + parseInt(this.next)).toString();
      this.skip = newSkip;
      this.getLeaveTemplates();
    }
  }

  previousPagination() {
    if (!this.isPreviousButtonDisabled()) {
      const newSkip = (parseInt(this.skip) >= parseInt(this.next)) ? (parseInt(this.skip) - parseInt(this.next)).toString() : '0';
      this.skip = newSkip;
      this.getLeaveTemplates();
    }
  }
  firstPagePagination() {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.skip = '0';
      this.next = this.recordsPerPage.toString();
      this.getLeaveTemplates();
    }
  }
  lastPagePagination() {
    const totalPages = this.getTotalPages();
    if (this.currentPage !== totalPages) {
      this.currentPage = totalPages;
      this.updateSkip();
      this.getLeaveTemplates();
    }
  }
  updateSkip() {
    const newSkip = (this.currentPage - 1) * this.recordsPerPage;
    this.skip = newSkip.toString();
  }

  isNextButtonDisabled(): boolean {
    return this.currentPage === this.getTotalPages();
  }

  isPreviousButtonDisabled(): boolean {
    return this.skip === '0' || this.currentPage === 1;
  }
  updateRecordsPerPage() {
    this.currentPage = 1;
    this.skip = '0';
    this.next = this.recordsPerPage.toString();
    this.getLeaveTemplates();
  }
  getTotalPages(): number {
    const totalCount = this.totalRecords;
    return Math.ceil(totalCount / this.recordsPerPage);
  }
}
