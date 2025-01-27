import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PayrollService } from 'src/app/_services/payroll.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pf-charges',
  templateUrl: './pf-charges.component.html',
  styleUrls: ['./pf-charges.component.css']
})
export class PfChargesComponent {
  searchText: string = '';
  pfCharges: any;
  public sortOrder: string = '';

  // Reference to the dialog template
  @ViewChild('pfChargeDialog') pfChargeDialog!: TemplateRef<any>;

  // Reactive form for PF Charge
  pfChargeForm: FormGroup;
  users: any[] = [];

  constructor(
    private payroll: PayrollService,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    // Initialize the form
    this.pfChargeForm = this.fb.group({
      name: ['', Validators.required],
      frequency: ['monthly', Validators.required],
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

  // Open the dialog
  openDialog(): void {
    const dialogRef = this.dialog.open(this.pfChargeDialog, {
      width: '400px',
      disableClose: true // Prevents closing by clicking outside the dialog
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        console.log('Form Data:', result);
        // Handle form submission here (e.g., call a service to save the data)
      }
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.pfChargeForm.valid) {
      this.dialog.closeAll(); // Close the dialog
      console.log('Form Value:', this.pfChargeForm.value);
      this.payroll.addPFCharges(this.pfChargeForm.value).subscribe((res: any) => {
        this.toast.success('PF Charge added successfully');
        this.loadPFCharges(); // Refresh the list
      });
    }
  }
}