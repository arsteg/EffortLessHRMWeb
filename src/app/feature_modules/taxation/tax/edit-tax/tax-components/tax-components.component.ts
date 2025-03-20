import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-tax-components',
  templateUrl: './tax-components.component.html',
  styleUrl: './tax-components.component.css'
})
export class TaxComponentsComponent {
  selectedRecord: any;
  isEdit: boolean = false;
  searchText: string = '';
  data: any;
  taxDecalaration = [];
  taxComponents = [];
  filteredIncomeTaxComponents = [];
  incomeTaxComponents = [];
  taxSections: any;
  totalRecords: number;
  selectedComponent: string;

  @Input() sectionId: string;
  selectedUser = this.userService.getData();
  @Input() selectedData: any;
  @Output() tabSelected = new EventEmitter<string>();
  @Output() taxComponentsSaved = new EventEmitter<any>();
  incomeTaxDecComponentForm: FormGroup;
  activeTab: string = '';

  constructor(private taxService: TaxationService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private userService: UserService
  ) {
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
      employeeIncomeTaxDeclarationAttachments: this.fb.array([])
    });
    this.incomeTaxDecComponentForm.get('approvalStatus').disable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sectionId'] || changes['selectedData']) {
      this.fetchAndMatchTaxComponents();
    }
  }
  ngOnInit() {
    this.taxService.activeTab.subscribe(res => {
      this.activeTab = res;
    })
    this.getSections();
  }

  onRowEdit(index: any) {
    const control = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${index}`) as FormGroup;
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
      this.taxComponents = res.data.filter(data => data.section.section == this.activeTab);
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
      const formArray = this.fb.array(this.taxComponents.map(component => this.createFormGroup(component)));
      this.incomeTaxDecComponentForm.setControl('incomeTaxComponent', formArray);
      this.taxComponents.forEach((component, index) => {
        const taxDecalaration = this.selectedData.incomeTaxDeclarationComponent.find((data) => data.incomeTaxComponent === component._id);
        if (taxDecalaration) {
          const formArray = this.incomeTaxDecComponentForm.get('incomeTaxComponent') as FormArray;
          formArray.at(index).patchValue({
            maximumAmount: taxDecalaration.maximumAmount,
            appliedAmount: taxDecalaration.appliedAmount,
            approvedAmount: taxDecalaration.approvedAmount,
            approvalStatus: taxDecalaration.approvalStatus,
            remark: taxDecalaration.remark,
            employeeIncomeTaxDeclarationAttachments: taxDecalaration.employeeIncomeTaxDeclarationAttachments
          });
          formArray.at(index).get('approvalStatus').disable();

        }
      });
    }, (error) => {
      console.error('Error fetching all tax components:', error);
    });
  }

  createFormGroup(component: any): FormGroup {
    return this.fb.group({
      incomeTaxComponent: [component._id],
      section: [component.section],
      maximumAmount: [component.maximumAmount],
      appliedAmount: [component.appliedAmount],
      approvedAmount: [component.approvedAmount],
      approvalStatus: [component.approvalStatus],
      remark: [component.remark],
      isEditable: [false],
      documentLink: [component.documentLink],
      employeeIncomeTaxDeclarationAttachments: this.fb.array(
        component.employeeIncomeTaxDeclarationAttachments?.map(attachment => this.fb.group(attachment)) || []
      ),
    });
  }

  updateRow(i) {
    const rowData = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${i}`).value;
    let payload = {
      employeeIncomeTaxDeclaration: this.selectedData._id,
      incomeTaxComponent: this.selectedComponent,
      maximumAmount: rowData.maximumAmount || 0,
      appliedAmount: rowData.appliedAmount || 0,
      approvedAmount: rowData.approvedAmount || 0,
      approvalStatus: rowData.approvalStatus || 'Pending',
      remark: rowData.remark,
      employeeIncomeTaxDeclarationAttachments: rowData.employeeIncomeTaxDeclarationAttachments
    }
    this.taxService.updateIncTaxDecComponent(payload).subscribe((res: any) => {
      this.toast.success('Income Tax Declaration Component Updated Successfully', 'Success!');
      const control = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${i}`) as FormGroup;
      control.get('isEditable').setValue(false);
    },
      (error) => { this.toast.error('Can not be Updated', 'Error!') })
  }

  cancelEditing(i) {
    const control = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${i}`) as FormGroup;
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

  getSections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.taxSections = res.data;
    });
  }

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
      const incomeTaxComponent = this.incomeTaxDecComponentForm.get('incomeTaxComponent') as FormArray;
      const selectedFormGroup = incomeTaxComponent.at(index) as FormGroup;

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