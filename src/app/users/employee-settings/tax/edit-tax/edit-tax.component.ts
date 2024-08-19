import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaxationService } from 'src/app/_services/taxation.service';

@Component({
  selector: 'app-edit-tax',
  templateUrl: './edit-tax.component.html',
  styleUrl: './edit-tax.component.css'
})
export class EditTaxComponent {
  @Output() backToUserView = new EventEmitter<void>();
  activeTab: number = 1;
  @Input() selectedUser: any;
  taxComponents: any;
  @Output() backToSalaryDetails = new EventEmitter<void>();

  constructor(private taxService: TaxationService) { }

  ngOnInit() {
    this.getAllTaxComponents();
   }

  selectTab(tabId: number) {
    this.activeTab = tabId;
  }

  getAllTaxComponents() {
    let payload = {
      skip: '',
      next: ''
    }
    this.taxService.getAllTaxComponents(payload).subscribe((res: any)=>{
      this.taxComponents = res.data;
      if (this.taxComponents.length > 0) {
        this.activeTab = this.taxComponents[0].order;
      }
    })
  }
}
