import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/_services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from 'src/app/common/common.service';
import { AttendanceRegularizationComponent } from './attendance-regularization/attendance-regularization.component';
import { ExportService } from 'src/app/_services/export.service';
import { AttendanceService } from 'src/app/_services/attendance.service';
import { GeneralTemplateSettingsComponent } from './general-template-settings/general-template-settings.component';

@Component({
  selector: 'app-attendance-template',
  templateUrl: './attendance-template.component.html',
  styleUrl: './attendance-template.component.css',
})
export class AttendanceTemplateComponent {
  closeResult: string = '';
  p: number = 1;
  step: number = 1;
  searchText: string = '';
  isEdit: boolean = false;
  attendanceTemplate: any;
  selectedTemplateId: any;
  changeMode: 'Add' | 'Next' = 'Add';


  constructor(private modalService: NgbModal,
    private auth: AuthenticationService,
    private dialog: MatDialog,
    private commonService: CommonService,
    private exportService: ExportService,
    private attendanceService: AttendanceService) { }

    ngOnInit(){
      this.getAttendanceTemplate();
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

  onChangeStep(event) {
    this.step = event;
  }

  onChangeMode(event) {
    if (this.isEdit = true) {
      this.changeMode = event
    }
  }

  onClose(event) {
    if (event) {
      this.modalService.dismissAll();
    }
  }

  refreshExpenseReportTable() {
    // this.expenseService.getExpenseReportByUser(this.currentUser.id).subscribe((res: any) => {
    //   this.expenseReport = res.data;
    //   this.totalAmount = this.expenseReport.reduce((total, report) => total + report.amount, 0);
    //   this.expenseTemplateReportRefreshed.emit();
    // })
  }

  openSecondModal(selectedReport: any): void {
    // const categoryLabel = this.getCategory(selectedReport.category);
    // selectedReport.category = categoryLabel;
    // this.expenseService.advanceReport.next(selectedReport);
    const dialogRef = this.dialog.open(GeneralTemplateSettingsComponent, {
      width: '50%',
      data: { report: selectedReport }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  exportToCsv() {
    const dataToExport = this.attendanceTemplate;
    this.exportService.exportToCSV('My-Expense-Report', 'My-Expense-Report', dataToExport);
  }

  getAttendanceTemplate() {
    this.attendanceService.getAttendanceTemplate().subscribe((res: any) => {
      this.attendanceTemplate = res.data;
    })
  }

  setFormValues(templateData: any) {
    this.attendanceService.selectedTemplate.next(templateData);
  }
  
}
