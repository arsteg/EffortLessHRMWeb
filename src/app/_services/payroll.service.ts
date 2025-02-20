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
  selectedCTCTemplate: any = new BehaviorSubject('');
  isEdit: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showTable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  showAssignedTemplate: BehaviorSubject<boolean> = new BehaviorSubject(false);
  selectedFnFPayroll: any = new BehaviorSubject('');
  payrollUsers: any = new BehaviorSubject('');
  allUsers: any = new BehaviorSubject('');
  payslip: any = new BehaviorSubject('');
  
  
  fixedAllowances: any = new BehaviorSubject('');
  fixedDeductions: any = new BehaviorSubject('');
  otherBenefits: any = new BehaviorSubject('');
  fixedContributions: any = new BehaviorSubject('');
  variableAllowances: any = new BehaviorSubject('');
  variableDeductions: any = new BehaviorSubject('');
  
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
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pf-templates-by-company`, payload, this.httpOptions);
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

  addPFCharges(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/pf-charge`, payload, this.httpOptions);
    return response;
  }

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

  // Run payroll: Payroll history
  addPayroll(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll`, payload, this.httpOptions);
    return response;
  }

  getPayroll(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-by-company`, payload, this.httpOptions);
    return response;
  }

  deletePayroll(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/${id}`, this.httpOptions);
    return response;
  }

  // Run Payroll: Payroll Users (Step-1)

  getPayrollUsers(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/users-by-payroll`, payload, this.httpOptions);
    return response;
  }

  addPayrollUser(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/users`, payload, this.httpOptions);
    return response;
  }

  updatePayrollUser(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/users/${id}`, payload, this.httpOptions);
    return response;
  }

  getPayrollUserById(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/users/${payrollUser}`, this.httpOptions);
    return response;
  }


  // Run Payroll: (step-2) Attendance summary
  addAttendanceSummary(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payrolluser-attendance-summary`, payload, this.httpOptions);
    return response;
  }

  getAttendanceSummary(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payrolluser-attendance-summary-by-payrolluser/${payrollUser}`, this.httpOptions);
    return response;
  }

  updateAttendanceSummary(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payrolluser-attendance-summary/${id}`, payload, this.httpOptions);
    return response;
  }

  getAttendanceSummaryBypayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payrolluser-attendance-summary-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }


  // Run Payroll: (step-3) Variable pays
  addVariablePay(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-variable-pay`, payload, this.httpOptions);
    return response;
  }

  getVariablePay(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-variable-pay-by-payrolluser/${payrollUser}`, this.httpOptions);
    return response;
  }

  updateVariablePay(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-variable-pay/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteVariablePay(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-variable-pay/${id}`, this.httpOptions);
    return response;
  }

  getVariablePayByPayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-variable-pay-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }

  // Run Payroll: (step-4) loans/Advances
  addLoanAdvance(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-loan-advance`, payload, this.httpOptions);
    return response;
  }

  getLoanAdvance(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-loan-advance-by-payrolluser/${payrollUser}`, this.httpOptions);
    return response;
  }

  getLoanAdvanceByPayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-loan-advance-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }

  deleteLoanAdvance(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-loan-advance/${id}`, this.httpOptions);
    return response;
  }

  updateLoanAdvance(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-loan-advance/${id}`, payload, this.httpOptions);
    return response;
  }

  // Run Payroll: (step-5) Arrears
  addArrear(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-manual-arrears`, payload, this.httpOptions);
    return response;
  }

  getArrear(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-manual-arrears-by-payrolluser/${payrollUser}`, this.httpOptions);
    return response;
  }

  getArrearByPayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-manual-arrears-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }

  deleteArrear(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-manual-arrears/${id}`, this.httpOptions);
    return response;
  }

  updateArrear(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-manual-arrears/${id}`, payload, this.httpOptions);
    return response;
  }

  // Run Payroll: (Step-6) Flexi benefits CRUD
  addFlexi(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-pf-tax`, payload, this.httpOptions);
    return response;
  }

  getFlexiByUsers(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-pf-tax-by-payrolluser/${payrollUser}`, this.httpOptions);
    return response;
  }

  getFlexiByPayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-pf-tax-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }

  deleteFlexi(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-pf-tax/${id}`, this.httpOptions);
    return response;
  }

  updateFlexi(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/flexi-benefits-pf-tax/${id}`, payload, this.httpOptions);
    return response;
  }

  // Run Payroll: (Step-7) Overtime CRUD
  addOvertime(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/overtime`, payload, this.httpOptions);
    return response;
  }

  getOvertime(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/overtime-by-payrollUser/${payrollUser}`, this.httpOptions);
    return response;
  }

  getOvertimeByPayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/overtime-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }

  deleteOvertime(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/overtime/${id}`, this.httpOptions);
    return response;
  }

  updateOvertime(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/overtime/${id}`, payload, this.httpOptions);
    return response;
  }

  // Run Payroll: (Step-8) Income tax CRUD
  addIncomeTax(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/incomeTax`, payload, this.httpOptions);
    return response;
  }

  getIncomeTax(payrollUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/incomeTax-by-payrollUser/${payrollUser}`, this.httpOptions);
    return response;
  }

  getIncomeTaxByPayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/incomeTax-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }

  deleteIncomeTax(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/incomeTax/${id}`, this.httpOptions);
    return response;
  }

  updateIncomeTax(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/incomeTax/${id}`, payload, this.httpOptions);
    return response;
  }

  generatedPayrollByPayroll(payroll: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/generatedPayroll-by-payroll/${payroll}`, this.httpOptions);
    return response;
  }

  getAllGeneratedPayroll():Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/generatedPayroll-by-company`, {}, this.httpOptions);
    return response;
  }

  // FnF CRUD
  addFnF(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fnf`, payload, this.httpOptions);
    return response;
  }

  updateFnF(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/fnf/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnF(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/fnf/${id}`, this.httpOptions);
    return response;
  }

  getFnF(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fnf/payroll-by-company`, payload, this.httpOptions);
    return response;
  }

  getFnFById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/fnf/${id}`, this.httpOptions);
    return response;
  }

  // CRUD FnF User
  addFnFUser(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/fnf/users`, payload, this.httpOptions);
    return response;
  }

  getFnFUsers(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/users-by-payroll-fnf`, payload, this.httpOptions);
    return response;
  }

  getFnFUserByUserId(userId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/fnf/users-by-userId/${userId}`, this.httpOptions);
    return response;
  }

  updateFnFUser(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/fnf/users/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFUser(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/fnf/users/${id}`, this.httpOptions);
    return response;
  }

  getFnFUserById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/fnf/users/${id}`, this.httpOptions);
    return response;
  }

  // FnF Attendance Summary CRUD
  addFnFAttendanceSummary(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-attendance-summary`, payload, this.httpOptions);
    return response;
  }

  updateFnFAttendanceSummary(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-attendance-summary/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFAttendanceSummary(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-attendance-summary/${id}`, this.httpOptions);
    return response;
  }

  getFnFAttendanceSummary(fnfPayrollId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-attendance-summary-by-payroll-fnf/${fnfPayrollId}`, this.httpOptions);
    return response;
  }

  getFnFAttendanceSummaryByFnFUserId(fnfUserId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-attendance-summary/${fnfUserId}`, this.httpOptions);
    return response;
  }

  // VariablePay CRUD
  addFnFVariablePay(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-variable-pay`, payload, this.httpOptions);
    return response;
  }

  updateFnFVariablePay(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-variable-pay/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFVariablePay(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-variable-pay/${id}`, this.httpOptions);
    return response;
  }

  getFnFVariablePaySummary(fnfPayloadId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-variable-pay-by-payroll-fnf/${fnfPayloadId}`, this.httpOptions);
    return response;
  }

  getFnFVariablePayFnFUserId(fnfUserId: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-variable-pay-by-payrollfnfuser/${fnfUserId}`, this.httpOptions);
    return response;
  }

  // FnF Manual Arrears CRUD
  addFnFManualArrear(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-manual-arrears`, payload, this.httpOptions);
    return response;
  }

  updateFnFManualArrear(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-manual-arrears/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFManualArrear(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-manual-arrears/${id}`, this.httpOptions);
    return response;
  }

  getFnFManualArrearById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-manual-arrears/${id}`, this.httpOptions);
    return response;
  }

  getFnFManualArrearsByPayrollFnFUser(payrollFnFUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-manual-arrears-by-payrollFNFUser/${payrollFnFUser}`, this.httpOptions);
    return response;
  }

  getFnFManualArrearsByPayrollFnF(payrollFnF: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-manual-arrears-by-payroll-fnf/${payrollFnF}`, this.httpOptions);
    return response;
  }

  // FnF Termination Compensation CRUD
  addFnFTerminationCompensation(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-termination-compensation`, payload, this.httpOptions);
    return response;
  }

  updateFnFTerminationCompensation(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-termination-compensation/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFTerminationCompensation(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-termination-compensation/${id}`, this.httpOptions);
    return response;
  }

  getFnFTerminationCompensationById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-termination-compensation/${id}`, this.httpOptions);
    return response;
  }

  getFnFTerminationCompensationByPayrollFnFUser(payrollFnFUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-termination-compensation-by-payrollFNFUser/${payrollFnFUser}`, this.httpOptions);
    return response;
  }

  getFnFTerminationCompensationByPayrollFnF(payrollFnF: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-termination-compensation-by-payroll-fnf/${payrollFnF}`, this.httpOptions);
    return response;
  }

  // FnF Loan Advances CRUD
  addFnFLoanAdvance(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-loan-advances`, payload, this.httpOptions);
    return response;
  }

  updateFnFLoanAdvance(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-loan-advances/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFLoanAdvance(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-loan-advances/${id}`, this.httpOptions);
    return response;
  }

  getFnFLoanAdvanceById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-loan-advances-by-loan-advance/${id}`, this.httpOptions);
    return response;
  }

  getFnFLoanAdvanceByPayrollFnFUser(payrollFnFUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-loan-advances-by-payrollFNFUser/${payrollFnFUser}`, this.httpOptions);
    return response;
  }

  getFnFLoanAdvanceByPayrollFnF(payrollFnF: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-loan-advances-by-payroll-fnf/${payrollFnF}`, this.httpOptions);
    return response;
  }

  // FnF Statutory Benefits CRUD
  addFnFStatutoryBenefit(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-statutory-benefits`, payload, this.httpOptions);
    return response;
  }

  updateFnFStatutoryBenefit(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-statutory-benefits/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFStatutoryBenefit(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-statutory-benefits/${id}`, this.httpOptions);
    return response;
  }

  getFnFStatutoryBenefitById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-statutory-benefits/${id}`, this.httpOptions);
    return response;
  }

  getFnFStatutoryBenefitByPayrollFnFUser(payrollFnFUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-statutory-benefits-by-payrollFNFUser/${payrollFnFUser}`, this.httpOptions);
    return response;
  }

  getFnFStatutoryBenefitByPayrollFnF(payrollFnF: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-statutory-benefits/payroll/${payrollFnF}`, this.httpOptions);
    return response;
  }

  // FnF Flexi Benefits CRUD
  addFnFFlexiBenefit(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-flexi-benefits-pf-tax`, payload, this.httpOptions);
    return response;
  }

  updateFnFFlexiBenefit(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-flexi-benefits-pf-tax/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFFlexiBenefit(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-flexi-benefits-pf-tax/${id}`, this.httpOptions);
    return response;
  }

  getFnFFlexiBenefitById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-flexi-benefits-pf-tax/${id}`, this.httpOptions);
    return response;
  }

  getFnFFlexiBenefitByPayrollFnFUser(payrollFnFUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-flexi-benefits-pf-tax-by-payrollFNFUser/${payrollFnFUser}`, this.httpOptions);
    return response;
  }

  getFnFFlexiBenefitByPayrollFnF(payrollFnF: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-flexi-benefits-pf-tax-by-payroll-fnf/${payrollFnF}`, this.httpOptions);
    return response;
  }

  // FnF Overtime CRUD
  addFnFOvertime(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-overtime`, payload, this.httpOptions);
    return response;
  }

  updateFnFOvertime(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-overtime/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFOvertime(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-overtime/${id}`, this.httpOptions);
    return response;
  }

  getFnFOvertimeById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-overtime/${id}`, this.httpOptions);
    return response;
  }

  getFnFOvertimeByPayrollFnFUser(payrollFnFUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-overtime-by-payroll-fnf-user/${payrollFnFUser}`, this.httpOptions);
    return response;
  }

  getFnFOvertimeByPayrollFnF(payrollFnF: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-overtime-by-payroll-fnf/${payrollFnF}`, this.httpOptions);
    return response;
  }

  // FnF Income Tax CRUD
  addFnFIncomeTax(payload: any): Observable<any> {
    var response = this.http.post<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-income-tax`, payload, this.httpOptions);
    return response;
  }

  updateFnFIncomeTax(id: string, payload: any): Observable<any> {
    var response = this.http.put<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-income-tax/${id}`, payload, this.httpOptions);
    return response;
  }

  deleteFnFIncomeTax(id: string): Observable<any> {
    var response = this.http.delete<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-income-tax/${id}`, this.httpOptions);
    return response;
  }

  getFnFIncomeTaxById(id: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-income-tax/${id}`, this.httpOptions);
    return response;
  }

  getFnFIncomeTaxByPayrollFnFUser(payrollFnFUser: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-income-tax-by-payroll-fnf-user/${payrollFnFUser}`, this.httpOptions);
    return response;
  }

  getFnFIncomeTaxByPayrollFnF(payrollFnF: string): Observable<any> {
    var response = this.http.get<any>(`${environment.apiUrlDotNet}/payroll/payroll-fnf-income-tax-by-payroll-fnf/${payrollFnF}`, this.httpOptions);
    return response;
  }
}