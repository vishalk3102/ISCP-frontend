export interface Compliance {
  securityId?: string;
  recordId?: string;
  complianceId?: string;
  frameworkName: string;
  frameworkCategory: string;
  controlCategory: string;
  controlName: string;
  checklistName: string[] | string;
  periodicity: string;
  departments: string[];
  evidenceComments: string;
  evidenceComplianceStatus: boolean;
  evidenceDTOList?: any | null;
  eventDate?: string;
  evidenceList: [];
}

export interface Department {
  depatmentId?: string;
  departmentName: string;
}

export interface ControlCategory {
  controlCategoryId?: string;
  controlCategoryName: string;
}

export interface Compliances {
  name: string;
  code: string;
}

export interface Periodicities {
  name: string;
  value: string;
}

export interface FrameworkNames {
  frameworkId: string;
  frameworkName: string;
  startDate?: string;
  endDate?: string;
}

export interface FrameworkCategories {
  frameworkCategoryId: string;
  frameworkCategoryName: string;
}

export interface ControlNames {
  controlId: string;
  controlName: string;
  controlCategory: { controlCategoryName: string };
}

export interface Checklist {
  checklistId?: string;
  controlChecklist: string;
}

export interface ComplianceResponse {
  content: Compliance[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

export interface ComplianceFilters {
  frameworkCategory?: string | null;
  frameworkName?: string | null;
  controlCategory?: string | null;
  control?: string | null;
  complianceChecklist?: string | null;
  Department?: string | null;
  EvidenceStatus?: any;
  Status?: any;
  calendarFrom?: string | null;
  calendarTo?: string | null;
}
