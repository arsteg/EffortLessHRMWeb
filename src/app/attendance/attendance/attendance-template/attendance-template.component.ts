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
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';
import { ToastrService } from 'ngx-toastr';

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
  regularizations: any;

  constructor(private modalService: NgbModal,
    private dialog: MatDialog,
    private exportService: ExportService,
    private toast: ToastrService,
    private attendanceService: AttendanceService) { }

    ngOnInit(){
      this.getAttendanceTemplate();
      // this.getRegularizations();
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
    console.log(this.step)
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

  exportToCsv() {
    const dataToExport = this.attendanceTemplate;
    this.exportService.exportToCSV('attendance-template', 'attendance-template', dataToExport);
  }

  getAttendanceTemplate() {
    this.attendanceService.getAttendanceTemplate().subscribe((res: any) => {
      this.attendanceTemplate = res.data;
    })
  }

  setFormValues(templateData: any) {
    this.attendanceService.selectedTemplate.next(templateData);
  }
  
  deleteTemplate(id: string) {
    this.attendanceService.deleteAttendanceTemplate(id).subscribe((res: any) => {
      this.getAttendanceTemplate();
      this.toast.success('Successfully Deleted!!!', 'Attendance Template')
    },
      (err) => {
        this.toast.error('This Attendance Template Can not be deleted'
          , 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteTemplate(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

  getRegularizations() {
    this.attendanceService.getRegularizations().subscribe((res: any) => {
      this.regularizations = res.data;
    })
  }
}
