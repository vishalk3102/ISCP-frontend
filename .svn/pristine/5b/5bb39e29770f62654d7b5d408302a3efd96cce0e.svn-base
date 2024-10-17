import { Injectable } from '@angular/core';
import {
  Checklist,
  ComplianceFilters,
  ComplianceResponse,
  ControlCategory,
  ControlNames,
  Department,
  FrameworkCategories,
  FrameworkNames,
} from '../../models/compliance';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ComplianceService {
  private filters: ComplianceFilters = {};
  constructor(private http: HttpClient) {}
  private base_url = environment.BASE_URL;

  setFilters(filters: ComplianceFilters) {
    this.filters = filters;
  }

  getFilters(): ComplianceFilters {
    return this.filters;
  }

  clearFilters() {
    this.filters = {};
  }

  getAllFrameworkNames() {
    return this.http.get<FrameworkNames[]>(
      `${this.base_url}/framework/getAll-frameworks`
    );
  }
  getAllControlNames() {
    return this.http.get<ControlNames[]>(
      `${this.base_url}/control/get-all-controls`
    );
  }
  getAllChecklistNames() {
    return this.http.get<Checklist[]>(
      `${this.base_url}/checklist/get-all-checklist`
    );
  }

  getAllFrameworkCateogry() {
    return this.http.get<FrameworkCategories[]>(
      `${this.base_url}/framework-category/getAll-frameworks-categories`
    );
  }

  getFrameworkNameByFrameworkCateogary(_frameworkCategoryName: string) {
    return this.http.get<FrameworkNames[]>(
      `${this.base_url}/framework/frameworks-from-framework-category/${_frameworkCategoryName}`
    );
  }

  getAllControlCategory() {
    return this.http.get<ControlCategory[]>(
      `${this.base_url}/control-category/get-all-control-categories`
    );
  }

  getControlNameByControlCateogary(_controlCategoryName: string) {
    return this.http.get<ControlNames[]>(
      `${this.base_url}/control/control-from-control-category/${_controlCategoryName}`
    );
  }

  getAllDepartments() {
    return this.http.get<Department[]>(
      `${this.base_url}/department/get-login-user-department`
    );
  }

  getChecklistByControlName(_controlName: string) {
    // Encode the control name to handle spaces and special characters
    const encodedControlName = encodeURIComponent(_controlName);

    console.log(encodedControlName);
    console.log(
      `${this.base_url}/checklist/get-checklist-from-control/${encodedControlName}`
    );

    return this.http.get<Checklist[]>(
      `${this.base_url}/checklist/get-checklist-from-control/${encodedControlName}`
    );
  }

  getChecklistByControlNameList(_controlName: string[]) {
    // Define the request body as the array of control names
    const requestBody = _controlName;

    console.log('requestBody new :', requestBody);
    console.log(`${this.base_url}/checklist/get-checklist-from-control`);

    return this.http.post<Checklist[]>(
      `${this.base_url}/checklist/get-checklist-from-control`,
      requestBody
    );
  }

  getAllControls() {
    return this.http.get<ControlNames[]>(
      `${this.base_url}/control/get-all-controls`
    );
  }

  getStatusOptions() {
    return this.http.get<any>(
      `${this.base_url}/security-compliance/compliance-status`
    );
  }
  getSecurityComplianceList(
    pgnum: number,
    size: number | null | undefined,
    sortField: string | string[],
    sortOrder: string,
    filters?: any
  ) {
    // Create the request body based on the new API model
    const requestBody = {
      page: pgnum,
      size: size ?? 10,
      sortField: Array.isArray(sortField) ? sortField.join(',') : sortField,
      sortOrder: sortOrder,
      framework: filters?.frameworkName
        ? (filters.frameworkName as FrameworkNames[]).map(
            (item: FrameworkNames) => item.frameworkName
          )
        : [],
      frameworkCategory: filters?.frameworkCategory
        ? (filters.frameworkCategory as FrameworkCategories[]).map(
            (item: FrameworkCategories) => item.frameworkCategoryName
          )
        : [],

      control: filters?.control
        ? (filters.control as ControlNames[]).map(
            (item: ControlNames) => item.controlName
          )
        : [],
      controlCategory: filters?.controlCategory
        ? (filters.controlCategory as ControlCategory[]).map(
            (item: ControlCategory) => item.controlCategoryName
          )
        : [],
      complianceChecklist: filters?.complianceChecklist
        ? (filters.complianceChecklist as Checklist[]).map(
            (item: Checklist) => item.controlChecklist
          )
        : [],
      department:
        filters?.Department && filters.Department.length
          ? (filters.Department as Department[]).map((dept: Department) =>
              this.convertDepartmentToBackendFormat(dept.departmentName)
            )
          : [],
      evidenceStatus: filters?.EvidenceStatus,
      status:
        filters?.Status !== null && filters?.Status !== undefined
          ? filters.Status
          : true,
      startDate: filters?.calendarFrom,
      endDate: filters?.calendarTo,
    };

    console.log('Request Body:', requestBody);

    return this.http.post<ComplianceResponse>(
      `${this.base_url}/security-compliance/get-filtered-security-compliance-paginated`,
      requestBody
    );
  }

  uploadEvidence(
    uploadfiles: FormData,
    securityid: string,
    checklistName: string
  ) {
    return this.http.post<any>(
      `${this.base_url}/evidence/upload?checklistName=${checklistName}&securityId=${securityid}`,
      uploadfiles
    );
  }

  addNewCompliance(data: any) {
    return this.http.post<any>(
      `${this.base_url}/security-compliance/add-edit-security-compliance`,
      data
    );
  }

  exportExcelRequest() {
    return this.http.get<Blob>(
      `${this.base_url}/security-compliance/export-excel`,
      { responseType: 'blob' as 'json' }
    );
  }

  getEvidenceView(filename: string) {
    return this.http.get<Blob>(`${this.base_url}/evidence/view/${filename}`, {
      responseType: 'blob' as 'json',
    });
  }

  downloadEvidence(filename: string) {
    return this.http.get<Blob>(
      `${this.base_url}/evidence/download/${filename}`,
      { responseType: 'blob' as 'json' }
    );
  }

  getDataToEdit(complianceIds: string[]) {
    const params = complianceIds
      .map((id) => `complianceIds=${encodeURIComponent(id)}`)
      .join('&');
    return this.http.get<any>(
      `${this.base_url}/security-compliance/security-compliance?${params}`
    );
  }

  // Helper function to convert department names
  convertDepartmentToBackendFormat(department: string): string {
    switch (department) {
      case 'Human Resource':
        return 'Human_Resource';
      default:
        return department;
    }
  }
  // checkComplianceExists(
  //   framework: string,
  //   control: string,
  //   periodicity: string,
  //   checklist: string,
  //   isEditMode: boolean = false
  // ) {
  //   if (isEditMode) {
  //     if (!periodicity) {
  //       console.warn('Periodicity is required in edit mode');
  //       return of(false);
  //     }
  //   } else {
  //     if (!framework || !control || !periodicity || !checklist) {
  //       console.warn('All fields are required in add mode');
  //       return of(false);
  //     }
  //   }
  //   const requestBody = {
  //     framework: framework,
  //     control: control,
  //     periodicity: periodicity,
  //     complianceChecklist: checklist,
  //   };

  //   return this.http.post<any>(
  //     `${this.base_url}/security-compliance/check-compliance-exists`,
  //     requestBody
  //   );
  // }
  checkComplianceExists(
    requestBody: {
      framework: string;
      control: string;
      periodicity: string;
      checklist: any[];
      // evidenceComplianceStatus: Boolean;
    },
    isEditMode: boolean = false
  ): Observable<boolean> {
    // console.log('Function called -api');
    // if (isEditMode) {
    //   if (!periodicity) {
    //     console.warn('Periodicity is required in edit mode');
    //     return of(false);
    //   }
    // } else {
    //   if (!framework || !control || !periodicity || !checklist) {
    //     console.warn('All fields are required in add mode');
    //     return of(false);
    //   }
    // }
    console.log('request-body', requestBody);
    return this.http.post<boolean>(
      `${this.base_url}/security-compliance/check-compliance-exists`,
      requestBody
    );
  }
}
