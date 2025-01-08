import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaxationService } from 'src/app/_services/taxation.service';
import { UserService } from 'src/app/_services/users.service';

@Component({
  selector: 'app-edit-tax',
  templateUrl: './edit-tax.component.html',
  styleUrl: './edit-tax.component.css'
})
export class EditTaxComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: string;
  activeTabName: string;
  selectedUser = this.userService.getData();
  taxSections: any;
  @Output() backToSalaryDetails = new EventEmitter<void>();
  @Input() selectedRecord: any;

  constructor(private taxService: TaxationService,
    private userService: UserService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
   
    this.taxService.getAllTaxSections().subscribe((res: any) => {
      this.taxSections = res.data;
      if (this.taxSections?.length) {
        const sectionId = this.taxSections[0]?._id;
        this.selectTab(sectionId);
      }
    })
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
    this.activeTabName = this.taxSections.find((section: any) => section._id === tabId)?.section;
    // console.log(this.activeTabName)
  }
 
}
