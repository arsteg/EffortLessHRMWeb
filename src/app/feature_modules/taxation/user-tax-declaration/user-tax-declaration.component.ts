import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-tax-declaration',
  templateUrl: './user-tax-declaration.component.html',
  styleUrls: ['./user-tax-declaration.component.css']
})
export class UserTaxDeclarationComponent implements OnInit {
  showTaxCalculator = false;

  constructor() { }

  ngOnInit(): void {
  }

  onTaxViewChange(isTaxViewVisible: any) {
    this.showTaxCalculator = isTaxViewVisible;
  }

  hideTaxCalculator() {
    this.showTaxCalculator = false;
  }
}
