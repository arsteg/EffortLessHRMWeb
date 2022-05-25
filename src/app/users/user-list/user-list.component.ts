import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
 
  
  constructor() { }

  ngOnInit() {
  
  }

  columnDefs = [  
      { headerName: 'ArtNo', field: 'ArtNo', sortable: true, filter: true },  
      { headerName: 'Provider', field: 'Provider', sortable: true, filter: true },  
      { headerName: 'ProviderArtNo', field: 'ProviderArtNo', sortable: true, filter: true },  
      { headerName: 'Brand', field: 'Brand', sortable: true, filter: true },  
      { headerName: 'Price', field: 'Price', sortable: true, filter: true },  
      { headerName: 'BuyAccount', field: 'BuyAccount', sortable: true, filter: true }  
    ];  
  
 
    rowData = [  
      {  
        ArtNo: "100",  
        Provider: "IPhone 11",  
        ProviderArtNo: "1Yu",  
        Brand: "Apple",  
        Price: 7810.23,  
        BuyAccount: "123",  
      },  
      {  
        ArtNo: "101",  
        Provider: "Samsung galaxy",  
        ProviderArtNo: "1Yu",  
        Brand: "Samsung",  
        Price: 2310.23,  
        BuyAccount: "123",  
      },  
      {  
        ArtNo: "102",  
        Provider: "Iphone 11 Pro",  
        ProviderArtNo: "1Yu",  
        Brand: "Apple",  
        Price: 7810.23,  
        BuyAccount: "123",  
      },  
      {  
        ArtNo: "103",  
        Provider: "Intex",  
        ProviderArtNo: "1Yu",  
        Brand: "Intex",  
        Price: 5810.23,  
        BuyAccount: "123",  
      },  
      {  
        ArtNo: "100",  
        Provider: "IPhone 11",  
        ProviderArtNo: "1Yu",  
        Brand: "Apple",  
        Price: 7810.23,  
        BuyAccount: "123",  
      },  
      {  
        ArtNo: "101",  
        Provider: "Samsung galaxy",  
        ProviderArtNo: "1Yu",  
        Brand: "Samsung",  
        Price: 2310.23,  
        BuyAccount: "123",  
      },  
      {  
        ArtNo: "102",  
        Provider: "Iphone 11 Pro",  
        ProviderArtNo: "1Yu",  
        Brand: "Apple",  
        Price: 7810.23,  
        BuyAccount: "123",  
      },  
      {  
        ArtNo: "103",  
        Provider: "Intex",  
        ProviderArtNo: "1Yu",  
        Brand: "Intex",  
        Price: 5810.23,  
        BuyAccount: "123",  
      }  
    ];  
  

}
