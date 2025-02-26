import { Injectable, inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { baseService } from './base';
import { LastInvoiceModel } from '../models/dashboard/lastInvoiceModel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends baseService {

  private getHttpOptions() {
    const token = localStorage.getItem('jwtToken');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Authorization': `Bearer ${token}`
    });
    const httpOptions = { headers, withCredentials: true };
    return httpOptions;
  }

  readonly http = inject(HttpClient);
  httpOptions = this.getHttpOptions();

  getPlans() {
   return this.http.get(environment.apiUrlDotNet + '/pricing/plan', this.httpOptions);
  }

  updatePlan(id: string, payload: any){
    return this.http.put(`${environment.apiUrlDotNet}/pricing/plan/${id}`, payload, this.httpOptions);
  }

  getPlanByName(name: string){
   return this.http.get(`${environment.apiUrlDotNet}/pricing/plan/${name}`, this.httpOptions);
  }

  createPlan(payload: any){
    return this.http.post(`${environment.apiUrlDotNet}/pricing/plan`, payload, this.httpOptions);
  }

  getSubscriptions(){
    return this.http.get(`${environment.apiUrlDotNet}/pricing/subscription`, this.httpOptions);
  }

  createSubscription(payload: any){
   return this.http.post(environment.apiUrlDotNet + '/pricing/subscription', payload, this.httpOptions);
  }

  pauseResumeSubscription(payload: any){
   return this.http.post(environment.apiUrlDotNet + '/pricing/pause-resume-subscription', payload, this.httpOptions);
  }

  getSubscriptionById(id: string){
    return this.http.get(`${environment.apiUrlDotNet}/pricing/subscription/${id}`, this.httpOptions);
  }

  cancelSubscription(payload: any){
    return this.http.post(environment.apiUrlDotNet + '/pricing/cancel-subscription', payload, this.httpOptions);
   }

  getInvoiceBySubscription(id: string){
    return this.http.get(`${environment.apiUrlDotNet}/pricing/subscription-invoice/${id}`, this.httpOptions);
  }

  activateSubscription(id: string){
    return this.http.post(`${environment.apiUrlDotNet}/pricing/activate-subscription/${id}`, {}, this.httpOptions);
  }

  getCredentials(){
    return this.http.get(`${environment.apiUrlDotNet}/pricing/credentials`, this.httpOptions);
  }
  getLastInvoice():Observable<any>{
    return this.http.get<any>(`${environment.apiUrlDotNet}/pricing/last-invoice`, this.httpOptions);
  }
  getUpcomingPayment():Observable<any>{
    return this.http.get<any>(`${environment.apiUrlDotNet}/pricing/upcoming-payment`, this.httpOptions);
  }
}
