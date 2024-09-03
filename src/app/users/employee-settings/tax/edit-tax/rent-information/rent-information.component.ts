import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';

@Component({
  selector: 'app-rent-information',
  templateUrl: './rent-information.component.html',
  styleUrl: './rent-information.component.css'
})
export class RentInformationComponent {
  @Input() selectedUser: any;
  isEdit: boolean = false;
  rentInformationForm: FormGroup;
  monthsArray: number[];
  formGroup: FormGroup;
  incomeTaxDeclaration: any;
  @Input() selectedRecord: any;
  @Input() actionType: boolean;

  constructor(private fb: FormBuilder,
    private taxService: TaxationService,
    private toast: ToastrService
  ) {
    this.rentInformationForm = this.fb.group({
      financialYear: ['', Validators.required],
      user: ['', Validators.required],
      employeeIncomeTaxDeclarationComponent: [[]],
      employeeIncomeTaxDeclarationHRA: this.fb.array([])
    });

    this.formGroup = this.fb.group({
      rentDeclared: ['', Validators.required],
      month: ['', Validators.required],
      verifiedAmount: [0, [Validators.required, Validators.min(0)]],
      cityType: ['', [Validators.required, Validators.min(0)]],
      landlordName: ['', [Validators.required, Validators.min(0)]],
      landlordPan: ['', Validators.required],
      landlordAddress: ['', Validators.required],
      approvalStatus: ['', Validators.required],
      employeeIncomeTaxDeclarationHRAAttachments: [[]]
    })
    this.monthsArray = this.getMonthsArray();
  }

  ngOnInit() {
    const months = this.getMonthsArray();
    const formArray = this.rentInformationForm.get('employeeIncomeTaxDeclarationHRA') as FormArray;
    formArray.clear();
    formArray.push(this.createEmployeeIncomeTaxDeclarationComponent(months[0]));
    console.log(this.selectedRecord?._id)
    this.getIncomeTaxDeclarationbyId();
  }

  createEmployeeIncomeTaxDeclarationComponent(month: number): FormGroup {
    return this.fb.group({
      rentDeclared: ['', Validators.required],
      month: [month, Validators.required],
      verifiedAmount: [0, [Validators.required, Validators.min(0)]],
      cityType: ['', [Validators.required, Validators.min(0)]],
      landlordName: ['', [Validators.required, Validators.min(0)]],
      landlordPan: ['', Validators.required],
      landlordAddress: ['', Validators.required],
      approvalStatus: ['', Validators.required],
      employeeIncomeTaxDeclarationHRAAttachments: this.fb.array([])
    });
  }

  createAttachment(): FormGroup {
    return this.fb.group({
      attachmentType: [null],
      attachmentName: [null],
      attachmentSize: [null],
      extention: [null],
      file: [null]
    });
  }

  getMonthsArray(): number[] {
    const months = Array.from({ length: 12 }, (_, i) => (i + 3) % 12);
    return months;
  }

  getMonthName(monthIndex: number): string {
    const date = new Date();
    date.setMonth(monthIndex);
    return date.toLocaleString('default', { month: 'long' });
  }

  uploadAttachment(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    this.convertFileToBase64(file).then(base64String => {
      const employeeIncomeTaxDeclarationHRA = this.rentInformationForm.get('employeeIncomeTaxDeclarationHRA') as FormArray;
      const selectedFormGroup = employeeIncomeTaxDeclarationHRA.at(index) as FormGroup;

      const attachments = selectedFormGroup.get('employeeIncomeTaxDeclarationHRAAttachments') as FormArray;
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

  onSubmission() {
    const user = this.selectedUser._id;
    const year = this.selectedRecord?.financialYear;
    this.rentInformationForm.patchValue({
      user: user,
      financialYear: year
    });
    const months = this.getMonthsArray();
    const employeeIncomeTaxDeclarationHRA = this.rentInformationForm.get('employeeIncomeTaxDeclarationHRA') as FormArray;
    employeeIncomeTaxDeclarationHRA.clear();
    months.forEach((month, index) => {
      const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
      formGroup.patchValue({
        month: this.getMonthName(month),
        rentDeclared: this.formGroup.get('rentDeclared')?.value,
        cityType: this.formGroup.get('cityType')?.value,
        landlordName: this.formGroup.get('landlordName')?.value,
        landlordPan: this.formGroup.get('landlordPan')?.value,
        landlordAddress: this.formGroup.get('landlordAddress')?.value,
        approvalStatus: this.formGroup.get('approvalStatus')?.value,
        employeeIncomeTaxDeclarationHRAAttachments: [[]]
      });
      employeeIncomeTaxDeclarationHRA.push(formGroup);
    });
    this.rentInformationForm.setControl('employeeIncomeTaxDeclarationHRA', employeeIncomeTaxDeclarationHRA);
    this.rentInformationSaved.emit(this.rentInformationForm.value);
    // this.taxService.addIncomeTax(this.rentInformationForm.value).subscribe((res: any) => {
    //   this.toast.success('Successfully Added!!!', 'Rent Information');
    //   this.isEdit = true;
    // })
  }

  getIncomeTaxDeclarationbyId() {
    this.taxService.getIncomeTaxById(this.selectedRecord?._id).subscribe((res: any) => {
      this.incomeTaxDeclaration = res.data.incomeTaxDeclarationHRA;
      const employeeIncomeTaxDeclarationHRA = this.rentInformationForm.get('employeeIncomeTaxDeclarationHRA') as FormArray;
      employeeIncomeTaxDeclarationHRA.controls = [];
      this.incomeTaxDeclaration.forEach((element: any) => {
        const month = element.month;
        const formGroup = this.createEmployeeIncomeTaxDeclarationComponent(month);
        formGroup.patchValue({
          month: element.month,
          rentDeclared: element.rentDeclared,
          cityType: element.cityType,
          landlordName: element.landlordName,
          landlordPan: element.landlordPan,
          landlordAddress: element.landlordAddress,
          approvalStatus: element.approvalStatus,
          employeeIncomeTaxDeclarationHRAAttachments: element.employeeIncomeTaxDeclarationHRAAttachments
        });
        employeeIncomeTaxDeclarationHRA.push(formGroup);
      })
    })
  }

  // app-rent-information.component.ts
@Output() rentInformationSaved = new EventEmitter<any>();

saveRentInformation() {
  const rentData = { /* Your rent form data */ };
  this.rentInformationSaved.emit(this.onSubmission());
}
}