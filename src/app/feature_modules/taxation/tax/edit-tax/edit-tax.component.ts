import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaxationService } from 'src/app/_services/taxation.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-tax',
  templateUrl: './edit-tax.component.html',
  styleUrls: ['./edit-tax.component.css']
})
export class EditTaxComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string;
  activeTabName: string;
  selectedUser: any;
  taxSections: any;
  @Output() backToSalaryDetails = new EventEmitter<void>();
  @Input() selectedRecord: any;
  isHRA: any;

  constructor(private taxService: TaxationService,) { }

  ngOnInit() {
    this.getSections();
  }

  getSections() {
    this.taxService.getAllTaxSections().subscribe((results: any) => {
      this.taxSections = results.data;
      if (this.taxSections?.length) {
        const sectionId = this.taxSections[0]?._id;
        this.selectTab(sectionId);
      }
    });
  }

  selectTab(tabId) {
    this.activeTab = tabId;
    const selectedSection = this.taxSections.find((section: any) => section._id === tabId);
    
    this.activeTabName = selectedSection?.section || '';  
    this.isHRA = selectedSection?.isHRA || false;
    this.taxService.activeTab.next(this.activeTabName);
  }
  
}