import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';
import { TableColumn } from 'src/app/models/table-column';

@Component({
  selector: 'app-pf-charges',
  templateUrl: './pf-charges.component.html',
  styleUrls: ['./pf-charges.component.css']
})
export class PfChargesComponent {
  searchText: string = '';
  pfCharges: any;
  public sortOrder: string = '';

  @ViewChild('pfChargeDialog') pfChargeDialog!: TemplateRef<any>;

  pfChargeForm: FormGroup;
  users: any[] = [];

  columns: TableColumn[] = [
    {
      key: 'name',
      name: 'PF Charges Name',
      valueFn: (row) => row.name || ''
    },
    {
      key: 'frequency',
      name: 'Frequency',
      valueFn: (row) => row.frequency || ''
    },
    {
      key: 'percentage',
      name: 'Percentage',
      valueFn: (row) => row.percentage || 0
    }
  ];

  constructor(
    private payroll: PayrollService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.pfChargeForm = this.fb.group({
      name: ['', Validators.required],
      frequency: ['annually', Validators.required],
      percentage: [100, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadPFCharges();
  }

  loadPFCharges() {
    this.payroll.getAllPFCharges({ next: '', skip: '' }).subscribe((pfCharges: any) => {
      this.pfCharges = pfCharges.data;
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.pfChargeDialog, {
      width: '400px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  onSubmit(): void {
    if (this.pfChargeForm.valid) {
      this.dialog.closeAll();
      this.payroll.addPFCharges(this.pfChargeForm.value).subscribe((res: any) => {
        this.toast.success('PF Charge added successfully');
        this.loadPFCharges();
      });
    }
  }
}