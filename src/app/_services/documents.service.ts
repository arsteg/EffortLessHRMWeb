import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { Subordinate } from '../models/subordinate.Model';
import { Observable } from 'rxjs';
import { response } from '../models/response';
import { CompanyPolicyDocument, Document, DocumentCategory, template } from '../models/documents/documents';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
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

  constructor(private http: HttpClient) {
  }
  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  getAllTemplates(): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/documents/template`, this.httpOptions);
   return response;
  }
  getTemplate(id:string): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/documents/template/${id}`, this.httpOptions);
   return response;
  }
  addTemplate(templateToSave:template): Observable<response<any>> {
    var response  = this.http.post<response<any>>(`${environment.apiUrlDotNet}/documents/template`, templateToSave ,this.httpOptions);
   return response;
  }
  deleteTemplate(id:string): Observable<response<any>> {
    var response  = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/documents/template/${id}`, this.httpOptions);
   return response;
  }
  updateTemplate(id:string, templateToSave:template): Observable<response<any>> {
    var response  = this.http.put<response<any>>(`${environment.apiUrlDotNet}/documents/template/${id}`, templateToSave ,this.httpOptions);
   return response;
  }
  getDocumentCategories(): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/documents/document-categories`, this.httpOptions);
   return response;
  }
  addDocumentCategories(documentcategory: DocumentCategory): Observable<response<any>> {
    var response  = this.http.post<response<any>>(`${environment.apiUrlDotNet}/documents/document-categories`, documentcategory, this.httpOptions);
   return response;
  }
  updateDocumentCategories(id: string,documentcategory: DocumentCategory): Observable<response<any>> {
    var response  = this.http.put<response<any>>(`${environment.apiUrlDotNet}/documents/document-categories/${id}`, documentcategory, this.httpOptions);
   return response;
  }
  deleteCategory(id: string): Observable<response<any>> {
    var response  = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/documents/document-categories/${id}`, this.httpOptions);
   return response;
  }
  getDocument(): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/documents`, this.httpOptions);
   return response;
  }
  addDocument(document: Document): Observable<response<any>> {
    var response  = this.http.post<response<any>>(`${environment.apiUrlDotNet}/documents`, document, this.httpOptions);
   return response;
  }
  updateDocument(id: string, document: Document): Observable<response<any>> {
    var response  = this.http.put<response<any>>(`${environment.apiUrlDotNet}/documents/${id}`, document, this.httpOptions);
   return response;
  }
  deleteDocument(id: string): Observable<response<any>> {
    var response  = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/documents/${id}`, this.httpOptions);
   return response;
  }
  getCompanyPolicyDocument(): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/documents/companyPolicyDocument`, this.httpOptions);
   return response;
  }
  addCompanyPolicyDocument(companyPolicyDocument: CompanyPolicyDocument): Observable<response<any>> {
    var response  = this.http.post<response<any>>(`${environment.apiUrlDotNet}/documents/companyPolicyDocument`, companyPolicyDocument, this.httpOptions);
   return response;
  }
  updateCompanyPolicyDocument(id: string, companyPolicyDocument: CompanyPolicyDocument): Observable<response<any>> {
    var response  = this.http.put<response<any>>(`${environment.apiUrlDotNet}/documents/companyPolicyDocument/${id}`, companyPolicyDocument, this.httpOptions);
   return response;
  }
  deleteCompanyPolicyDocument(id: string): Observable<response<any>> {
    var response  = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/documents/companyPolicyDocument/${id}`, this.httpOptions);
   return response;
  }
  getDocumentUser(): Observable<response<any>> {
    var response  = this.http.get<response<any>>(`${environment.apiUrlDotNet}/documents/documentUsers`, this.httpOptions);
   return response;
  }
}
