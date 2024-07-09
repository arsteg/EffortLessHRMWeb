import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-configure-state',
  templateUrl: './configure-state.component.html',
  styleUrl: './configure-state.component.css'
})
export class ConfigureStateComponent {
  closeResult: string;
  isEdit = true;
  configuredState: any;
  selectedData: any;
  searchText: string = '';

  constructor(
    private modalService: NgbModal,
    private payroll: PayrollService,
    private toast: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    console.log(this.isEdit);
    this.getState();
  }
  closeModal() {
    this.modalService.dismissAll();
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
  getState() {
    this.payroll.getAllConfiguredStates().subscribe((res: any) => {
      this.configuredState = res.data;
    })
  }

  deleteRecord(_id: string) {
    this.payroll.deleteConfiguredState(_id).subscribe((res: any) => {
      const index = this.configuredState.findIndex(res => res._id === _id);
      if (index !== -1) {
        this.configuredState.splice(index, 1);
      }
      this.toast.success('Successfully Deleted!!!', 'LWF Slab');
    },
      (err) => {
        this.toast.error('LWF Slab can not be deleted', 'LWF Slab');
      })

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

  closeUpdateStateModal(modal) {
    this.getState();
    modal.close();
  }
}
