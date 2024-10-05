import { Injectable } from '@angular/core';
import { Checklist,  ComplianceResponse,  ControlCategory, ControlNames, Department, FrameworkCategories, FrameworkNames } from '../../models/compliance';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ComplianceService {

  constructor(private http: HttpClient) { }
  private base_url = environment.BASE_URL;

  getAllFrameworkCateogry(){
    return this.http.get<FrameworkCategories[]>(`${this.base_url}/framework-category/getAll-frameworks-categories`);
  }

  getFrameworkNameByFrameworkCateogary(_frameworkCategoryName:string){
    return this.http.get<FrameworkNames[]>(`${this.base_url}/framework/frameworks-from-framework-category/${_frameworkCategoryName}`);
  }

  getAllControlCategory(){
    return this.http.get<ControlCategory[]>(`${this.base_url}/control-category/get-all-control-categories`);
  }

  getControlNameByControlCateogary(_controlCategoryName:string){
    return this.http.get<ControlNames[]>(`${this.base_url}/control/control-from-control-category/${_controlCategoryName}`);
  }

  getAllDepartments(){
    return this.http.get<Department[]>(`${this.base_url}/department/get-login-user-department`);
  }

  getChecklistByControlName(_controlName:string){
    return this.http.get<Checklist[]>(`${this.base_url}/checklist/get-checklist-from-control/${_controlName}`);
  }

  getAllControls(){
    return this.http.get<ControlNames[]>(`${this.base_url}/control/get-all-controls`);
  }

  getStatusOptions(){
    return this.http.get<any>(`${this.base_url}/security-compliance/compliance-status`);
  }

  

  getSecurityComplianceList(pgnum:number ,size:number| null |undefined ,sortField:string|string[],sortOrder:string,filters?:any){
    let params = new HttpParams()
    if (filters) {
      if (filters.frameworkCategory && filters.frameworkCategory.frameworkCategoryName) {
        params = params.set('frameworkCategory', filters.frameworkCategory.frameworkCategoryName);
      }
      if (filters.frameworkName && filters.frameworkName.frameworkName) {
        params = params.set('framework', filters.frameworkName.frameworkName);
      }
      if (filters.controlCategory && filters.controlCategory.controlCategoryName) {
        params = params.set('controlCategory', filters.controlCategory.controlCategoryName);
      }
      if (filters.control && filters.control.controlName) {
        params = params.set('control', filters.control.controlName);
      }
      if (filters.complianceChecklist && filters.complianceChecklist.controlChecklist) {
        params = params.set('complianceChecklist', filters.complianceChecklist.controlChecklist);
      }
      if (filters.Department && filters.Department.departmentName) {
        params = params.set('department', filters.Department.departmentName);
      }
      if (filters.EvidenceStatus) {
        params = params.set('evidenceStatus', filters.EvidenceStatus);
      }
      if (filters.Status !== null && filters.Status !== undefined) {
        params = params.set('status', filters.Status);
      }
      if (filters.calendarFrom) {
        params = params.set('startDate', filters.calendarFrom);
      }
      if (filters.calendarTo) {
        params = params.set('endDate', filters.calendarTo);
      }
    }
    // console.log(`${this.base_url}/security-compliance/get-filtered-security-compliance-paginated?page=${pgnum}&size=${size}&isAscending=true`,{params});
    return this.http.get<ComplianceResponse>(`${this.base_url}/security-compliance/get-filtered-security-compliance-paginated?page=${pgnum}&size=${size}&isAscending=true`,{params})
    
    // return this.http.get<ComplianceResponse>(`${this.base_url}/security-compliance/get-filtered-security-compliance-paginated?page=${pgnum}&size=${size}&sortField=${sortField}&sortOrder=${sortOrder}`,{params});
  }

  uploadEvidence(uploadfiles: FormData, securityid : string , checklistName : string){
    
    return this.http.post<any>(`${this.base_url}/evidence/upload?checklistName=${checklistName}&securityId=${securityid}`,uploadfiles)
  }

  addNewCompliance(data:any){
    return this.http.post<any>(`${this.base_url}/security-compliance/add-edit-security-compliance`,data)
  }

  exportExcelRequest(){
    return this.http.get<Blob>(`${this.base_url}/security-compliance/export-excel`,{responseType:'blob' as 'json'})
  }

  getEvidenceView(filename:string){
    return this.http.get<Blob>(`${this.base_url}/evidence/view/${filename}`,{responseType: 'blob' as 'json'})
  }

  downloadEvidence(filename: string){
    return this.http.get<Blob>(`${this.base_url}/evidence/download/${filename}`,{responseType: 'blob' as 'json'})
  }

  getDataToEdit(complianceIds:string[]){
    const params = complianceIds.map(id => `complianceIds=${encodeURIComponent(id)}`).join('&');
    return this.http.get<any>(`${this.base_url}/security-compliance/security-compliance?${params}`)
  }

}
