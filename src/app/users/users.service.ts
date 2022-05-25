import { Injectable } from '@angular/core';

import { Dropdown } from '../controls/dropdown';
import { Base } from '../controls/base';
import { Textbox } from '../controls/textbox';
import { map, Observable, of } from 'rxjs';
import { signup } from '../models/user';
import { HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable()
export class UserService {
  static getQuestions: any;
 
  constructor(private http: HttpClient) {
   }
  // TODO: get from a remote source of question metadata
 public getQuestions(user:signup): Observable<Base<any>[]> {
   
    const controls: Base<string>[] = [   
      new Textbox({
        key: 'firstName',
        label: 'First name',
        required: true,
        value:'firstname',
        rowclass:"row" ,
        class:"col-md-12",
        order: 1
      }),      
      new Textbox({
        key: 'lastName',
        label: 'Last name',
        value:user.lastName,
        required: true,
        class:"col-md-12",
        order: 2
      }),
      new Textbox({
        key: 'jobTitle',
        label: 'Job Title',
        class:"col-md-12",
        order: 3
      }),
      new Textbox({
        key: 'address',
        label: 'Address',
        class:"col-md-12",
        rows:3,
        order: 4
      }),
      new Textbox({
        key: 'city',
        label: 'City',
        class:"col-md-12",
        order: 5
      }),
      new Textbox({
        key: 'state',
        label: 'State',       
        class:"col-md-12",
        order: 6
      }),
      new Dropdown({
        key: 'country',
        label: 'Country',
        options: [
          {key: 'solid',  value: 'Solid'},
          {key: 'great',  value: 'Great'},
          {key: 'good',   value: 'Good'},
          {key: 'unproven', value: 'Unproven'}
        ],
        class:"col-md-12",
        rowclass:"row",
        order: 7
      }),
      new Textbox({
        key: 'pincode',
        label: 'Pin Code',
         class:"col-md-12",
        order: 8
      }),
      new Textbox({
        key: 'phone',
        label: 'Phone',     
        required: true,
        class:"col-md-12",
        order: 9
      }),
      new Textbox({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        readonly:'readonly',
        class:"col-md-12",
        order: 10
      }),
      new Textbox({
        key: 'extraDetails',
        label: 'Extra Details',       
        class:"col-md-12",    
        rows:3,  
        order: 11
      })
      
    ];
   
    return of(controls.sort((a, b) => a.order - b.order));
  }

   GetMe(id:string): Observable<signup[]> {
    var queryHeaders = new HttpHeaders();
    queryHeaders.append('Content-Type', 'application/json');
    queryHeaders.append('Access-Control-Allow-Origin','*');   
    return this.http.get<any>(`${environment.apiUrlDotNet}/users/${id}`,{ headers: queryHeaders})
       
}
updateMe(user: signup): Observable<signup> {
  return this.http.patch<any>(`${environment.apiUrlDotNet}/users/${user.id}`, user, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  });
}
}