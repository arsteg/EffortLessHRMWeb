import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { CompanyService } from 'src/app/_services/company.service';
import { ConfirmationDialogComponent } from 'src/app/tasks/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrl: './zone.component.css'
})
export class ZoneComponent {
  zones: any;
  zoneForm: FormGroup;
  closeResult: string;
  isEdit: boolean = false;
  searchText: string = '';
  selectedZone: any;
  public sortOrder: string = '';

  constructor(private companyService: CompanyService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toast: ToastrService) {
    this.zoneForm = this.fb.group({
      startDate: ['', Validators.required],
      zoneCode: ['', Validators.required],
      zoneName: ['', Validators.required],
      description: [''],
      status: ['', Validators.required]
    })
  }

  ngOnInit() {
    this.getZones();
  }

  getZones() {
    this.companyService.getZones().subscribe(res => {
      this.zones = res.data;
    });
  }

  onSubmission() {
    // add zone
    if (!this.isEdit) {
      this.companyService.addZone(this.zoneForm.value).subscribe(res => {
        this.zones.push(res.data);
        this.toast.success('Zone added successfully', 'Success');
        this.zoneForm.reset();
      },
        err => { this.toast.error('Zone Can not be Added', 'Error') }
      );
    }
    // updateZone
    else if (this.isEdit) {
      this.companyService.updateZone(this.selectedZone._id, this.zoneForm.value).subscribe(res => {
        this.toast.success('Zone updated successfully', 'Success');
        const index = this.zones.findIndex(z => z._id === this.selectedZone._id);
        if (index !== -1) {
          this.zones[index] = { ...this.selectedZone, ...this.zoneForm.value };
        }
        this.zoneForm.reset();
        this.isEdit = false;
        this.zoneForm.get('zoneCode').enable();
        this.zoneForm.get('zoneName').enable();
      },
        err => { this.toast.error('Zone Can not be Updated', 'Error') }
      );
    }
  }

  edit(data: any) {
    this.zoneForm.patchValue({
      startDate: data.startDate,
      zoneCode: data.zoneCode,
      zoneName: data.zoneName,
      description: data.description,
      status: data.status
    });
    this.zoneForm.get('zoneCode').disable();
    this.zoneForm.get('zoneName').disable();
  }

  clearselectedRequest() {
    this.isEdit = false;
    this.zoneForm.get('zoneCode').enable();
    this.zoneForm.get('zoneName').enable();
    this.zoneForm.reset();
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

  deleteZone(id: string) {
    this.companyService.deleteZone(id).subscribe((res: any) => {
      this.getZones();
      this.toast.success('Successfully Deleted!!!', 'Zone')
    },
      (err) => {
        this.toast.error('This ZOne Can not be deleted', 'Error')
      })
  }

  deleteDialog(id: string): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deleteZone(id);
      }
      err => {
        this.toast.error('Can not be Deleted', 'Error!')
      }
    });
  }

}
