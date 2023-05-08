import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-generic-settings',
  templateUrl: './generic-settings.component.html',
  styleUrls: ['./generic-settings.component.css']
})
export class GenericSettingsComponent implements OnInit {

  jsonData: any=[];
  selectedCategory: string='0';
  selectedJsonData: any=[];
  categoriesData: any=[];

  constructor(private http: HttpClient) {
    // this.categoriesData = this.jsonData.Category.map(c => c.CategoryName);
    // console.log(this.categoriesData);
   }

  ngOnInit(): void {
    debugger;
    this.http.get('../../../assets/genericSettings.json').subscribe(data => {
      this.jsonData = data;
      this.categoriesData = [...new Set(this.jsonData.Category.map(c => c.CategoryName))];
      console.log(this.categoriesData);
    });
  }

  OnCategoryChange(){
    // if(this.selectedCategory.toLowerCase() == "profile settings"){
    //   this.selectedJsonData = this.jsonData.Category.filter(cat=> cat.CategoryName.toLowerCase() == "profile settings")
    // }
    // else if (this.selectedCategory.toLowerCase() == "workspace"){
    //   this.selectedJsonData = this.jsonData.Category.filter(cat=> cat.CategoryName.toLowerCase() == "workspace")
    // }
    // else{
    //   this.selectedJsonData = [];
    // }

    this.selectedJsonData = this.jsonData.Category.filter(cat=> cat.CategoryName.toLowerCase() == this.selectedCategory.toLowerCase())
  }

}
