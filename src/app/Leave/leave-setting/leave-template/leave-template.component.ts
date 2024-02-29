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
  leaveTemplate: any;
  templates: any;
  @Output() LeaveTableRefreshed: EventEmitter<void> = new EventEmitter<void>();
  selectedTemplateId: any;
  isEdit: boolean = false;
  p: number = 1;


  constructor(private modalService: NgbModal,
    private leaveService: LeaveService,
    private dialog: MatDialog,
    private toast: ToastrService) { }

  ngOnInit(): void {
    this.getLeaveTemplates();
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  setFormValues(templateData: any) {
    console.log(templateData)
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
    this.leaveService.getLeavetemplates().subscribe(
      (res) => {
        this.templates = res.data;
        this.getLeaveTemplates();
        this.LeaveTableRefreshed.emit();
      },
      (error) => {
        console.error('Error refreshing leave template table:', error);
      }
    );
  }

  getLeaveTemplates() {
    this.leaveService.getLeavetemplates().subscribe((res: any) => {
      this.leaveTemplate = res.data;
    })
  }

  deleteTemplate(_id: string) {
    this.leaveService.deleteTemplate(_id).subscribe((res: any) => {
      const index = this.templates.findIndex(temp => temp._id === _id);
      if (index !== -1) {
        this.templates.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'Leave Template')
    },
      (err) => {
        this.toast.error('This Leave is already being used!'
          , 'Leave template, Can not be deleted!')
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
}
