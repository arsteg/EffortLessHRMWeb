import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  monthsArray: number[];

  @Input() selectedRecord: any;
  @Input() actionType: boolean;

  incomeTaxDeclarationForm: FormGroup;
  formGroup: FormGroup;
  metroDeclaredRent: number = 0;
  nonMetroDeclaredRent: number = 0;
  @Input() sectionId: string;

  constructor(
    private fb: FormBuilder,
    private taxService: TaxationService,
    private toast: ToastrService,private translate: TranslateService,
    private userService: UserService
  ) {
    this.formGroup = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      employeeIncomeTaxDeclarationHRA: this.fb.array([]),
      rentDeclared: [null, [Validators.required, this.rentValidation.bind(this)]], // Added custom validator
      month: [''],
      verifiedAmount: [0],
      cityType: ['', Validators.required],
      landlordName: [''],
      landlordPan: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/), Validators.required]],
      landlordAddress: [''],
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
    console.log(this.sectionId)
    const months = this.getMonthsArray();
    this.formGroup.setControl('employeeIncomeTaxDeclarationHRA', this.fb.array([]));

    const form = this.formGroup.get('employeeIncomeTaxDeclarationHRA') as FormArray;
    this.userService.getBasicSalaryByUserId(this.selectedRecord?.user?._id).subscribe((res: any) => {
      const basicSalary = res.data;
      this.metroDeclaredRent = (basicSalary * 0.5);
      this.nonMetroDeclaredRent = (basicSalary * 0.4);
      this.validateRentDeclared();
    }, (error) => {
    });

    months.forEach((month, index) => {
      const data = this.selectedRecord?.incomeTaxDeclarationHRA.find(item => item.month === month);
      if (data) {
        const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
        formGroup.patchValue({
          month: month,
          rentDeclared: data.rentDeclared,
          verifiedAmount: data.verifiedAmount,
          cityType: data.cityType,
          landlordName: data.landlordName,
          landlordPan: data.landlordPan,
          landlordAddress: data.landlordAddress,
          approvalStatus: data.approvalStatus,
          documentLink: data.documentLink,
        });
        // Initialize attachments FormArray with data
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
      } else {
        const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
        this.employeeIncomeTaxDeclarationHRA.push(formGroup);
      }
    });

    // Subscribe to value changes
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
      return; // Skip validation if data is not ready
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
      return null; // Skip validation if parent form or max rents are not available
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
    const attachments = this.employeeIncomeTaxDeclaration.at(index).get('employeeIncomeTaxDeclarationAttachments') as FormArray;
    return attachments;
  }

  convertToUppercase() {
    const control = this.formGroup.get('landlordPan');
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  convertToUppercaseSelectedPAN(index: number) {
    const control = (this.formGroup.get('employeeIncomeTaxDeclarationHRA') as FormArray).at(index).get('landlordPan');
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  createEmployeeIncomeTaxDeclarationComponent(month): FormGroup {
    return this.fb.group({
      rentDeclared: [null, [Validators.required, this.rentValidation.bind(this)]], // Added custom validator
      month: [month, Validators.required],
      verifiedAmount: [0, [Validators.required, Validators.min(0)]],
      cityType: ['', Validators.required],
      landlordName: ['', Validators.required],
      landlordPan: ['', [Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/), Validators.required]],
      landlordAddress: ['', Validators.required],
      approvalStatus: ['Pending', Validators.required],
      isEditable: [false],
      documentLink: ['', Validators.required],
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
    const employeeIncomeTaxDeclarationHRA = this.formGroup.get('employeeIncomeTaxDeclarationHRA') as FormArray;
    const selectedFormGroup = employeeIncomeTaxDeclarationHRA.at(rowIndex) as FormGroup;
    const attachmentsArray = selectedFormGroup.get('employeeIncomeTaxDeclarationAttachments') as FormArray;

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
      const employeeIncomeTaxDeclarationHRA = this.formGroup.get('employeeIncomeTaxDeclarationHRA') as FormArray;
      const selectedFormGroup = employeeIncomeTaxDeclarationHRA.at(index) as FormGroup;
      const attachments = selectedFormGroup.get('employeeIncomeTaxDeclarationAttachments') as FormArray;

      for (let i = attachments.length - 1; i >= 0; i--) {
        const attachmentControl = attachments.at(i) as FormGroup;
        const attachmentValue = attachmentControl.value;
        if (!attachmentValue.attachmentName && !attachmentValue.attachmentType) {
          attachments.removeAt(i);
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

      attachments.push(attachment);
    }).catch(error => {
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
    const byteCharacters = atob(attachment.file); // Decode base64
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
    window.URL.revokeObjectURL(url); // Clean up
  }

  cancelEditing(i) {
    const control = this.formGroup.get(`employeeIncomeTaxDeclarationHRA.${i}`) as FormGroup;
    control.patchValue(this.employeeIncomeTaxDeclarationHRA[i]);
    control.get('isEditable').setValue(false);
  }

  selectRow(index: number) {
    const control = this.formGroup.get(`employeeIncomeTaxDeclarationHRA.${index}`) as FormGroup;
    control.get('isEditable').setValue(true);
  }

  onSubmissionRowData(index: number) {
    const form = this.formGroup.get(`employeeIncomeTaxDeclarationHRA.${index}`) as FormGroup;
    this.userService.getBasicSalaryByUserId(this.selectedRecord?.user?._id).subscribe((res: any) => {
      const basicSalary = res.data;     
      if (form.value.cityType === 'Metro') {
        const declaredRent = (basicSalary * 0.5);
        this.formGroup.patchValue({ rentDeclared: declaredRent });
      }
      if (form.value.cityType === 'Non-Metro') {
        const declaredRent = (basicSalary * 0.4);
        this.formGroup.patchValue({ rentDeclared: declaredRent });
      }
      const rentDeclared = this.formGroup.value.rentDeclared;

      let payload = {
        employeeIncomeTaxDeclaration: this.selectedRecord._id,
        rentDeclared: rentDeclared,
        month: form.value.month,
        verifiedAmount: form.value.verifiedAmount,
        cityType: form.value.cityType,
        landlordName: form.value.landlordName,
        landlordPan: form.value.landlordPan,
        landlordAddress: form.value.landlordAddress,
        approvalStatus: form.value.approvalStatus,
        documentLink: 'string',
        section: this.sectionId,
        employeeIncomeTaxDeclarationAttachments: form.value.employeeIncomeTaxDeclarationAttachments,
      };
      this.taxService.updateIncTaxDecHRA(payload).subscribe(
        (res: any) => {
           this.toast.success(this.translate.instant('taxation.rent_information_added'), this.translate.instant('taxation.toast.success'));
           const control = this.formGroup.get(`employeeIncomeTaxDeclarationHRA.${index}`) as FormGroup;
           control.get('isEditable').setValue(false);
        },
        (err) => {
           const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('taxation.failed_to_add_rent_information')
          ;
          this.toast.error(errorMessage, 'Error!'); 
        }
      );
    });
  }

  onSubmission() {
    this.userService.getBasicSalaryByUserId(this.selectedRecord?.user?._id).subscribe((res: any) => {
      const basicSalary = res.data;     
      if (this.formGroup.value.cityType === 'Metro') {
        const declaredRent = (basicSalary * 0.5);
        this.formGroup.patchValue({ rentDeclared: declaredRent });
      }
      if (this.formGroup.value.cityType === 'Non-Metro') {
        const declaredRent = (basicSalary * 0.4);
        this.formGroup.patchValue({ rentDeclared: declaredRent });
      }
    });
    const rentDeclared = this.formGroup.value.rentDeclared;
    const cityType = this.formGroup.value.cityType;
    const landlordName = this.formGroup.value.landlordName;
    const landlordPan = this.formGroup.value.landlordPan;
    const landlordAddress = this.formGroup.value.landlordAddress;
    const approvalStatus = 'Pending';
    const documentLink = this.formGroup.value.documentLink;
    const verifiedAmount = 0;
    const months = this.getMonthsArray();

    const section = this.sectionId;
    
    this.employeeIncomeTaxDeclaration.reset();
    months.forEach((month, index) => {
      this.employeeIncomeTaxDeclaration.push(
        this.fb.group({
          rentDeclared,
          cityType,
          landlordName,
          landlordPan,
          landlordAddress,
          approvalStatus,
          month: month,
          verifiedAmount,
          employeeIncomeTaxDeclarationAttachments: [],
          documentLink,
          section
        })
      );
    });
    let payload = {
      financialYear: this.selectedRecord.financialYear,
      employeeIncomeTaxDeclarationHRA: this.employeeIncomeTaxDeclaration.value
    };
    this.taxService.updateIncomeTax(this.selectedRecord._id, payload).subscribe(
      (res: any) => {
        this.formGroup.reset();
        this.getIncomeTaXDeclarationById();
        this.toast.success(this.translate.instant('taxation.rent_information_updated'), this.translate.instant('taxation.toast.success'));       
      },
      (err) => {
        const errorMessage = err?.error?.message || err?.message || err 
          || this.translate.instant('taxation.failed_to_update_rent_information')
          ;
          this.toast.error(errorMessage, 'Error!'); 
      }
    );
  }

  getIncomeTaXDeclarationById() {
    const id = this.selectedRecord._id;
    this.taxService.getIncomeTaxById(id).subscribe((res: any) => {
      const response = res.data;
      const months = this.getMonthsArray();
      this.formGroup.setControl('employeeIncomeTaxDeclarationHRA', this.fb.array([]));
      months.forEach((month, index) => {
        const data = response?.incomeTaxDeclarationHRA.find(item => item.month === month);
        if (data) {
          const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
          formGroup.patchValue({
            month: month,
            rentDeclared: data.rentDeclared,
            cityType: data.cityType,
            landlordName: data.landlordName,
            landlordPan: data.landlordPan,
            landlordAddress: data.landlordAddress,
            approvalStatus: data.approvalStatus,
            documentLink: data.documentLink,
            employeeIncomeTaxDeclarationAttachments: data.employeeIncomeTaxDeclarationAttachments || []
          });
          this.employeeIncomeTaxDeclarationHRA.push(formGroup);
        } else {
          const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
          this.employeeIncomeTaxDeclarationHRA.push(formGroup);
        }
      });
    });
  }
}