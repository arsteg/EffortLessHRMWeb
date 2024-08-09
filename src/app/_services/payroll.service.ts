import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PayrollService {
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

  data: any = new BehaviorSubject('');
  addResponse: any = new BehaviorSubject('');
  generalSettings: any = new BehaviorSubject('');
  fixedAllowance: any = new BehaviorSubject('');
  configureState: any = new BehaviorSubject('');
  assignedTemplates: any = new BehaviorSubject('');
  ctcTempData: any = new BehaviorSubject('');

  constructor(private http: HttpClient) { }
  public getToken() {
    return localStorage.getItem('jwtToken');
  }

  // general settings CRUD
  addGeneralSettings(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/general-settings`, payload, this.httpOptions);
    return response;
  }

  getGeneralSettings(companyId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/general-settings/${companyId}`, this.httpOptions);
    return response;
  }

  updateGeneralSettings(companyId: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/general-settings/${companyId}`, payload, this.httpOptions);
    return response;
  }

  // Rounding Rules CRUD
  addRoundingRules(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules`, payload, this.httpOptions);
    return response;
  }

  updateRoundingRules(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules/${id}`, payload, this.httpOptions);
    return response;
  }

  getRoundingRules(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules-list`, payload, this.httpOptions);
    return response;
  }

  deleteRoundingRules(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/rounding-rules/${id}`, this.httpOptions);
    return response;
  }
  // PF templates CRUD
  addPFTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pf-templates`, payload, this.httpOptions);
    return response;
  }
  getPfTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pf-templates-by-company`, payload,  this.httpOptions);
    return response;
  }
 
  updatePFTemplate(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/pf-templates/${id}`, payload, this.httpOptions);
    return response;
  }
  deletePFTemplate(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/pf-templates/${id}`, this.httpOptions);
    return response;
  }
  // Gratuity Templates CRUD
  addGratuityTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates`, payload, this.httpOptions);
    return response;
  }
  updateGratuityTemplate(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteGrauityTemplate(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates/${id}`, this.httpOptions);
    return response;
  }
  
  getGratuityTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/gratuity-templates-by-company`, payload, this.httpOptions);
    return response;
  }
  // Fixed Allowance Templates CRUD
  addAllowanceTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances`, payload, this.httpOptions);
    return response;
  }
  updateAllowanceTemplate(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteAllowanceTemplate(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances/${id}`, this.httpOptions);
    return response;
  }
  getFixedAllowance(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-allowances-list`, payload, this.httpOptions);
    return response;
  }
  // fixed contribution
  addFixedContribution(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution`, payload, this.httpOptions);
    return response;
  }
  updateFixedContribution(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteFixedContribution(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution/${id}`, this.httpOptions);
    return response;
  }
  getFixedContribution(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-contribution-list`, payload, this.httpOptions);
    return response;
  }

  // PT-Slab Crud
  addPTSlab(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs`, payload, this.httpOptions);
    return response;
  }
  updatePTSlab(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs/${id}`, payload, this.httpOptions);
    return response;
  }
  deletePTSlab(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs/${id}`, this.httpOptions);
    return response;
  }
  getPTSlab(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pt-slabs-list`, payload, this.httpOptions);
    return response;
  }

  // Eligible states CRUD
  addEligibleState(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pt-eligible-states`, payload, this.httpOptions);
    return response;
  }

  updateEligibleState(payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/pt-eligible-states`, payload, this.httpOptions);
    return response;
  }

  deleteEligibleState(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/pt-eligible-states/${id}`, this.httpOptions);
    return response;
  }

  getEligibleStates(): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/pt-eligible-states`, this.httpOptions);
    return response;
  }
  //  pt-configured State CRUD
  addConfiguredState(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pt-configure-states`, payload, this.httpOptions);
    return response;
  }
  updateConfiguredState(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/pt-configure-states/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteConfiguredState(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/pt-configure-states/${id}`, this.httpOptions);
    return response;
  }
  getAllConfiguredStates(): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/pt-configure-states-by-company`, this.httpOptions);
    return response;
  }

  // pt-deduction month CRUD

  addDeductionMonth(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pt-deduction-months`, payload, this.httpOptions);
    return response;
  }
  updateDeductionMonth(payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/pt-deduction-months`, payload, this.httpOptions);
    return response;
  }
  deleteDeductionMonth(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/pt-deduction-months/${id}`, this.httpOptions);
    return response;
  }
  getDeductionMonth(): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/pt-deduction-months`, this.httpOptions);
    return response;
  }

  // LWF CRUD
  addLWF(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/lwf-fixed-contribution-slabs`, payload, this.httpOptions);
    return response;
  }
  updateLWF(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/lwf-fixed-contribution-slabs/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteLWF(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/lwf-fixed-contribution-slabs/${id}`, this.httpOptions);
    return response;
  }
  getLWF(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/lwf-fixed-contribution-slabs-list`, payload, this.httpOptions);
    return response;
  }

  // LWF_deduction month CRUD
  addLWFDeductionMonth(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/lwf-fixed-deduction-months`, payload, this.httpOptions);
    return response;
  }
  updateLWFDeductionMonth(payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/lwf-fixed-deduction-months-update`, payload, this.httpOptions);
    return response;
  }
  getLWFDeductionMonth(): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/lwf-fixed-deduction-months`, this.httpOptions);
    return response;
  }

  // ESIC Ceiling amount CRUD
  addESICCeiling(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/esic-ceilingAmounts`, payload, this.httpOptions);
    return response;
  }
  updateESICCeiling(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/esic-ceilingAmounts/${id}`, payload, this.httpOptions);
    return response;
  }
  getESICCeiling(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/esic-ceilingAmounts-by-company`, payload, this.httpOptions);
    return response;
  }
  deleteESICCeiling(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/esic-ceilingAmounts/${id}`, this.httpOptions);
    return response;
  }
  // Contribution CRUD
  addContribution(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/esicContributions`, payload, this.httpOptions);
    return response;
  }
  updateContribution(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/esicContributions/${id}`, payload, this.httpOptions);
    return response;
  }
  getContribution(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/esicContributions-by-company`, payload, this.httpOptions);
    return response;
  }
  deleteContribution(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/esicContributions/${id}`, this.httpOptions);
    return response;
  }
  // Variable Allowances CRUD
  addVariableAllowance(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/variable-allowances`, payload, this.httpOptions);
    return response;
  }
  updateVariableAllowance(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/variable-allowances/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteVariableAllowance(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/variable-allowances/${id}`, this.httpOptions);
    return response;
  }
  getVariableAllowance(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/variable-allowances-by-company`, payload, this.httpOptions);
    return response;
  }

  // Fixed Deduction CRUD
  addFixedDeduction(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-deductions`, payload, this.httpOptions);
    return response;
  }
  updateFixedDeduction(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/fixed-deductions/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteFixedDeduction(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/fixed-deductions/${id}`, this.httpOptions);
    return response;
  }
  getFixedDeduction(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fixed-deductions-by-company`, payload, this.httpOptions);
    return response;
  }
  //  Variable Deduction CRUD
  addVariableDeduction(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/variable-deductions`, payload, this.httpOptions);
    return response;
  }
  updateVariableDeduction(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/variable-deductions/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteVariableDeduction(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/variable-deductions/${id}`, this.httpOptions);
    return response;
  }
  getVariableDeduction(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/variable-deductions-list`, payload, this.httpOptions);
    return response;
  }

  // Other Benefits CRUD
  addOtherBenefits(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/other-benefits`, payload, this.httpOptions);
    return response;
  }
  getOtherBenefits(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/other-benefits-by-company`, payload, this.httpOptions);
    return response;
  }
  updateOtherBenefits(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/other-benefits/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteOtherBenefits(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/other-benefits/${id}`, this.httpOptions);
    return response;
  }
  // Loans/Advances CRUD
  addLoans(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/loan-advances-category`, payload, this.httpOptions);
    return response;
  }
  updateLoans(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/loan-advances-category/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteLoans(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/loan-advances-category/${id}`, this.httpOptions);
    return response;
  }
  getLoans(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/loan-advances-category-by-company`, payload, this.httpOptions);
    return response;
  }
  //  Flexi Benefits CRUD
  addFlexiBenefits(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-category`, payload, this.httpOptions);
    return response;
  }
  updateFlexiBenefits(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-category/${id}`, payload, this.httpOptions);
    return response;
  }
  deleteFlexiBenefits(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-category/${id}`, this.httpOptions);
    return response;
  }
  getFlexiBenefits(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-category-by-company`, payload, this.httpOptions);
    return response;
  }
  // PF charges

  getAllPFCharges(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pf-charge-by-company`, payload, this.httpOptions);
    return response;
  }

  // CTC Template CRUD
 getCTCTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/ctc-templates-by-company`, payload, this.httpOptions);
    return response;
  }
  deleteCTCTemplate(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/ctc-templates/${id}`, this.httpOptions);
    return response;
  }
  updateCTCTemplate(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/ctc-templates/${id}`, payload, this.httpOptions);
    return response;
  }
  addCTCTemplate(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/ctc-templates`, payload, this.httpOptions);
    return response;
  }

  getCTCTemplateById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/ctc-templates/${id}`, this.httpOptions);
    return response;
  }
}