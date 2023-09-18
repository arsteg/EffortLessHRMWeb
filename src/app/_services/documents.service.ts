import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { baseService } from './base';
import { environment } from 'src/environments/environment';
import { Subordinate } from '../models/subordinate.Model';
import { Observable } from 'rxjs';
import { response } from '../models/response';
import { DocumentCategory, template } from '../models/documents/documents';

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
}
