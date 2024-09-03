import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaxationService } from 'src/app/_services/taxation.service';

@Component({
  selector: 'app-edit-tax',
  templateUrl: './edit-tax.component.html',
  styleUrl: './edit-tax.component.css'
})
export class EditTaxComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string;
  activeTabName: string;
  @Input() selectedUser: any;
  taxSections: any;
  @Output() backToSalaryDetails = new EventEmitter<void>();
  sectionComponents: any;
  activeSection: string = '';
  @Input() selectedRecord: any;
  @Input() edit: boolean = false;
  taxDeclarationForm: FormGroup;

  constructor(private taxService: TaxationService,
    private fb: FormBuilder
  ) {  }

  ngOnInit() {
    this.getAllSections();
    if(this.taxSections?.length){
      console.log(this.taxSections);
      const sectionId = this.taxSections[0]?._id;
      this.selectTab(sectionId);
    }
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    this.activeTabName = this.taxSections.find((section: any) => section._id === tabId)?.section;
  }

  getAllTaxComponents() {
    let payload = {
      skip: '',
      next: ''
    }
    this.taxService.getAllTaxComponents(payload).subscribe((res: any) => {
      this.sectionComponents = res.data;
    })
  }
  getAllSections() {
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.taxSections = res.data;
      if (this.taxSections.length > 0) {
        this.activeTab = this.taxSections[0]._id;
      }
    })
  }
  onTabSelected(tabId: string) {
    this.activeTab = tabId;
  }
 
}
