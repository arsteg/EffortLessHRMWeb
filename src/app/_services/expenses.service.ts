import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { Subordinate } from '../models/subordinate.Model';
import { Observable } from 'rxjs';
import { response } from '../models/response';
import { AddTemplate, ApplicableCategories, ExpenseApplicationField, ExpenseCategory, ExpenseCategoryField, TemplateAssignment } from '../models/expenses';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {
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
  constructor(private http: HttpClient) { }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }
// Expense Category

  getExpenseCatgories(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-categories`, this.httpOptions);
    return response;
  }

  addCategory(expenseCategory: ExpenseCategory): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-categories`, expenseCategory, this.httpOptions);
    return response;
  }

  updateCategory(id: string, expenseCategory: ExpenseCategory): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expense-categories/${id}`, expenseCategory, this.httpOptions);
    return response;
  }

  deleteCategory(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expense-categories/${id}`, this.httpOptions);
    return response;
  }

  addCategoryField(expenseCategoryField: ExpenseCategoryField): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields`, expenseCategoryField, this.httpOptions);
    return response;
  }

  updateCategoryField(id: string, expenseCategoryField: ExpenseCategoryField): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields/${id}`, expenseCategoryField, this.httpOptions);
    return response;
  }


  deleteApplicationField(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields/${id}`, this.httpOptions);
    return response;
  }

  addApplicationFieldValue(expenseApplicationField: ExpenseApplicationField): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-field-values`, expenseApplicationField, this.httpOptions);
    return response;
  }

  getApplicationFieldbyCategory(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields-by-expence-category/${id}`, this.httpOptions);
    return response;
  }

// Expense Template

addTemplate(template: AddTemplate): Observable<response<any>> {
  var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates`, template, this.httpOptions);
  return response;
}

deleteTemplate(id: string): Observable<response<any>> {
  var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates/${id}`, this.httpOptions);
  return response;
}

updateTemplate(id: string, template: AddTemplate): Observable<response<any>> {
  var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates/${id}`, template, this.httpOptions);
  return response;
}

getAllTemplates(): Observable<response<any>> {
  var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates`, this.httpOptions);
  return response;
}

getTemplateById(id: string): Observable<response<any>> {
  var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates/${id}`, this.httpOptions);
  return response;
}


addTemplateApplicableCategories(templateAppCat: ApplicableCategories): Observable<response<any>> {
  var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-template-applicable-categories`, templateAppCat, this.httpOptions);
  return response;
}

addTemplateAssignment(templateAssignment: TemplateAssignment): Observable<response<any>> {
  var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-assignments`, templateAssignment, this.httpOptions);
  return response;
}

getTemplateAssignment(): Observable<response<any>> {
  var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-assignments`, this.httpOptions);
  return response;
}

}
