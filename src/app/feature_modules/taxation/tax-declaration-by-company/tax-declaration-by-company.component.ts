import { Component, OnInit } from '@angular/core';
import { TaxationService } from 'src/app/_services/taxation.service';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tax-declaration-by-company',
  templateUrl: './tax-declaration-by-company.component.html',
  styleUrls: ['./tax-declaration-by-company.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TaxDeclarationByCompanyComponent implements OnInit {
  displayedColumns: string[] = ['financialYear', 'user'];
  displayedColumnsWithIcon: string[] = [...this.displayedColumns, 'expandIcon'];
  dataSource = new MatTableDataSource<any>([]);
  expandedElement: any | null = null;
  expandedHRA: any | null = null;
  editingComponent: any | null = null;
  editingHRA: any | null = null;
  originalComponent: any = null;
  originalHRA: any = null;
  componentForm: FormGroup;
  hraForm: FormGroup;

  constructor(
    private taxService: TaxationService,
    private fb: FormBuilder,
    private translate: TranslateService,
    private toast: ToastrService
  ) {
    this.componentForm = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      incomeTaxComponent: [''],
      approvedAmount: [null, [Validators.required, Validators.min(0), this.amountValidator.bind(this)]],
      approvalStatus: ['', Validators.required],
      remark: ['', this.remarkValidator.bind(this)]
    });

    this.hraForm = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      verifiedAmount: [null, [Validators.required, Validators.min(0), this.hraAmountValidator.bind(this)]],
      approvalStatus: ['', Validators.required],
      month: [''],
      rentDeclared: [null],
      cityType: [''],
      landlordName: [''],
      landlordPan: [''],
      landlordAddress: ['']
    });
  }

  ngOnInit() {
    this.getAlltaxDecalartions();
  }

  // Custom validator for approvedAmount
  amountValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.editingComponent) return null;
    const approvedAmount = +control.value;
    const appliedAmount = +this.editingComponent.appliedAmount;
    const maximumAmount = +this.editingComponent.maximumAmount;
    if (isNaN(approvedAmount)) return { required: true };
    if (approvedAmount > appliedAmount) return { exceedsApplied: true };
    if (approvedAmount > maximumAmount) return { exceedsMaximum: true };
    return null;
  }

  // Custom validator for remark (required when approvalStatus is Approved)
  remarkValidator(control: AbstractControl): ValidationErrors | null {
    const approvalStatus = this.componentForm?.get('approvalStatus')?.value;
    if (approvalStatus === 'Approved' && (!control.value || control.value.trim() === '')) {
      return { remarkRequired: true };
    }
    return null;
  }

  // Custom validator for HRA verifiedAmount
  hraAmountValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.editingHRA) return null;
    const verifiedAmount = +control.value;
    const rentDeclared = +this.editingHRA.rentDeclared;
    if (isNaN(verifiedAmount)) return { required: true };
    if (verifiedAmount > rentDeclared) return { exceedsRentDeclared: true };
    return null;
  }

  getAlltaxDecalartions() {
    this.taxService.getAllTaxDeclarationsByCompany({ skip: '', next: '' }).subscribe((res: any) => {
      const processedData = res.data.map((item: any) => ({
        ...item,
        groupedComponents: this.groupComponentsBySection(item.incomeTaxDeclarationComponent || [])
      }));
      this.dataSource.data = processedData;
    });
  }

  groupComponentsBySection(components: any[]): any[] {
    const sectionMap = new Map<string, any>();
    components.forEach((component: any) => {
      const section = component?.incomeTaxComponent?.section?.section || 'Uncategorized';
      if (!sectionMap.has(section)) {
        sectionMap.set(section, { section, components: [] });
      }
      sectionMap.get(section).components.push(component);
    });
    return Array.from(sectionMap.values());
  }

  toggleRow(element: any) {
    this.expandedElement = this.expandedElement === element ? null : element;
    this.expandedHRA = null;
    this.resetEditing();
  }

  toggleHRA(element: any) {
    this.expandedHRA = this.expandedHRA === element ? null : element;
  }

  startEditing(type: string, item: any) {
    if (type === 'component') {
      this.editingComponent = item;
      this.originalComponent = { ...item };
      this.componentForm.patchValue({
        employeeIncomeTaxDeclaration: item.employeeIncomeTaxDeclaration,
        incomeTaxComponent: item.incomeTaxComponent?._id,
        approvedAmount: item.approvedAmount,
        approvalStatus: item.approvalStatus,
        remark: item.remark
      });
    } else if (type === 'hra') {
      this.editingHRA = item;
      this.originalHRA = { ...item };
      this.hraForm.patchValue({
        employeeIncomeTaxDeclaration: item.employeeIncomeTaxDeclaration,
        verifiedAmount: item.verifiedAmount,
        approvalStatus: item.approvalStatus,
        month: item.month,
        rentDeclared: item.rentDeclared,
        cityType: item.cityType,
        landlordName: item.landlordName,
        landlordPan: item.landlordPan,
        landlordAddress: item.landlordAddress
      });
    }
  }

  cancelEditing(type: string) {
    if (type === 'component' && this.editingComponent && this.originalComponent) {
      Object.assign(this.editingComponent, this.originalComponent);
      this.editingComponent = null;
      this.originalComponent = null;
      this.componentForm.reset();
    } else if (type === 'hra' && this.editingHRA && this.originalHRA) {
      Object.assign(this.editingHRA, this.originalHRA);
      this.editingHRA = null;
      this.originalHRA = null;
      this.hraForm.reset();
    }
    this.dataSource.data = [...this.dataSource.data];
  }

  saveEditing(type: string, item: any) {
    if (type === 'component') {
      this.componentForm.markAllAsTouched();
      if (this.componentForm.invalid) {
        console.log('Component form invalid:', {
          errors: this.componentForm.errors,
          value: this.componentForm.value,
          controls: {
            approvedAmount: this.componentForm.get('approvedAmount')?.errors,
            approvalStatus: this.componentForm.get('approvalStatus')?.errors,
            remark: this.componentForm.get('remark')?.errors
          }
        });
        this.toast.error(this.translate.instant('taxation.validation_failed'), this.translate.instant('taxation.toast.error'));
        return;
      }

      const payload = {
        employeeIncomeTaxDeclaration: this.componentForm.value.employeeIncomeTaxDeclaration,
        incomeTaxComponent: this.componentForm.value.incomeTaxComponent,
        approvedAmount: +this.componentForm.value.approvedAmount,
        approvalStatus: this.componentForm.value.approvalStatus,
        remark: this.componentForm.value.remark?.trim()
      };

      this.taxService.updateIncTaxDecComponent(payload).subscribe({
        next: (res: any) => {
          console.log('Component update response:', res);
          // Update item with API response data to preserve incomeTaxComponent
          if (res.data) {
            Object.assign(item, {
              ...res.data,
              incomeTaxComponent: item.incomeTaxComponent // Preserve original incomeTaxComponent
            });
          } else {
            // Fallback: Merge payload while preserving incomeTaxComponent
            Object.assign(item, {
              approvedAmount: payload.approvedAmount,
              approvalStatus: payload.approvalStatus,
              remark: payload.remark
            });
          }
          // Recalculate groupedComponents for the parent element
          const parentElement = this.dataSource.data.find(e => e.incomeTaxDeclarationComponent.includes(item));
          if (parentElement) {
            parentElement.groupedComponents = this.groupComponentsBySection(parentElement.incomeTaxDeclarationComponent);
          }
          this.editingComponent = null;
          this.originalComponent = null;
          this.componentForm.reset();
          this.toast.success(
            this.translate.instant('taxation.component_updated'),
            this.translate.instant('taxation.toast.success')
          );
          this.dataSource.data = [...this.dataSource.data];
        },
        error: (err) => {
          console.error('Component update error:', err);
          this.toast.error(
            err?.message || this.translate.instant('taxation.failed_to_update_component'),
            this.translate.instant('taxation.toast.error')
          );
        }
      });
    } else if (type === 'hra') {
      this.hraForm.markAllAsTouched();
      if (this.hraForm.invalid) {
        console.log('HRA form invalid:', {
          errors: this.hraForm.errors,
          value: this.hraForm.value,
          controls: {
            verifiedAmount: this.hraForm.get('verifiedAmount')?.errors,
            approvalStatus: this.hraForm.get('approvalStatus')?.errors
          }
        });
        this.toast.error(this.translate.instant('taxation.validation_failed'), this.translate.instant('taxation.toast.error'));
        return;
      }

      const payload = {
        employeeIncomeTaxDeclaration: this.hraForm.value.employeeIncomeTaxDeclaration,
        verifiedAmount: +this.hraForm.value.verifiedAmount,
        approvalStatus: this.hraForm.value.approvalStatus,
        month: this.hraForm.value.month,
        rentDeclared: this.hraForm.value.rentDeclared,
        cityType: this.hraForm.value.cityType,
        landlordName: this.hraForm.value.landlordName,
        landlordPan: this.hraForm.value.landlordPan,
        landlordAddress: this.hraForm.value.landlordAddress
      };

      this.taxService.updateIncTaxDecHRA(payload).subscribe({
        next: (res: any) => {
          console.log('HRA update response:', res);
          Object.assign(item, res.data || payload);
          this.editingHRA = null;
          this.originalHRA = null;
          this.hraForm.reset();
          this.dataSource.data = [...this.dataSource.data];
          this.toast.success(
            this.translate.instant('taxation.hra_updated'),
            this.translate.instant('taxation.toast.success')
          );
        },
        error: (err) => {
          console.error('HRA update error:', err);
          this.toast.error(
            err?.message || this.translate.instant('taxation.failed_to_update_hra'),
            this.translate.instant('taxation.toast.error')
          );
        }
      });
    }
  }

  resetEditing() {
    this.editingComponent = null;
    this.editingHRA = null;
    this.originalComponent = null;
    this.originalHRA = null;
    this.componentForm.reset();
    this.hraForm.reset();
  }

  onStatusChange(element: any, type: string, item: any, event: any) {
    const newStatus = event.value;
    if (type === 'component') {
      this.componentForm.patchValue({ approvalStatus: newStatus });
    } else if (type === 'hra') {
      this.hraForm.patchValue({ approvalStatus: newStatus });
    }
  }

  onBulkHRAupdate(hraArray: any[], approvalStatus: string) {
    if (!hraArray || hraArray.length === 0) {
      this.toast.error(this.translate.instant('taxation.no_hra_entries_to_update'), this.translate.instant('taxation.toast.error'));
      return;
    }

    const id = hraArray[0]?.employeeIncomeTaxDeclaration;
    const financialYear = hraArray[0]?.financialYear;

    const payload = {
      financialYear: financialYear,
      employeeIncomeTaxDeclarationHRA: hraArray.map(hra => ({
        verifiedAmount: approvalStatus === 'Approved' ? (hra?.verifiedAmount || 0) : hra?.verifiedAmount,
        approvalStatus: approvalStatus,
        month: hra?.month,
        rentDeclared: hra?.rentDeclared,
        cityType: hra?.cityType,
        landlordName: hra?.landlordName,
        landlordPan: hra?.landlordPan,
        landlordAddress: hra?.landlordAddress
      }))
    };

    this.taxService.updateIncomeTax(id, payload).subscribe({
      next: (res: any) => {
        console.log('Bulk HRA update response:', res);
        this.toast.success(this.translate.instant('taxation.all_hra_updated'), this.translate.instant('taxation.toast.success'));
        if (this.expandedElement && res.data?.employeeIncomeTaxDeclarationHRA) {
          this.expandedElement.incomeTaxDeclarationHRA = res.data.employeeIncomeTaxDeclarationHRA;
        } else {
          this.expandedElement.incomeTaxDeclarationHRA = hraArray.map(hra => ({
            ...hra,
            verifiedAmount: approvalStatus === 'Approved' ? (hra.verifiedAmount || 0) : hra.verifiedAmount,
            approvalStatus: approvalStatus
          }));
        }
        this.dataSource.data = [...this.dataSource.data];
      },
      error: (err) => {
        console.error('Bulk HRA update error:', err);
        this.toast.error(
          err?.message || this.translate.instant('taxation.failed_to_update_bulk_hra'),
          this.translate.instant('taxation.toast.error')
        );
      }
    });
  }

  openAttachment(url: string, attachmentName: any): void {
    if (url && attachmentName) {
      const index = url.indexOf(attachmentName);
      if (index !== -1) {
        const trimmedUrl = url.substring(0, index + attachmentName.length);
        const link = document.createElement('a');
        link.href = trimmedUrl;
        link.download = attachmentName;
        link.click();
      } else {
        this.toast.error(this.translate.instant('taxation.attachment_name_not_found'), this.translate.instant('taxation.toast.error'));
      }
    } else {
      this.toast.error(this.translate.instant('taxation.attachment_missing'), this.translate.instant('taxation.toast.error'));
    }
  }
}