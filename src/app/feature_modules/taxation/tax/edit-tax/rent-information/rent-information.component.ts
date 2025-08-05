import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ValidationErrors, AbstractControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-rent-information',
  templateUrl: './rent-information.component.html',
  styleUrls: ['./rent-information.component.css']
})
export class RentInformationComponent {
  incomeTaxDeclaration: any;
  isEdit: boolean = false;
  monthsArray: string[];

  @Input() selectedRecord: any;
  @Input() actionType: boolean;
  @Input() sectionId: string;

  incomeTaxDeclarationForm: FormGroup;
  formGroup: FormGroup;
  metroDeclaredRent: number = 0;
  nonMetroDeclaredRent: number = 0;

  constructor(
    private fb: FormBuilder,
    private taxService: TaxationService,
    private toast: ToastrService,
    private translate: TranslateService,
    private userService: UserService
  ) {
    this.formGroup = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      employeeIncomeTaxDeclarationHRA: this.fb.array([]),
      rentDeclared: [null, [Validators.required, this.rentValidation.bind(this)]],
      month: [''],
      verifiedAmount: [{ value: 0, disabled: true }],
      cityType: ['', Validators.required],
      landlordName: ['', Validators.required],
      landlordPan: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/), Validators.required]],
      landlordAddress: ['', Validators.required],
      approvalStatus: [''],
      documentLink: [''],
      isEditable: [false],
      section: [''],
      employeeIncomeTaxDeclarationAttachments: this.fb.array([])
    });

    this.incomeTaxDeclarationForm = this.fb.group({
      financialYear: [''],
      employeeIncomeTaxDeclarationHRA: this.fb.array([])
    });
  }

  ngOnInit() {
    console.log(this.sectionId);
    const months = this.getMonthsArray();
    this.monthsArray = months;
    this.formGroup.setControl('employeeIncomeTaxDeclarationHRA', this.fb.array([]));

    const form = this.formGroup.get('employeeIncomeTaxDeclarationHRA') as FormArray;
    this.userService.getBasicSalaryByUserId(this.selectedRecord?.user?._id).subscribe((res: any) => {
      const basicSalary = res.data;
      this.metroDeclaredRent = (basicSalary * 0.5);
      this.nonMetroDeclaredRent = (basicSalary * 0.4);
      this.validateRentDeclared();
    }, (error) => {
      this.toast.error(this.translate.instant('taxation.failed_to_fetch_salary'), this.translate.instant('taxation.toast.error'));
    });

    months.forEach((month, index) => {
      const data = this.selectedRecord?.incomeTaxDeclarationHRA?.find(item => item.month === month) || {};
      const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
      formGroup.patchValue({
        month: month,
        rentDeclared: data.rentDeclared || null,
        verifiedAmount: data.verifiedAmount || 0,
        cityType: data.cityType || '',
        landlordName: data.landlordName || '',
        landlordPan: data.landlordPan || '',
        landlordAddress: data.landlordAddress || '',
        approvalStatus: data.approvalStatus || 'Pending',
        documentLink: data.documentLink || ''
      });
      const attachmentsArray = formGroup.get('employeeIncomeTaxDeclarationAttachments') as FormArray;
      if (data.employeeIncomeTaxDeclarationAttachments && Array.isArray(data.employeeIncomeTaxDeclarationAttachments)) {
        data.employeeIncomeTaxDeclarationAttachments.forEach(attachment => {
          attachmentsArray.push(this.fb.group({
            attachmentType: attachment.attachmentType || '',
            attachmentName: attachment.attachmentName || '',
            attachmentSize: attachment.attachmentSize || 0,
            extention: attachment.extention || '',
            file: attachment.file || ''
          }));
        });
      }
      this.employeeIncomeTaxDeclarationHRA.push(formGroup);
    });

    this.formGroup.get('cityType')?.valueChanges.subscribe(() => {
      this.validateRentDeclared();
    });
    this.formGroup.get('rentDeclared')?.valueChanges.subscribe(() => {
      this.validateRentDeclared();
    });

    this.employeeIncomeTaxDeclarationHRA.valueChanges.subscribe(() => {
      this.validateRentDeclared();
    });
  }

  validateRentDeclared() {
    const cityType = this.formGroup.get('cityType')?.value;
    const rentDeclared = this.formGroup.get('rentDeclared')?.value;
    if (!cityType || rentDeclared === null || this.metroDeclaredRent === 0 || this.nonMetroDeclaredRent === 0) {
      return;
    }

    const maxRent = cityType === 'Metro' ? this.metroDeclaredRent : this.nonMetroDeclaredRent;
    if (rentDeclared > maxRent) {
      this.formGroup.get('rentDeclared')?.setErrors({ exceedLimit: true });
    } else {
      this.formGroup.get('rentDeclared')?.setErrors(null);
    }

    const formArray = this.formGroup.get('employeeIncomeTaxDeclarationHRA') as FormArray;
    formArray.controls.forEach((group: FormGroup) => {
      const rowCityType = group.get('cityType')?.value;
      const rowRentDeclared = group.get('rentDeclared')?.value;
      if (rowCityType && rowRentDeclared !== null && this.metroDeclaredRent !== 0 && this.nonMetroDeclaredRent !== 0) {
        const rowMaxRent = rowCityType === 'Metro' ? this.metroDeclaredRent : this.nonMetroDeclaredRent;
        if (rowRentDeclared > rowMaxRent) {
          group.get('rentDeclared')?.setErrors({ exceedLimit: true });
        } else {
          group.get('rentDeclared')?.setErrors(null);
        }
      }
    });
  }

  rentValidation(control: FormControl) {
    if (!control.parent || this.metroDeclaredRent === 0 || this.nonMetroDeclaredRent === 0) {
      return null;
    }

    const formGroup = control.parent as FormGroup;
    const cityType = formGroup.get('cityType')?.value;
    const rentDeclared = control.value;

    if (!cityType || rentDeclared === null) {
      return null;
    }

    const maxRent = cityType === 'Metro' ? this.metroDeclaredRent : this.nonMetroDeclaredRent;
    return rentDeclared > maxRent ? { exceedLimit: true } : null;
  }

  get employeeIncomeTaxDeclarationHRA(): FormArray {
    return this.formGroup.get('employeeIncomeTaxDeclarationHRA') as FormArray;
  }

  get employeeIncomeTaxDeclaration(): FormArray {
    return this.incomeTaxDeclarationForm.get('employeeIncomeTaxDeclarationHRA') as FormArray;
  }

  getemployeeIncomeTaxDeclarationAttachments(index: number): FormArray {
    return this.employeeIncomeTaxDeclarationHRA.at(index).get('employeeIncomeTaxDeclarationAttachments') as FormArray;
  }

  convertToUppercase() {
    const control = this.formGroup.get('landlordPan');
    if (control) {
      control.setValue(control.value?.toUpperCase(), { emitEvent: false });
    }
  }

  convertToUppercaseSelectedPAN(index: number) {
    const control = this.employeeIncomeTaxDeclarationHRA.at(index).get('landlordPan');
    if (control) {
      control.setValue(control.value?.toUpperCase(), { emitEvent: false });
    }
  }

  createEmployeeIncomeTaxDeclarationComponent(month): FormGroup {
    return this.fb.group({
      rentDeclared: [null, [Validators.required, this.rentValidation.bind(this)]],
      month: [month, Validators.required],
      verifiedAmount: [{ value: 0, disabled: true }, [Validators.min(0)]],
      cityType: ['', Validators.required],
      landlordName: ['', Validators.required],
      landlordPan: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/), Validators.required]],
      landlordAddress: ['', Validators.required],
      approvalStatus: ['Pending', Validators.required],
      isEditable: [false],
      documentLink: [''],
      section: [''],
      employeeIncomeTaxDeclarationAttachments: this.fb.array([])
    });
  }

  getMonthsArray(): string[] {
    const months = [];
    for (let i = 3; i < 15; i++) {
      const date = new Date();
      date.setMonth(i);
      months.push(date.toLocaleString('default', { month: 'long' }));
    }
    return months;
  }

  removeAttachment(rowIndex: number, attachmentIndex: number) {
    const attachmentsArray = this.getemployeeIncomeTaxDeclarationAttachments(rowIndex);
    if (attachmentsArray.length > attachmentIndex) {
      attachmentsArray.removeAt(attachmentIndex);
      this.toast.success(this.translate.instant('taxation.attachment_removed'), this.translate.instant('taxation.toast.success'));
    } else {
      this.toast.error(this.translate.instant('taxation.attachment_not_found'), this.translate.instant('taxation.toast.error'));
    }
  }

  uploadAttachment(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    this.convertFileToBase64(file).then(base64String => {
      const attachmentsArray = this.getemployeeIncomeTaxDeclarationAttachments(index);
      for (let i = attachmentsArray.length - 1; i >= 0; i--) {
        const attachmentControl = attachmentsArray.at(i) as FormGroup;
        const attachmentValue = attachmentControl.value;
        if (!attachmentValue.attachmentName && !attachmentValue.attachmentType) {
          attachmentsArray.removeAt(i);
        }
      }

      const fileNameParts = file.name.split('.');
      const extention = fileNameParts.length > 1 ? '.' + fileNameParts.pop() : '';

      const attachment = this.fb.group({
        attachmentType: file.type,
        attachmentName: file.name,
        attachmentSize: file.size,
        extention: extention,
        file: base64String
      });

      attachmentsArray.push(attachment);
    }).catch(error => {
      this.toast.error(this.translate.instant('taxation.attachment_upload_failed'), this.translate.instant('taxation.toast.error'));
    });
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  downloadAttachment(attachment: any, rowIndex: number, attachmentIndex: number) {
    const byteCharacters = atob(attachment.file);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: attachment.attachmentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.attachmentName || `attachment_${rowIndex}_${attachmentIndex}${attachment.extention}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  cancelEditing(index: number) {
    const control = this.employeeIncomeTaxDeclarationHRA.at(index) as FormGroup;
    const originalData = this.selectedRecord?.incomeTaxDeclarationHRA.find(item => item.month === control.get('month')?.value) || {};
    control.patchValue({
      rentDeclared: originalData.rentDeclared || null,
      cityType: originalData.cityType || '',
      landlordName: originalData.landlordName || '',
      landlordPan: originalData.landlordPan || '',
      landlordAddress: originalData.landlordAddress || '',
      approvalStatus: originalData.approvalStatus || 'Pending',
      verifiedAmount: originalData.verifiedAmount || 0,
      documentLink: originalData.documentLink || ''
    });
    const attachmentsArray = control.get('employeeIncomeTaxDeclarationAttachments') as FormArray;
    attachmentsArray.clear();
    if (originalData.employeeIncomeTaxDeclarationAttachments && Array.isArray(originalData.employeeIncomeTaxDeclarationAttachments)) {
      originalData.employeeIncomeTaxDeclarationAttachments.forEach(attachment => {
        attachmentsArray.push(this.fb.group({
          attachmentType: attachment.attachmentType || '',
          attachmentName: attachment.attachmentName || '',
          attachmentSize: attachment.attachmentSize || 0,
          extention: attachment.extention || '',
          file: attachment.file || ''
        }));
      });
    }
    control.get('isEditable')?.setValue(false);
  }

  selectRow(index: number) {
    const control = this.employeeIncomeTaxDeclarationHRA.at(index) as FormGroup;
    if (control.get('approvalStatus')?.value === 'Approved') {
      this.toast.error(this.translate.instant('taxation.cannot_edit_approved'), this.translate.instant('taxation.toast.error'));
      return;
    }
    control.get('isEditable')?.setValue(true);
  }

  getValidationErrors(formGroup: FormGroup): string[] {
    const errors: string[] = [];
    const controls = ['cityType', 'rentDeclared', 'landlordName', 'landlordPan', 'landlordAddress'];
    controls.forEach(field => {
      const control = formGroup.get(field);
      if (control?.invalid && control?.touched) {
        if (control.hasError('required')) {
          errors.push(this.translate.instant(`taxation.${field}_required`));
        }
        if (field === 'landlordPan' && control.hasError('pattern')) {
          errors.push(this.translate.instant('taxation.invalid_pan'));
        }
        if (field === 'rentDeclared' && control.hasError('exceedLimit')) {
          errors.push(this.translate.instant('taxation.rent_exceeds_limit'));
        }
      }
    });
    return errors;
  }

  onSubmissionRowData(index: number) {
    const form = this.employeeIncomeTaxDeclarationHRA.at(index) as FormGroup;
    form.markAllAsTouched();
    if (form.invalid) {
      const errors = this.getValidationErrors(form);
      this.toast.error(
        errors.length > 0 ? errors.join(', ') : this.translate.instant('taxation.validation_failed'),
        this.translate.instant('taxation.toast.error')
      );
      return;
    }

    const payload = {
      employeeIncomeTaxDeclaration: this.selectedRecord._id,
      rentDeclared: +form.value.rentDeclared,
      month: form.value.month,
      verifiedAmount: 0,
      cityType: form.value.cityType,
      landlordName: form.value.landlordName,
      landlordPan: form.value.landlordPan,
      landlordAddress: form.value.landlordAddress,
      approvalStatus: form.value.approvalStatus,
      documentLink: form.value.documentLink || '',
      section: this.sectionId,
      employeeIncomeTaxDeclarationAttachments: form.value.employeeIncomeTaxDeclarationAttachments
    };

    this.taxService.updateIncTaxDecHRA(payload).subscribe({
      next: (res: any) => {
        this.toast.success(this.translate.instant('taxation.rent_information_added'), this.translate.instant('taxation.toast.success'));
        form.patchValue({
          ...res.data,
          verifiedAmount: 0,
          isEditable: false
        });
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant('taxation.failed_to_add_rent_information');
        this.toast.error(errorMessage, this.translate.instant('taxation.toast.error'));
      }
    });
  }

  onSubmission() {
    this.formGroup.markAllAsTouched();
    const topLevelControls = ['cityType', 'rentDeclared', 'landlordName', 'landlordPan', 'landlordAddress'];
    const invalidTopLevel = topLevelControls.some(field => this.formGroup.get(field)?.invalid);
    if (invalidTopLevel) {
      const errors = this.getValidationErrors(this.formGroup);
      this.toast.error(
        errors.length > 0 ? errors.join(', ') : this.translate.instant('taxation.validation_failed'),
        this.translate.instant('taxation.toast.error')
      );
      return;
    }

    const payload = {
      financialYear: this.selectedRecord.financialYear,
      employeeIncomeTaxDeclarationHRA: this.monthsArray.map(month => ({
        rentDeclared: +this.formGroup.value.rentDeclared,
        cityType: this.formGroup.value.cityType,
        landlordName: this.formGroup.value.landlordName,
        landlordPan: this.formGroup.value.landlordPan,
        landlordAddress: this.formGroup.value.landlordAddress,
        approvalStatus: 'Pending',
        month: month,
        verifiedAmount: 0,
        employeeIncomeTaxDeclarationAttachments: [],
        documentLink: '',
        section: this.sectionId
      }))
    };

    this.taxService.updateIncomeTax(this.selectedRecord._id, payload).subscribe({
      next: (res: any) => {
        this.toast.success(this.translate.instant('taxation.rent_information_updated'), this.translate.instant('taxation.toast.success'));
        this.getIncomeTaXDeclarationById();
      },
      error: (err) => {
        const errorMessage = err?.error?.message || err?.message || this.translate.instant('taxation.failed_to_update_rent_information');
        this.toast.error(errorMessage, this.translate.instant('taxation.toast.error'));
      }
    });
  }

  getIncomeTaXDeclarationById() {
    const id = this.selectedRecord._id;
    this.taxService.getIncomeTaxById(id).subscribe((res: any) => {
      const response = res.data;
      this.formGroup.setControl('employeeIncomeTaxDeclarationHRA', this.fb.array([]));
      this.monthsArray.forEach((month, index) => {
        const data = response?.incomeTaxDeclarationHRA?.find(item => item.month === month) || {};
        const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
        formGroup.patchValue({
          month: month,
          rentDeclared: data.rentDeclared || null,
          cityType: data.cityType || '',
          landlordName: data.landlordName || '',
          landlordPan: data.landlordPan || '',
          landlordAddress: data.landlordAddress || '',
          approvalStatus: data.approvalStatus || 'Pending',
          verifiedAmount: data.verifiedAmount || 0,
          documentLink: data.documentLink || ''
        });
        const attachmentsArray = formGroup.get('employeeIncomeTaxDeclarationAttachments') as FormArray;
        attachmentsArray.clear();
        if (data.employeeIncomeTaxDeclarationAttachments && Array.isArray(data.employeeIncomeTaxDeclarationAttachments)) {
          data.employeeIncomeTaxDeclarationAttachments.forEach(attachment => {
            attachmentsArray.push(this.fb.group({
              attachmentType: attachment.attachmentType || '',
              attachmentName: attachment.attachmentName || '',
              attachmentSize: attachment.attachmentSize || 0,
              extention: attachment.extention || '',
              file: attachment.file || ''
            }));
          });
        }
        this.employeeIncomeTaxDeclarationHRA.push(formGroup);
      });
    });
  }

  getFirstInvalidControlName(group: AbstractControl): string | null {
    if (!group || !(group instanceof FormGroup)) return null;
    const controls = group.controls;
    const fieldOrder = ['landlordAddress', 'landlordPan', 'landlordName', 'rentDeclared', 'cityType'];
    for (const field of fieldOrder) {
      const control = controls[field];
      if (control?.touched && control.invalid) {
        return field;
      }
    }
    return null;
  }
}