import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrl: './general-settings.component.css'
})
export class GeneralSettingsComponent {
  selectedTab: number = 1;
  generalSettings: any;
  closeResult: string = '';
  isEdit = false;
  regularization: any;
  members: any = [];
  activeTab: string = 'tabRoundingRules';
  generalSettingForm: FormGroup;
  selectedRecord: any;

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private payroll: PayrollService,
    private dialog: MatDialog,
    private toast: ToastrService
  ) {
    this.generalSettingForm = this.fb.group({

    })
  }

  ngOnInit() {

  }

  selectTab(tabId: string) {

    this.activeTab = tabId;
    console.log(this.activeTab);
    // this.loadRecords();
  }

  saveGeneralSettings() {

  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
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
  editReason() { }

  clearForm() { }

  deleteReason(_id: string) {
    // this.payroll.deleteReason(_id).subscribe((res: any) => {
    //   const index = this.regularization.findIndex(temp => temp._id === _id);
    //   if (index !== -1) {
    //     this.regularization.splice(index, 1);
    //   }
    //   this.toast.success('Successfully Deleted!!!', 'Regularization Reason')
    // },
    //   (err) => {
    //     this.toast.error('This Reason is already being used!'
    //       , 'Can not be deleted!')
    //   })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteReason(id);
      }
    });
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
    if (this.isEdit) {
      this.generalSettingForm.enable(); 
    } else {
      this.generalSettingForm.disable();
    }
  }
  resetSettings(){
    // this.ngOnInit();
    this.toggleEdit();
  }
}