import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { response } from '../models/response';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
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
  selectedAttendanceRecord: any = new BehaviorSubject('');
  status: any = new BehaviorSubject('');

  constructor(private http: HttpClient,
    private router: Router
  ) {
  }

  public getToken() {
    return localStorage.getItem('jwtToken');
  }
  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
  //   const userRole = localStorage.getItem('adminView'); // get user role from local storage or any other storage

  //   if (userRole === 'user') {
  //     console.log(userRole)
  //     this.router.navigate(['/attendance/my-attendance-records']);
  //     return true;
  //   } else {
  //     this.router.navigate(['/attendance/settings']);
  //     return true;
  //   }
  // }

  addGeneralSettings(generalSettingForm: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/general-settings`, generalSettingForm, this.httpOptions);
    return response;
  }

  updateGeneralSettings(id: string, generalSettingForm: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/general-settings/${id}`, generalSettingForm, this.httpOptions);
    return response;
  }

  getGeneralSettings(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/general-settings-by-company`, this.httpOptions);
    return response;
  }

  addRegularizationReason(regularizationReason: any) {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons`, regularizationReason, this.httpOptions);
    return response;
  }

  updateRegularizationReason(id: string, regularizationReason: any) {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons/${id}`, regularizationReason, this.httpOptions);
    return response;
  }

  getRegularizationReason(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons-list`, { skip, next }, this.httpOptions);
    return response;
  }

  deleteReason(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-reasons/${id}`, this.httpOptions);
    return response;
  }

  addDutyReason(dutyReason: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons`, dutyReason, this.httpOptions);
    return response;
  }
  getDutyReason(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons-list`, payload, this.httpOptions);
    return response;
  }

  updateDutyReason(id: string, dutyReason: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons/${id}`, dutyReason, this.httpOptions);
    return response;
  }
  deleteDutyReason(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/duty-reasons/${id}`, this.httpOptions);
    return response;
  }

  getAttendanceTemplate(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  addAttendanceTemplate(templates: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates`, templates, this.httpOptions);
    return response;
  }

  updateAttendanceTemplate(id: string, templates: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates/${id}`, templates, this.httpOptions);
    return response;
  }

  deleteAttendanceTemplate(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates/${id}`, this.httpOptions);
    return response;
  }

  getAttendanceTemplateById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates/${id}`, this.httpOptions);
    return response;
  }

  getAttendanceTemplateByUserId(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-templates-by-user/${userId}`, this.httpOptions);
    return response;
  }

  addAttendanceAssignment(templateAssignment: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-assignments`, templateAssignment, this.httpOptions);
    return response;
  }

  updateAttendanceAssignment(id: string, templateAssignment: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-assignments/${id}`, templateAssignment, this.httpOptions);
    return response;
  }

  deleteAttendanceAssignment(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-assignments/${id}`, this.httpOptions);
    return response;
  }

  getAttendanceAssignment(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-assignments-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  getAttendanceAssignmentById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-assignments/${id}`, this.httpOptions);
    return response;
  }

  // Rounding Records

  addRounding(rounding: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/rounding-information`, rounding, this.httpOptions);
    return response;
  }

  updateRounding(id: string, rounding: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/rounding-information/${id}`, rounding, this.httpOptions);
    return response;
  }

  getRounding(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/rounding-information-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  getRoundingById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/rounding-information/${id}`, this.httpOptions);
    return response;
  }

  deleteRounding(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/rounding-information/${id}`, this.httpOptions);
    return response;
  }

  // Over time

  addOverTime(overtime: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/overtime-information`, overtime, this.httpOptions);
    return response;
  }

  updateOverTime(id: string, overtime: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/overtime-information/${id}`, overtime, this.httpOptions);
    return response;
  }

  getOverTime(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/overtime-information-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  deleteOverTime(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/overtime-information/${id}`, this.httpOptions);
    return response;
  }
  // attendance regularizations

  addRegularizations(regularization: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization`, regularization, this.httpOptions);
    return response;
  }

  updateRegularizations(id: string, regularization: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization/${id}`, regularization, this.httpOptions);
    return response;
  }

  deleteRegularizations(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization/${id}`, this.httpOptions);
    return response;
  }

  getRegularizations(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-by-company`, this.httpOptions);
    return response;
  }

  getRegularizationByTemplateId(tempId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/regularization-by-template/${tempId}`, this.httpOptions);
    return response;
  }
  // OnDuty Templates

  addOnDutyTemplate(onDutyTemp: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/on-duty-templates`, onDutyTemp, this.httpOptions);
    return response;
  }

  updateOnDutyTemplate(id: string, onDutyTemp: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/on-duty-templates/${id}`, onDutyTemp, this.httpOptions);
    return response;
  }

  deleteOnDutyTemplate(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/on-duty-templates/${id}`, this.httpOptions);
    return response;
  }

  getOnDutyTemplate(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/on-duty-templates-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  getOnDutyTemplateById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/on-duty-templates/${id}`, this.httpOptions);
    return response;
  }

  // On-duty template assignment

  addOnDutyAssignmentTemplate(userOnDutyTemp: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/user-on-duty-templates`, userOnDutyTemp, this.httpOptions);
    return response;
  }

  updateOnDutyAssignmentTemplate(id: string, userOnDutyTemp: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/user-on-duty-templates/${id}`, userOnDutyTemp, this.httpOptions);
    return response;
  }

  deleteOnDutyAssignmentTemplate(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/user-on-duty-templates/${id}`, this.httpOptions);
    return response;
  }

  getOnDutyAssignmentTemplate(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/user-on-duty-templates-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  // Shift
  addShift(shift: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/shifts`, shift, this.httpOptions);
    return response;
  }

  updateShift(id: string, shift: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/shifts/${id}`, shift, this.httpOptions);
    return response;
  }

  deleteShift(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/shifts/${id}`, this.httpOptions);
    return response;
  }

  getShift(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/shifts-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  getShiftByUser(userId: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/shifts-by-user/${userId}`, this.httpOptions);
    return response;
  }
  // Shift Assignment
  addShiftAssignment(shiftAssignment: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/shift-template-assignments`, shiftAssignment, this.httpOptions);
    return response;
  }

  updateShiftAssignment(id: string, shiftAssignment: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/shift-template-assignments/${id}`, shiftAssignment, this.httpOptions);
    return response;
  }

  deleteShiftAssignment(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/shift-template-assignments/${id}`, this.httpOptions);
    return response;
  }

  getShiftAssignment(skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/shift-template-assignments-by-company`, { skip, next }, this.httpOptions);
    return response;
  }

  // Map location in attendance template
  addLocation(location: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/attendanceRegularizationRestrictedLocations`, location, this.httpOptions);
    return response;
  }

  updateLocation(id: string, location: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/attendanceRegularizationRestrictedLocations/${id}`, location, this.httpOptions);
    return response;
  }

  deleteLocation(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/attendanceRegularizationRestrictedLocations/${id}`, this.httpOptions);
    return response;
  }

  getLocation(regularizationID: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendanceRegularizationRestrictedLocations/${regularizationID}`, this.httpOptions);
    return response;
  }

  // regularization records
  addRegularization(regularization: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/regularizationRequests`, regularization, this.httpOptions);
    return response;
  }

  updateRegularization(id: string, regularization: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/regularizationRequests/${id}`, regularization, this.httpOptions);
    return response;
  }

  deleteRegularization(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/regularizationRequests/${id}`, this.httpOptions);
    return response;
  }

  getRegularization(regularizationID: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/regularizationRequests/${regularizationID}`, this.httpOptions);
    return response;
  }

  getAllRegularization(skip: string, next: string, status: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/regularizationRequests-by-company`, { skip, next, status }, this.httpOptions);
    return response;
  }
  getRegularizationByUser(userId: string, payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/regularizationRequests-by-user/${userId}`, payload, this.httpOptions);
    return response;
  }

  // On duty Request
  addOnDutyRequest(onDuty: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/employee-duty-requests`, onDuty, this.httpOptions);
    return response;
  }

  updateOnDutyRequest(id: string, location: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/employee-duty-requests/${id}`, location, this.httpOptions);
    return response;
  }

  deleteOnDutyRequest(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/employee-duty-requests/${id}`, this.httpOptions);
    return response;
  }

  getOnDutyRequest(onDuty: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/employee-duty-requests/${onDuty}`, this.httpOptions);
    return response;
  }

  getAllOnDutyRequests(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/employee-duty-requests-by-company`, payload, this.httpOptions);
    return response;
  }

  getAllOnDutyRequestsByUser(userId: string, skip: string, next: string): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/employee-duty-requests-by-user/${userId}`, { skip, next }, this.httpOptions);
    return response;
  }

  // Attendance modes

  addModes(mode: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-modes`, mode, this.httpOptions);
    return response;
  }

  updateModes(id: string, mode: any): Observable<response<any>> {
    var response = this.http.put<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-modes/${id}`, mode, this.httpOptions);
    return response;
  }

  deleteModes(id: string): Observable<response<any>> {
    var response = this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-modes/${id}`, this.httpOptions);
    return response;
  }

  getModesById(id: string): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-modes/${id}`, this.httpOptions);
    return response;
  }

  getModes(): Observable<response<any>> {
    var response = this.http.get<response<any>>(`${environment.apiUrlDotNet}/attendance/attendance-modes`, this.httpOptions);
    return response;
  }
  // Attendance records
  getAttendanceRecordsByMonth(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/get-attendance-by-month`, payload, this.httpOptions);
    return response;
  }

  getAttendanceRecordsByMonthByUser(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/get-attendance-by-month-user`, payload, this.httpOptions);
    return response;
  }

  uploadAttendanceRecords(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/upload-json`, payload, this.httpOptions);
    return response;
  }

  // Attendance Overtime

  getAttendanceOvertimeByMonth(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/get-overtime-by-month`, payload, this.httpOptions);
    return response;
  }
  getAttendanceOvertimeByUser(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/overtime-by-user`, payload, this.httpOptions);
    return response;
  }


  // Attendance process & LOPs

  addProcessAttendanceLOP(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/process-attendance-lop`, payload, this.httpOptions);
    return response;
  }
  ValidateMonthlyAttendanceByUser(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/validate-user-monthly-days-for-attendance`, payload, this.httpOptions);
    return response;
  }
  getProcessAttendanceLOPByMonth(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/process-attendance-lop-by-month`, payload, this.httpOptions);
    return response;
  }

  addProcessAttendance(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/process-attendance`, payload, this.httpOptions);
    return response;
  }

  getProcessAttendance(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/process-attendance-by-month`, payload, this.httpOptions);
    return response;
  }

  deleteProcessAttendance(payload: any): Observable<response<any>> {
    const options = {
      ...this.httpOptions,
      body: payload
    };
    return this.http.delete<response<any>>(`${environment.apiUrlDotNet}/attendance/process-attendance`, options);
  }

  // fnf Attendance process
  addFnFAttendanceProcess(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/process-attendance-fnf`, payload, this.httpOptions);
    return response;
  }

  getfnfAttendanceProcess(payload: any): Observable<response<any>> {
    var response = this.http.post<response<any>>(`${environment.apiUrlDotNet}/attendance/process-attendance-fnf-by-month`, payload, this.httpOptions);
    return response;
  }
}