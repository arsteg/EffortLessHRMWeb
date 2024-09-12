import { Injectable } from '@angular/core';
import { Dropdown } from '../controls/dropdown';
import { Base } from '../controls/base';
import { Textbox } from '../controls/textbox';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { newUser, signup, User, updateUser } from '../models/user';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { baseService } from './base';

@Injectable()
export class UserService {
  private readonly token = this.getToken();
  private readonly apiUrl = environment.apiUrlDotNet;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${this.token}`
    }),
    withCredentials: true
  };


  static getQuestions: any;
  editMode = new BehaviorSubject(false);
  selectedEmployee: any = new BehaviorSubject('');
  private data: any;
  private isEdit: boolean;

  constructor(private http: HttpClient) {
  }

  setData(data: any, isEdit: boolean): void {
    this.data = data;
    this.isEdit = isEdit;
  }

  getData(): any {
    return this.data;
  }

  getIsEdit(): boolean {
    return this.isEdit;
  }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }
  // TODO: get from a remote source of question metadata
  public getQuestions(user: signup): Observable<Base<any>[]> {
    const controls: Base<string>[] = [
      new Textbox({
        key: 'firstName',
        label: 'First name',
        required: true,
        rowclass: true,
        rowend: false,
        class: "col-md-12",
        order: 1
      }),
      new Textbox({
        key: 'lastName',
        label: 'Last name',
        value: user.lastName,
        required: true,
        rowclass: false,
        rowend: true,
        class: "col-md-12",
        order: 2
      }),
      new Textbox({
        key: 'jobTitle',
        label: 'Job Title',
        class: "col-md-12",
        rowclass: false,
        order: 3
      }),
      new Textbox({
        key: 'address',
        label: 'Address',
        class: "col-md-12",
        rowclass: false,
        rows: 3,
        order: 4
      }),
      new Textbox({
        key: 'city',
        label: 'City',
        class: "col-md-12",
        rowclass: false,
        order: 5
      }),
      new Textbox({
        key: 'state',
        label: 'State',
        class: "col-md-12",
        rowclass: false,
        order: 6
      }),
      new Dropdown({
        key: 'country',
        label: 'Country',
        options: [
          { key: 'solid', value: 'Solid' },
          { key: 'great', value: 'Great' },
          { key: 'good', value: 'Good' },
          { key: 'unproven', value: 'Unproven' }
        ],
        class: "col-md-12",
        rowclass: true,
        order: 7
      }),
      new Textbox({
        key: 'pincode',
        label: 'Pin Code',
        class: "col-md-12",
        rowclass: true,
        order: 8
      }),
      new Textbox({
        key: 'phone',
        label: 'Phone',
        required: true,
        class: "col-md-12",
        rowclass: true,
        order: 9
      }),
      new Textbox({
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        readonly: 'readonly',
        rowclass: true,
        class: "col-md-12",
        order: 10
      }),
      new Textbox({
        key: 'extraDetails',
        label: 'Extra Details',
        class: "col-md-12",
        rowclass: true,
        rows: 3,
        order: 11
      })
    ];
    return of(controls.sort((a, b) => a.order - b.order));
  }
  GetMe(id: string): Observable<signup[]> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/users/${id}`, this.httpOptions)
  }
  updateMe(user: signup): Observable<signup> {
    return this.http.patch<any>(`${environment.apiUrlDotNet}/users/${user.id}`, user, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }
  getUserList(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/users`, this.httpOptions);
  }

  addUser(newUser: newUser): Observable<newUser> {
    return this.http.post<newUser>(`${environment.apiUrlDotNet}/users/inviteUser`, newUser, this.httpOptions);
  }

  deleteUser(id) {
    return this.http.delete<User>(`${environment.apiUrlDotNet}/users/deleteuser/${id}`, this.httpOptions);
  }

  updateUser(id, updateUser): Observable<updateUser> {
    return this.http.patch<updateUser>(`${environment.apiUrlDotNet}/users/updateUser/${id}`, updateUser, this.httpOptions);
  }

  // Employement Details

  addJobInformation(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/user-employment`, payload, this.httpOptions);
  }

  getJobInformationByUserId(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/users/user-employment-by-userId/${id}`, this.httpOptions);
  }

  updateJobInformation(id, payload): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/users/user-employment/${id}`, payload, this.httpOptions);
  }

  // Salary Details

  addSalaryDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/salary-details`, payload, this.httpOptions);
  }

  getSalaryByUserId(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/users/salary-details-by-userId/${id}`, this.httpOptions);
  }

  getSalaryDetailsById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/users/salary-details/${id}`, this.httpOptions);
  }

  // statutory details
  addStatutoryDetails(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/employee-salutatory-details`, payload, this.httpOptions);
  }
  updateStatutoryDetails(id, payload): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/users/employee-salutatory-details/${id}`, payload, this.httpOptions);
  }
  getStatutoryByUserId(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrlDotNet}/users/employee-salutatory-details-by-user/${id}`, this.httpOptions);
  }

  // Loans Advances
  addLoansAdvances(payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/employee-loan-advance`, payload, this.httpOptions);
  }

  getLoansAdvancesByUserId(userId: string, payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/employee-loan-advance-by-user/${userId}`, payload, this.httpOptions);
  }

  updateLoansAdvances(id, payload: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrlDotNet}/users/employee-loan-advance/${id}`, payload, this.httpOptions);
  }

  deleteLoansAdvances(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrlDotNet}/users/employee-loan-advance/${id}`, this.httpOptions);
  }

  // Tax Decalaration
  getTaxDeclarationByUserId(userId: string, payload: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrlDotNet}/users/employee-income-tax-declarations-by-user/${userId}`, payload, this.httpOptions);
  }
}