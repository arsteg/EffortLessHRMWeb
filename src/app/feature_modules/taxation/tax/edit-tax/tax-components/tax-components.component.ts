import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-tax-components',
  templateUrl: './tax-components.component.html',
  styleUrls: ['./tax-components.component.css']
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
  @Input() selectedTaxDeclaration: any;
  selectedUser = this.userService.getData();
  @Input() selectedData: any;
  @Output() tabSelected = new EventEmitter<string>();
  @Output() taxComponentsSaved = new EventEmitter<any>();
  incomeTaxDecComponentForm: FormGroup;
  activeTab: string = '';

  constructor(
    private taxService: TaxationService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private userService: UserService
  ) {
    this.incomeTaxDecComponentForm = this.fb.group({
      incomeTaxComponent: this.fb.array([])
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sectionId'] || changes['selectedData']) {
      this.fetchAndMatchTaxComponents();
    }
  }

  ngOnInit() {
    this.taxService.activeTab.subscribe(res => {
      this.activeTab = res;
      this.fetchAndMatchTaxComponents();
    });
    this.getSections();
  }

  fetchAndMatchTaxComponents() {
    const pagination = { skip: '', next: '' };
    this.taxService.getAllTaxComponents(pagination).subscribe((res: any) => {
      this.taxComponents = res.data.filter(data => data?.section?.section === this.activeTab);
      this.totalRecords = res.total;
  
      const formArray = this.fb.array(
        this.taxComponents.map(component => {
          const taxDeclarationComponent = this.selectedTaxDeclaration?.incomeTaxDeclarationComponent?.find(
            data => data.incomeTaxComponent?._id === component._id
          );
          const formGroup = this.createFormGroup(taxDeclarationComponent || component);
  
          formGroup.patchValue({
            incomeTaxComponent: taxDeclarationComponent ? taxDeclarationComponent.incomeTaxComponent : component._id,
            section: taxDeclarationComponent ? taxDeclarationComponent.section : component.section,
            maximumAmount: taxDeclarationComponent ? taxDeclarationComponent.maximumAmount : component.maximumAmount || 0,
            appliedAmount: taxDeclarationComponent ? taxDeclarationComponent.appliedAmount : component.appliedAmount || 0,
            approvedAmount: taxDeclarationComponent ? taxDeclarationComponent.approvedAmount : component.approvedAmount || 0,
            approvalStatus: taxDeclarationComponent ? taxDeclarationComponent.approvalStatus : component.approvalStatus || 'Pending',
            remark: taxDeclarationComponent ? taxDeclarationComponent.remark : component.remark || '',
            isEditable: false,
            documentLink: taxDeclarationComponent ? taxDeclarationComponent.documentLink : component.documentLink || ''
          });
  
          const attachmentsArray = formGroup.get('employeeIncomeTaxDeclarationAttachments') as FormArray;
          while (attachmentsArray.length !== 0) {
            attachmentsArray.removeAt(0);
          }
          if (taxDeclarationComponent?.employeeIncomeTaxDeclarationAttachments?.length > 0) {
            taxDeclarationComponent.employeeIncomeTaxDeclarationAttachments.forEach(attachment => {
              attachmentsArray.push(this.fb.group({
                attachmentType: attachment.attachmentType || '',
                attachmentName: attachment.attachmentName || '',
                attachmentSize: attachment.attachmentSize || 0,
                extention: attachment.extention || '',
                file: attachment.file || ''
              }));
            });
          }
  
          return formGroup;
        })
      );
  
      this.incomeTaxDecComponentForm.setControl('incomeTaxComponent', formArray);
        formArray.controls.forEach((control: FormGroup) => {
      });
    }, (error) => {
    });
  }

  createFormGroup(data: any): FormGroup {
    return this.fb.group({
      incomeTaxComponent: [data._id || data.incomeTaxComponent],
      section: [data.section || ''],
      maximumAmount: [data.maximumAmount || 0],
      appliedAmount: [data.appliedAmount || 0],
      approvedAmount: [data.approvedAmount || 0],
      approvalStatus: [data.approvalStatus || 'Pending'],
      remark: [data.remark || ''],
      isEditable: [false],
      documentLink: [data.documentLink || ''],
      employeeIncomeTaxDeclarationAttachments: this.fb.array(
        data.employeeIncomeTaxDeclarationAttachments?.map(attachment => this.fb.group(attachment)) || []
      )
    });
  }

  onRowEdit(index: any) {
    const control = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${index}`) as FormGroup;
    control.get('isEditable').setValue(true);
  }

  selectSection(section: string) {
    this.tabSelected.emit(section);
  }

  updateRow(i: number) {
    const rowData = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${i}`).value;
    let payload = {
      employeeIncomeTaxDeclaration: this.selectedTaxDeclaration?._id,
      incomeTaxComponent: this.selectedComponent,
      maximumAmount: rowData.maximumAmount || 0,
      appliedAmount: rowData.appliedAmount || 0,
      approvedAmount: rowData.approvedAmount || 0,
      approvalStatus: rowData.approvalStatus || 'Pending',
      remark: rowData.remark,
      employeeIncomeTaxDeclarationAttachments: rowData.employeeIncomeTaxDeclarationAttachments
    };
    this.taxService.updateIncTaxDecComponent(payload).subscribe(
      (res: any) => {
        this.toast.success('Income Tax Declaration Component Updated Successfully', 'Success!');
        const control = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${i}`) as FormGroup;
        control.get('isEditable').setValue(false);
      },
      (error) => {
        this.toast.error('Can not be Updated', 'Error!');
      }
    );
  }

  cancelEditing(i: number) {
    const control = this.incomeTaxDecComponentForm.get(`incomeTaxComponent.${i}`) as FormGroup;
    control.patchValue(this.taxComponents[i]);
    control.get('isEditable').setValue(false);
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
  
  removeAttachment(rowIndex: number, attachmentIndex: number) {
    const incomeTaxComponent = this.incomeTaxDecComponentForm.get('incomeTaxComponent') as FormArray;
    const selectedFormGroup = incomeTaxComponent.at(rowIndex) as FormGroup;
    const attachmentsArray = selectedFormGroup.get('employeeIncomeTaxDeclarationAttachments') as FormArray;

    if (attachmentsArray.length > attachmentIndex) {
      attachmentsArray.removeAt(attachmentIndex);
      this.toast.success('Attachment removed successfully', 'Success!');
    } else {
      this.toast.error('Attachment not found', 'Error!');
    }
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
    const byteCharacters = atob(attachment?.file);
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
}