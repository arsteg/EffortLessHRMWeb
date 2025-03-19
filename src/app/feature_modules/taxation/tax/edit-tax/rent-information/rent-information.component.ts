import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-rent-information',
  templateUrl: './rent-information.component.html',
  styleUrls: ['./rent-information.component.css']
})
export class RentInformationComponent {
  selectedUser = this.userService.getData();
  incomeTaxDeclaration: any;
  isEdit: boolean = false;
  monthsArray: number[];

  @Input() selectedRecord: any;
  @Input() actionType: boolean;

  incomeTaxDeclarationForm: FormGroup;
  formGroup: FormGroup;

  constructor(private fb: FormBuilder,
    private taxService: TaxationService,
    private toast: ToastrService,
    private userService: UserService
  ) {
    this.formGroup = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      employeeIncomeTaxDeclarationHRA: this.fb.array([]),
      rentDeclared: [0],
      month: [''],
      verifiedAmount: [0],
      cityType: [''],
      landlordName: [''],
      landlordPan: [''],
      landlordAddress: [''],
      approvalStatus: [''],
      documentLink: [''],
      isEditable: [false],
      employeeIncomeTaxDeclarationAttachments: this.fb.array([])
    });

    this.incomeTaxDeclarationForm = this.fb.group({
      financialYear: [''],
      employeeIncomeTaxDeclarationHRA: this.fb.array([])
    })
  }

  ngOnInit() {
    const months = this.getMonthsArray();
    this.formGroup.setControl('employeeIncomeTaxDeclarationHRA', this.fb.array([]));
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
          employeeIncomeTaxDeclarationAttachments: data.employeeIncomeTaxDeclarationAttachments || []
        });
        this.employeeIncomeTaxDeclarationHRA.push(formGroup);
      } else {
        const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
        this.employeeIncomeTaxDeclarationHRA.push(formGroup);
      }
    });
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

  createEmployeeIncomeTaxDeclarationComponent(month): FormGroup {
    return this.fb.group({
      rentDeclared: ['', Validators.required],
      month: [month, Validators.required],
      verifiedAmount: [0, [Validators.required, Validators.min(0)]],
      cityType: ['', [Validators.required, Validators.min(0)]],
      landlordName: ['', [Validators.required, Validators.min(0)]],
      landlordPan: ['', Validators.required],
      landlordAddress: ['', Validators.required],
      approvalStatus: ['Pending', Validators.required],
      isEditable: [false],
      documentLink: ['', Validators.required],
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
      const extention = fileNameParts[fileNameParts.length - 1];
      const attachment = this.fb.group({
        attachmentType: file.type,
        attachmentName: file.name,
        attachmentSize: file.size,
        extention: extention,
        file: base64String
      });
      attachments.push(attachment);
    }).catch(error => {
      console.error('Error converting file to base64:', error);
    });
  }

  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    let payload = {
      employeeIncomeTaxDeclaration: this.selectedRecord._id,
      rentDeclared: form.value.rentDeclared,
      month: form.value.month,
      verifiedAmount: form.value.verifiedAmount,
      cityType: form.value.cityType,
      landlordName: form.value.landlordName,
      landlordPan: form.value.landlordPan,
      landlordAddress: form.value.landlordAddress,
      approvalStatus: form.value.approvalStatus,
      documentLink: 'string',
      employeeIncomeTaxDeclarationAttachments: form.value.employeeIncomeTaxDeclarationAttachments,
    }
    this.taxService.updateIncTaxDecHRA(payload).subscribe((res: any) => {
      this.toast.success('Successfully Added!!!', 'Rent Information');
      const control = this.formGroup.get(`employeeIncomeTaxDeclarationHRA.${index}`) as FormGroup;
      control.get('isEditable').setValue(false);
    },
      err => {
        this.toast.error('Selected Record Can not be updated', 'Rent Information');
      })
  }

  onSubmission() {
    const rentDeclared = this.formGroup.value.rentDeclared;
    const cityType = this.formGroup.value.cityType;
    const landlordName = this.formGroup.value.landlordName;
    const landlordPan = this.formGroup.value.landlordPan;
    const landlordAddress = this.formGroup.value.landlordAddress;
    const approvalStatus = this.formGroup.value.approvalStatus;
    const documentLink = this.formGroup.value.documentLink
    const verifiedAmount = 0;
    const months = this.getMonthsArray();
    this.employeeIncomeTaxDeclaration.reset();
    months.forEach((month, index) => {
      this.employeeIncomeTaxDeclaration.push(this.fb.group({
        rentDeclared,
        cityType,
        landlordName,
        landlordPan,
        landlordAddress,
        approvalStatus,
        month: month,
        verifiedAmount,
        employeeIncomeTaxDeclarationAttachments: [],
        documentLink
      }));
    });
    let payload = {
      financialYear: this.selectedRecord.financialYear,
      employeeIncomeTaxDeclarationHRA: this.employeeIncomeTaxDeclaration.value
    }
    this.taxService.updateIncomeTax(this.selectedRecord._id, payload).subscribe((res: any) => {
      this.formGroup.reset();
      
      this.getIncomeTaXDeclarationById();
      this.toast.success('Successfully Updated!!!', 'Rent Information');
    },
      err => {
        this.toast.error('Selected Rent Information Can not be updated', 'Error');
      })
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
    })
  }
}