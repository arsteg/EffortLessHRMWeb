import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';

@Component({
  selector: 'app-tax-components',
  templateUrl: './tax-components.component.html',
  styleUrl: './tax-components.component.css'
})
export class TaxComponentsComponent {
  selectedRecord: any;
  isEdit: boolean = false;
  searchText: string = '';
  data;
  taxDecalaration = [];
  taxComponents = [];
  filteredIncomeTaxComponents = [];
  incomeTaxComponents = [];
  taxSections: any;
  totalRecords: number

  @Input() sectionId: string;
  @Input() selectedUser: any;
  @Input() actionType: boolean;
  @Input() selectedData: any;
  @Output() tabSelected = new EventEmitter<string>();
  @Output() taxComponentsSaved = new EventEmitter<any>();

  taxForm: FormGroup;

  incomeTaxDecComponentForm: FormGroup;

  constructor(private taxService: TaxationService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.taxForm = this.fb.group({
      incomeTaxComponents: this.fb.array([])
    });
    this.incomeTaxDecComponentForm = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      incomeTaxComponent: [''],
      section: [''],
      maximumAmount: [0],
      appliedAmount: [0],
      approvedAmount: [0],
      approvalStatus: [''],
      remark: [''],
      documentLink: [''],
      employeeIncomeTaxDeclarationAttachments: [
        {
          "attachmentType": null,
          "attachmentName": null,
          "attachmentSize": null,
          "extention": null,
          "file": null
        }
      ]
    })
  }

  // createFormGroup(component: any): FormGroup {
  //   return this.fb.group({
  //     incomeTaxComponent: [component?._id || ''],
  //     section: [component?.section || ''],
  //     maximumAmount: [component?.maximumAmount],
  //     appliedAmount: [component?.appliedAmount, Validators.required],
  //     approvedAmount: [component?.approvedAmount, Validators.required],
  //     approvalStatus: [component?.approvalStatus || ''],
  //     remark: [component?.remark || ''],
  //     isEditable: [false],
  //     employeeIncomeTaxDeclarationAttachments: [[]]
  //   });
  // }

  ngOnInit() {
    this.getAllTaxDecalarationByUser();
    this.getSections();
    this.fetchAndMatchTaxComponents();
  }

  onRowEdit(index: any) {
    const control = this.taxForm.get(`incomeTaxComponents.${index}`) as FormGroup;
    control.get('isEditable').setValue(true);
  }

  selectSection(section: string) {
    this.tabSelected.emit(section);
  }

  fetchAndMatchTaxComponents() {
    const pagination = {
      skip: '',
      next: ''
    };
    this.taxService.getAllTaxComponents(pagination).subscribe((res: any) => {
      this.taxComponents = res.data.filter((taxComponent: any) => {
        return taxComponent.section === this.sectionId;
      });
      this.totalRecords = res.total;

      for (let taxComponent of this.taxComponents) {
        const taxDecalarations = this.selectedData.incomeTaxDeclarationComponent.filter((data) => { return data.incomeTaxComponent === taxComponent._id });
        if (taxDecalarations.length > 0) {
          taxDecalarations.forEach((item, index) => {
            if (item.section === taxComponent.section) {
              this.taxComponents[index] = { ...taxComponent, ...item };
            }
          })
        }
      }
      // const formArray = this.fb.array(this.taxComponents.map(component => this.createFormGroup(component)));
      // this.taxForm.setControl('incomeTaxComponents', formArray);
    }, (error) => {
      console.error('Error fetching all tax components:', error);
    });
  }

  getAllTaxDecalarationByUser() {
    const taxDeclarations = this.taxService.taxByUser.getValue();
    taxDeclarations.forEach(item => {
      item.incomeTaxDeclarationComponent.forEach(component => {
        this.incomeTaxComponents.push(component);
      });
    });
  }

  onSubmission() {
    // handle single records
    this.taxService.updateIncTaxDecComponent(this.selectedData._id, this.taxForm.value).subscribe((res: any) => {
      this.taxComponentsSaved.emit(res.data);
      this.toast.success('Tax Component Updated Successfully', 'Success!');
    },
      (error) => { this.toast.error('Can not be Updated', 'Error!') })
  }

  // updateRow(i) {
  //   const rowData = this.taxForm.get(`incomeTaxComponents.${i}`).value;

  //   const payload = {
  //     financialYear: this.selectedData?.financialYear,
  //     employeeIncomeTaxDeclarationComponent: [rowData],
  //     employeeIncomeTaxDeclarationHRA: []
  //   }
  //   console.log(payload);
  //   this.taxService.updateIncomeTax(this.selectedData._id, payload).subscribe((res: any) => {
  //     this.toast.success('Tax Component Updated Successfully', 'Success!');
  //     this.cancelEditing(i);
  //   },
  //     (error) => { this.toast.error('Can not be Updated', 'Error!') })
  // }

  cancelEditing(i) {
    const control = this.taxForm.get(`incomeTaxComponents.${i}`) as FormGroup;
    control.patchValue(this.taxComponents[i]);
    control.get('isEditable').setValue(false);
  }

  deleteRecord(id: string): void {
    // const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
    //   width: '400px',

    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result === 'delete') {
    //     this.deleteAdvanceCategory(id);
    //   }
    //   err => {
    //     this.toast.error('Can not be Deleted', 'Error!')
    //   }
    // });
  }
  deleteAdvanceCategory(id: string) {
    // this.expenseService.deleteAdvanceCategory(id).subscribe((res: any) => {
    //   this.getAllAdvanceCategories();
    //   this.toast.success('Successfully Deleted!!!', 'Advance Category')
    // },
    //   (err) => {
    //     this.toast.error('This category is already being used in an expense template!'
    //       , 'Advance Category, Can not be deleted!')
    //   })
  }

  // Fetching All sections for getting section name
  getSections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.taxSections = res.data;
    });
  }

  // Fetching section name
  getSection(sectionId: string) {
    const matchingRecord = this.taxSections?.find((tax: any) => tax?._id === sectionId);
    return matchingRecord ? matchingRecord?.section : '';
  }



  uploadAttachment(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    this.convertFileToBase64(file).then(base64String => {
      const employeeIncomeTaxDeclarationComponent = this.taxForm.get('employeeIncomeTaxDeclarationComponent') as FormArray;
      const selectedFormGroup = employeeIncomeTaxDeclarationComponent.at(index) as FormGroup;
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


}