import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-generic-settings',
  templateUrl: './generic-settings.component.html',
  styleUrls: ['./generic-settings.component.css']
})
export class GenericSettingsComponent implements OnInit {

  settingsByCategory: Control[];
  jsonData: any=[];
  selectedCategory: string='';
  categoriesData: any=[];

  constructor(private http: HttpClient) {

   }

  ngOnInit(): void {
    this.http.get<Controls>('../../../assets/genericSettings.json').subscribe(data => {
      this.jsonData = data;
      this.categoriesData = [...new Set(this.jsonData.Category.map(c => c.CategoryName))];
      console.log(this.categoriesData);
    });
  }

  OnCategoryChange(event: MatTabChangeEvent){
    this.selectedCategory = this.categoriesData[event.index];
    this.settingsByCategory = this.jsonData.Category.filter(cat=> cat.CategoryName?.toLowerCase() == this.selectedCategory?.toLowerCase())
  }

  saveForm() {
    console.log(JSON.stringify(this.settingsByCategory));
  }

  updateValue(eventtype: any, key: string, fieldname: string, categoryName: string) {
    const checked = eventtype.target.checked;

    this.settingsByCategory = this.settingsByCategory.map(cat => {
      if (cat.FieldName?.toLowerCase() === fieldname?.toLowerCase()) {
        if (checked) {
          cat.Value.push(key);
        }
        else{
          const index = cat.Value.indexOf(key);
          if (index > -1) {
            cat.Value.splice(index, 1);
          }
        }
      }
      return cat;
    });
  }

}

interface Control {
  CategoryName: string;
  ControlType: string;
  ControlLabel: string;
  ToolTip: string;
  FieldName: string;
  Value: any;
  ListData: { key: string, value: string }[];
}

interface Controls {
  controls: Control[];
}
