import { Injectable, inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { baseService } from './base';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends baseService {

  readonly http = inject(HttpClient);
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Authorization': `Bearer ${this.getToken()}` }),
    withCredentials: true
  };

  getPlans() {
   return this.http.get(environment.apiUrlDotNet + '/pricing/plan', this.httpOptions);
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
}
