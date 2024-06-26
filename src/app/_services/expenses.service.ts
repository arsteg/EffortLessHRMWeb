import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { Subordinate } from '../models/subordinate.Model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { response } from '../models/response';
import { AddTemplate, AdvanceCategory, AdvanceTemplate, ApplicableCategories, ExpenseApplicationField, ExpenseCategory, ExpenseCategoryField, TemplateAssignment, UpdateExpenseCategoryField } from '../models/expenses';

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
  selectedTemplate: any = new BehaviorSubject('');
  allExpenseCategories: any = new BehaviorSubject('');
  categories: any = new BehaviorSubject('');
  selectedUser: any = new BehaviorSubject('');
  expenseReportExpense: any = new BehaviorSubject('');
  expenseReportExpId: any = new BehaviorSubject('');
  selectedReport: any = new BehaviorSubject('');
  isEdit: any = new BehaviorSubject(false);
  report: any = new BehaviorSubject('');
  advanceReport: any = new BehaviorSubject('')
  private updateTableSubject = new BehaviorSubject<void>(null);
  updateTable$ = this.updateTableSubject.asObservable();
  tempAndCat: any = new BehaviorSubject<void>(null);
  expenseTemplateCategoryFieldValues: any = new BehaviorSubject('');
  changeMode: any = new BehaviorSubject('');
  tabIndex: any = new BehaviorSubject('')

  triggerUpdateTable() {
    this.updateTableSubject.next();
  }

  constructor(private http: HttpClient) {
  }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  // Expense Category

  getExpenseCatgories(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-categories-list`,payload, this.httpOptions);
    return response;
  }

  getExpenseCategoryByUser(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-categories-by-employee/${userId}`, this.httpOptions);
    return response;
  }

  getExpenseCategoryById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-categories/${id}`, this.httpOptions);
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

  updateCategoryField(updateExpenseCategoryField: UpdateExpenseCategoryField): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields`, updateExpenseCategoryField, this.httpOptions);
    return response;
  }


  deleteApplicationField(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields/${id}`, this.httpOptions);
    return response;
  }


  updateApplicationFieldValue(expenseApplicationField: UpdateExpenseCategoryField): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-field-values`, expenseApplicationField, this.httpOptions);
    return response;
  }

  deleteApplicationFieldValue(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-field-values/${id}`, this.httpOptions);
    return response;
  }
  getApplicationFieldValuebyFieldId(expenseApplicationFieldID: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields-values-by-field/${expenseApplicationFieldID}`, this.httpOptions);
    return response;
  }

  getApplicationFieldbyCategory(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-application-fields-by-expense-category/${id}`, this.httpOptions);
    return response;
  }

  getApplicableFieldByTemplateAndCategory(tempId: string, catId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-template-applicable-categories-by-template-category/${tempId}/${catId}`, this.httpOptions);
    return response;
  }

  // Expense Template

  addTemplate(template: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates`, template, this.httpOptions);
    return response;
  }

  deleteTemplate(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates/${id}`, this.httpOptions);
    return response;
  }

  updateTemplate(id: string, template: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates/${id}`, template, this.httpOptions);
    return response;
  }

  getAllTemplates(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates-list`, payload, this.httpOptions);
    return response;
  }

  getTemplateById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-templates/${id}`, this.httpOptions);
    return response;
  }


  addTemplateApplicableCategories(expenseCategories: ApplicableCategories): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-template-applicable-categories`, expenseCategories, this.httpOptions);
    return response;
  }

  getCategoriesByTemplate(expenseTemplateId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-template-applicable-categories-by-template/${expenseTemplateId}`, this.httpOptions);
    return response;
  }

  getAllCategoriesOfAllTemplate(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expense-template-applicable-categories`, this.httpOptions);
    return response;
  }

  //  expnse template assignment
  addTemplateAssignment(templateAssignment: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-assignments`, templateAssignment, this.httpOptions);
    return response;
  }

  deleteTemplateAssignment(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-assignments/${id}`, this.httpOptions);
    return response;
  }

  getTemplateAssignmentById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-assignments-by-user/${id}`, this.httpOptions);
    return response;
  }

  getTemplateAssignment(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-assignments-list`, payload, this.httpOptions);
    return response;
  }
  //  advance categories

  getAdvanceCatgories(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/advance-categories-list`, payload, this.httpOptions);
    return response;
  }

  addAdvanceCategory(expenseCategory: AdvanceCategory): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/advance-categories`, expenseCategory, this.httpOptions);
    return response;
  }

  updateAdvanceCategory(id: string, expenseCategory: AdvanceCategory): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/advance-categories/${id}`, expenseCategory, this.httpOptions);
    return response;
  }

  deleteAdvanceCategory(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/advance-categories/${id}`, this.httpOptions);
    return response;
  }

  getAdvanceCategoryByUserId(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/advance-categories-by-user/${userId}`, this.httpOptions);
    return response;
  }

  //  advance Templates

  getAdvanceTemplates(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/advance-templates-list`, payload, this.httpOptions);
    return response;
  }

  getAdvanceTemplateById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/advance-templates/${id}`, this.httpOptions);
    return response;
  }

  addAdvanceTemplates(advanceTemplate: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/advance-templates`, advanceTemplate, this.httpOptions);
    return response;
  }

  updateAdvanceTemplates(id: string, advanceTemplate: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/advance-templates/${id}`, advanceTemplate, this.httpOptions);
    return response;
  }

  deleteAdvanceTemplates(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/advance-templates/${id}`, this.httpOptions);
    return response;
  }
  getAllCategoriesOfAlladvance(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/advance-templates`, this.httpOptions);
    return response;
  }

  addAdvanceTemplateAssignment(templateAssignment: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/employee-advance-assignments`, templateAssignment, this.httpOptions);
    return response;
  }

  getAdvanceTemplateAssignment(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/employee-advance-assignments-list`, payload,  this.httpOptions);
    return response;
  }

  getAdvanceTemplateAssignmentByUser(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/employee-advance-assignments-by-user/${userId}`, this.httpOptions);
    return response;
  }

  deleteAdvanceTemplateAssignment(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/employee-advance-assignments/${id}`, this.httpOptions);
    return response;
  }

  // Expense Report
  addExpensePendingReport(report: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-reports`, report, this.httpOptions);
    return response;
  }

  getExpenseReport(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-reports-list`, payload,this.httpOptions);
    return response;
  }

  getExpenseReportByUser(userId: string, payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-reports-by-user/${userId}`,payload, this.httpOptions);
    return response;
  }

  deleteExpenseReport(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expense-reports/${id}`, this.httpOptions);
    return response;
  }

  updateExpenseReport(id: string, expenseReport: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expense-reports/${id}`, expenseReport, this.httpOptions);
    return response;
  }

  getAllExpenseReportExpenses(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expenseReportExpenses`, this.httpOptions);
    return response;
  }

  addExpenseReportExpenses(expenseReportExpenses: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expenseReportExpenses`, expenseReportExpenses, this.httpOptions);
    return response;
  }

  deleteExpenseReportExpenses(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/expenseReportExpenses/${id}`, this.httpOptions);
    return response;
  }

  updateExpenseReportExpenses(id: string, expenseReportExpenses: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/expenseReportExpenses/${id}`, expenseReportExpenses, this.httpOptions);
    return response;
  }

  getExpenseReportExpensesById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expenseReportExpenses/${id}`, this.httpOptions);
    return response;
  }

  getExpenseReportExpensesByReportId(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/expenseReportExpensesByExpenseReport/${id}`, this.httpOptions);
    return response;
  }

  // advance reports
  addAdvanceReport(advanceReport: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/advance`, advanceReport, this.httpOptions);
    return response;
  }

  deleteAdvanceReport(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/expense/advance/${id}`, this.httpOptions);
    return response;
  }

  updateAdvanceReport(id: string, advanceReport: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/expense/advance/${id}`, advanceReport, this.httpOptions);
    return response;
  }
  getAdvanceReport(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/advance-list`, payload, this.httpOptions);
    return response;
  }

  getAdvanceByUser(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/advance-summary-by-employee/${userId}`, this.httpOptions);
    return response;
  }

  getExpenseReportByTeam(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/expense/expense-reports-by-team`, payload, this.httpOptions);
    return response;
  }

  getEmployeeExpenseAssignments(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-assignments-by-user/${userId}`, this.httpOptions);
    return response;
  }

  getEmployeeApplicableSettings(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/employee-expense-applicable-setting/${userId}`, this.httpOptions);
    return response;
  }

  getAdvanceReportById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/expense/advance/${id}`, this.httpOptions);
    return response;
  }
}
