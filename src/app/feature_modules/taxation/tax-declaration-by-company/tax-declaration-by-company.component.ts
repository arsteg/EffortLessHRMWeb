import { Component, OnInit } from '@angular/core';
import { TaxationService } from 'src/app/_services/taxation.service';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

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
  taxComponentForm: FormGroup;
  hraForm: FormGroup;

  constructor(
    private taxService: TaxationService,
    private fb: FormBuilder,
    private toast: ToastrService
  ) {
    this.taxComponentForm = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      incomeTaxComponent: [''],
      approvedAmount: [],
      approvalStatus: [''],
      remark: ['']
    });
    this.hraForm = this.fb.group({
      employeeIncomeTaxDeclaration: [''],
      verifiedAmount: [],
      approvalStatus: ['']
    });
  }

  ngOnInit() {
    this.getAlltaxDecalartions();
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
    } else if (type === 'hra') {
      this.editingHRA = item;
      this.originalHRA = { ...item };
    }
  }

  cancelEditing(type: string) {
    if (type === 'component' && this.editingComponent && this.originalComponent) {
      Object.assign(this.editingComponent, this.originalComponent);
      this.editingComponent = null;
      this.originalComponent = null;
    } else if (type === 'hra' && this.editingHRA && this.originalHRA) {
      Object.assign(this.editingHRA, this.originalHRA);
      this.editingHRA = null;
      this.originalHRA = null;
    }
    this.dataSource.data = [...this.dataSource.data];
  }

  saveEditing(type: string, item: any) {
    if (type === 'component') {
      const payload = {
        employeeIncomeTaxDeclaration: item?.employeeIncomeTaxDeclaration,
        incomeTaxComponent: item?.incomeTaxComponent?._id,
        approvedAmount: item?.approvedAmount,
        approvalStatus: item?.approvalStatus,
        remark: item?.remark
      };
      console.log(payload);
      this.taxService.updateIncTaxDecComponent(payload).subscribe((res: any) => {
        this.editingComponent = null;
        this.originalComponent = null;
      });
    } else if (type === 'hra') {
      console.log(item);
      const payload = {
        employeeIncomeTaxDeclaration: item?.employeeIncomeTaxDeclaration,
        verifiedAmount: item?.verifiedAmount,
        approvalStatus: item?.approvalStatus,
        month: item?.month,
        rentDeclared: item?.rentDeclared,
        cityType: item?.cityType,
        landlordName: item?.landlordName,
        landlordPan: item?.landlordPan,
        landlordAddress: item?.landlordAddress,
      }
      this.taxService.updateIncTaxDecHRA(payload).subscribe((res: any) => {
        this.editingHRA = null;
        this.originalHRA = null;
      });
    }
    this.dataSource.data = [...this.dataSource.data];
  }

  resetEditing() {
    this.editingComponent = null;
    this.editingHRA = null;
    this.originalComponent = null;
    this.originalHRA = null;
  }

  onStatusChange(element: any, type: string, item: any, event: any) {
    const newStatus = event.target.value;
    item.approvalStatus = newStatus;
    this.dataSource.data = [...this.dataSource.data];
  }

  onBulkHRAupdate(hraArray: any[], approvalStatus: string) {
    console.log('HRA Array: ', hraArray);
    if (!hraArray || hraArray.length === 0) {
      this.toast.error('No HRA entries to update', 'Error');
      return;
    }

    const id = hraArray[0]?.employeeIncomeTaxDeclaration;
    const financialYear = hraArray[0]?.financialYear;

    const payload = {
      financialYear: financialYear,
      employeeIncomeTaxDeclarationHRA: hraArray.map(hra => ({
        verifiedAmount: hra?.verifiedAmount,
        approvalStatus: approvalStatus,
        month: hra?.month,
        rentDeclared: hra?.rentDeclared,
        cityType: hra?.cityType,
        landlordName: hra?.landlordName,
        landlordPan: hra?.landlordPan,
        landlordAddress: hra?.landlordAddress,
      }))
    };
    this.taxService.updateIncomeTax(id, payload).subscribe(
      (res: any) => {
        this.toast.success('All HRA Income Tax Declarations are Updated', 'Successfully');
        if (this.expandedElement && res.data?.employeeIncomeTaxDeclarationHRA) {
          this.expandedElement.incomeTaxDeclarationHRA = res.data.employeeIncomeTaxDeclarationHRA;
        } else {
          this.expandedElement.incomeTaxDeclarationHRA = hraArray.map(hra => ({
            ...hra,
            verifiedAmount: hra.verifiedAmount,
            approvalStatus: approvalStatus
          }));
        }
        this.dataSource.data = [...this.dataSource.data];
      },
      err => this.toast.error('Unable to Update HRA Tax Declarations', 'Error')
    );
  }

  openAttachment(url: string, attachmentName: any): void {
    console.log(url);
    console.log(attachmentName)
    if (url && attachmentName) {
        // Find the index of attachmentName in the URL
        const index = url.indexOf(attachmentName);
        if (index !== -1) {
            // Trim everything after attachmentName
            const trimmedUrl = url.substring(0, index + attachmentName.length);
            const link = document.createElement('a');
            link.href = trimmedUrl;
            link.download = attachmentName; // Use attachmentName as the download filename
            link.click();
        } else {
            console.error('Attachment name not found in URL');
        }
    } else {
        console.error('Attachment URL or name is missing');
    }
}

}