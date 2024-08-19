import { Component } from '@angular/core';
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
  taxDecalaration: any;
  taxComponents: any;

  constructor(private taxService: TaxationService) { }
  ngOnInit() {
    this.getAllTaxDecalaration();
    this.getAllTaxComponents();
  }

  incomeTaxComponents: any;

  getAllTaxDecalaration() {
    let payload = {
      skip: '',
      next: ''
    }
    this.taxService.getIncomeTax(payload).subscribe((res: any) => {
      this.taxDecalaration = res.data;
      this.incomeTaxComponents = [];
      this.taxDecalaration.forEach(item => {
        item.incomeTaxDeclarationComponent.forEach(component => {
          this.incomeTaxComponents.push(component);
        });
      });

      console.log(this.incomeTaxComponents);
      //   this.taxDecalaration.forEach(item =>{
      //     item.incomeTaxDeclarationComponent.forEach(component => {
      //       console.log(component);
      //       this.incomeTaxComponents = component;
      //   })
      //   console.log(this.taxDecalaration);
      // })
    })
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
  getAllTaxComponents() {
    let payload = {
      skip: '',
      next: ''
    }
    this.taxService.getAllTaxComponents(payload).subscribe((res: any) => {
      this.taxComponents = res.data;
    })
  }
  getTaxComponent(taxId: string) {
    const matchingRecord = this.taxComponents?.find(tax => tax._id === taxId);
    return matchingRecord?.componantName;
  }
}
