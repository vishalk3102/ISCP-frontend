import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { ComplianceService } from '../../services/complianceService/compliance.service';
import {
  Checklist,
  Compliance,
  ComplianceFilters,
  ComplianceResponse,
  ControlCategory,
  ControlNames,
  Department,
  FrameworkCategories,
  FrameworkNames,
} from '../../models/compliance';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../services/data/data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-security-complaince',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    DialogModule,
    ButtonModule,
    RouterLink,
    CheckboxModule,
    ReactiveFormsModule,
    FormsModule,
    ProgressSpinnerModule,
    MultiSelectModule,
  ],
  templateUrl: './security-complaince.component.html',
  styleUrl: './security-complaince.component.scss',
  providers: [DatePipe],
})
export class SecurityComplainceComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('complianceChecklistDropdown')
  complianceChecklistDropdown!: MultiSelect;
  form!: FormGroup;
  frameworkCategories!: FrameworkCategories[];
  frameworkNames!: FrameworkNames[];
  controlCategories!: ControlCategory[];
  controls!: ControlNames[];
  complianceChecklists!: Checklist[];
  departments!: Department[];
  evidenceStatuses!: any[];
  statuses!: any[];
  monthYearFormat = 'MM, yy';
  today = new Date()
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })
    .replace(/\s+/g, ', ');
  // yearstartDate = new Date(new Date().getFullYear(), 0, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(/\s+/g, ', ');
  data!: Compliance[];
  loading: boolean = false;
  selectedIds!: Compliance;

  displayEvidenceModal: boolean = false;
  displayUploadEvidenceModal: boolean = false;
  currentEvidenceImg!: string;
  selectedFiles: File[] = [];
  maxSizeMB: number = 50;
  imagePreviews: string[] = [];
  evidenceUploadId!: string;
  isFrameworkNameDisabled: boolean = true;
  rows: number = 10;
  first: number = 0;
  totalRecords: number = 0;

  role!: string;
  appliedFilters: ComplianceFilters = {};
  checkListName!: string;
  selectedComplianceIds: Set<string> = new Set();
  selecteddata: any[] = [];
  selectedUrl: SafeResourceUrl | null = null;
  selectedBlob!: any;
  minDate!: Date;

  evidencename: any;
  private settingValue: boolean = false;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,
    private complianceService: ComplianceService,
    private datePipe: DatePipe,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.fb.group({
      frameworkCategory: '',
      frameworkName: '',
      controlCategory: '',
      control: '',
      complianceChecklist: '',
      Department: '',
      EvidenceStatus: '',
      Status: '',
      calendarFrom: '',
      calendarTo: '',
    });
  }

  ngOnInit() {
    this.getUserType();
    this.selecteddata = [];
    this.getFrameworkCateogaryNames();
    this.getControlCategoaryNames();
    this.getAllDepartments();
    this.getAllFrameworks();
    this.getAllControls();
    this.getAllChecklist();

    this.evidenceStatuses = [
      { name: 'All', value: null },
      { name: 'Completed', value: 'Completed' },
      { name: 'Pending', value: 'Pending' },
    ];
    this.statuses = [
      { name: 'Active', value: true },
      { name: 'Inactive', value: false },
    ];

    this.form = new FormGroup({
      frameworkCategory: new FormControl(null),
      frameworkName: new FormControl(null),
      controlCategory: new FormControl(null),
      control: new FormControl(null),
      complianceChecklist: new FormControl(null),
      Department: new FormControl(null),
      EvidenceStatus: new FormControl(this.evidenceStatuses[0]),
      Status: new FormControl(this.statuses[0]),
      calendarFrom: new FormControl(this.today),
      calendarTo: new FormControl(this.today),
    });

    // this.form = new FormGroup({
    //   frameworkCategory: new FormControl(null),
    //   frameworkName: new FormControl({ value: null, disabled: true }),
    //   controlCategory: new FormControl(null),
    //   control: new FormControl({ value: null, disabled: true }),
    //   complianceChecklist: new FormControl({ value: null, disabled: true }),
    //   Department: new FormControl(null),
    //   EvidenceStatus: new FormControl(this.evidenceStatuses[0]),
    //   Status: new FormControl(this.statuses[0]),
    //   calendarFrom: new FormControl(this.today),
    //   calendarTo: new FormControl(this.today),
    // });

    /*  this.controlDisablityOfInputText('frameworkCategory', 'frameworkName');
    this.controlDisablityOfInputText('controlCategory', 'control');
    this.controlDisablityOfInputText('control', 'complianceChecklist'); */

    /*  this.form.get('calendarFrom')?.valueChanges.subscribe((selectedDate) => {
      this.minDate = selectedDate;
      this.checkDateOrder();
    });

    this.form.get('calendarTo')?.valueChanges.subscribe(() => {
      this.checkDateOrder();
    }); */
    this.form.get('calendarFrom')?.valueChanges.subscribe((selectedDate) => {
      if (!this.settingValue) {
        this.minDate = selectedDate;
        this.checkDateOrder();
      }
    });

    this.form.get('calendarTo')?.valueChanges.subscribe(() => {
      if (!this.settingValue) {
        this.checkDateOrder();
      }
    });
  }

  getUserType() {
    this.role = sessionStorage.getItem('role') || '';
  }

  isAdmin(): boolean {
    return this.role === 'Admin';
  }
  isUploader(): boolean {
    return this.role === 'Uploader';
  }
  isViewer(): boolean {
    return this.role === 'Viewer';
  }

  setFormValues(filters: ComplianceFilters) {
    this.form.patchValue({
      frameworkCategory: filters.frameworkCategory || null,
      frameworkName: filters.frameworkName || null,
      controlCategory: filters.controlCategory || null,
      control: filters.control || null,
      complianceChecklist: filters.complianceChecklist || null,
      Department: filters.Department || null,
      EvidenceStatus:
        filters.EvidenceStatus !== undefined
          ? this.evidenceStatuses.find(
              (e) => e.value === filters.EvidenceStatus
            ) || this.evidenceStatuses[0] // Select matching value or default
          : this.evidenceStatuses[0],
      Status:
        filters.Status !== undefined
          ? this.statuses.find((s) => s.value === filters.Status)
          : this.statuses[0],
      calendarFrom: filters.calendarFrom
        ? new Date(filters.calendarFrom)
        : new Date(this.today),
      calendarTo: filters.calendarTo
        ? new Date(filters.calendarTo)
        : new Date(this.today),
    });

    this.cd.detectChanges();
  }

  loadData(event?: TableLazyLoadEvent) {
    console.log(event);
    this.setFormValues(this.complianceService.getFilters());
    // Determine sorting and pagination
    const sortField = event?.sortField ?? 'creationTime';
    const sortOrder = event?.sortOrder === 1 ? 'asc' : 'desc';
    const page = event ? Math.floor(event.first! / event.rows!) : 0;
    const size = event ? event.rows : this.rows;

    // Get filters from the ComplianceService
    const filters =
      Object.keys(this.complianceService.getFilters()).length > 0
        ? this.complianceService.getFilters()
        : undefined;

    // Call the service to get the compliance data
    this.complianceService
      .getSecurityComplianceList(page, size, sortField, sortOrder, filters)
      .subscribe({
        next: (res: ComplianceResponse) => {
          this.data = res.content; // Set the response data
          this.rows = res.pageSize; // Update the rows
          this.totalRecords = res.totalElements; // Update total records
          this.first = event ? event.first! : 0; // Update the current page index

          console.log('Fetched data:', this.data);

          this.cd.detectChanges(); // Trigger change detection
        },
        error: (err) => {
          console.error('Error fetching compliance data:', err);
          // Optionally, handle error state here (e.g., showing a message to the user)
        },
      });
  }
  // Helper function to convert department names from backend format to display format
  convertDepartmentFromBackendFormat(department: string): string {
    switch (department) {
      case 'Human_Resource':
        return 'Human Resource';
      default:
        return department.replace(/_/g, ' '); // Handle other cases with underscores
    }
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

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'MMMM yyyy') || '';
  }

  getFrameworkCateogaryNames() {
    this.complianceService.getAllFrameworkCateogry().subscribe({
      next: (res: FrameworkCategories[]) => {
        this.frameworkCategories = res;
        // console.log(res);
      },
      error: (err) => {
        console.error('Error fetching framework categories:', err);
      },
    });
  }

  getFrameworkNames(_frameworkCategoryName: string) {
    this.complianceService
      .getFrameworkNameByFrameworkCateogary(_frameworkCategoryName)
      .subscribe({
        next: (res: FrameworkNames[]) => {
          // console.log(res);
          this.frameworkNames = res;
        },
        error: (err) => {
          console.error('Error fetching framework names:', err);
        },
      });
  }

  getControlCategoaryNames() {
    this.complianceService.getAllControlCategory().subscribe({
      next: (res: ControlCategory[]) => {
        // console.log(res);
        this.controlCategories = res;
      },
      error: (err) => {
        console.error('Error fetching control cateogaries', err);
      },
    });
  }

  getControlNames(_controlCategoryName: string) {
    this.complianceService
      .getControlNameByControlCateogary(_controlCategoryName)
      .subscribe({
        next: (res: ControlNames[]) => {
          this.controls = res;
          // console.log(this.controls);
        },
        error: (err) => {
          console.error('Error fetching control names', err);
        },
      });
  }

  getAllDepartments() {
    this.complianceService.getAllDepartments().subscribe({
      next: (res: Department[]) => {
        this.departments = res;
      },
      error: (err) => {
        console.error('Error fetching department names', err);
      },
    });
  }

  getChecklistByControlId(_controlName: string) {
    this.complianceService.getChecklistByControlName(_controlName).subscribe({
      next: (res: Checklist[]) => {
        console.log(res);

        this.complianceChecklists = res;
      },
      error: (err) => {
        console.error('Error fetching checklists', err);
      },
    });
  }

  getChecklistByControlName(_controlName: string[]) {
    this.complianceService
      .getChecklistByControlNameList(_controlName)
      .subscribe({
        next: (res: Checklist[]) => {
          console.log(res);

          this.complianceChecklists = res;
        },
        error: (err) => {
          console.error('Error fetching checklists', err);
        },
      });
  }

  getAllChecklist() {
    this.complianceService.getAllChecklistNames().subscribe({
      next: (res: Checklist[]) => {
        console.log(res);

        this.complianceChecklists = res;
      },
      error: (err) => {
        console.error('Error fetching checklists', err);
      },
    });
  }

  getAllControls() {
    this.complianceService.getAllControlNames().subscribe({
      next: (res: ControlNames[]) => {
        this.controls = res;
      },
      error: (err) => {
        console.error('Error fetching control names', err);
      },
    });
  }

  getAllFrameworks() {
    this.complianceService.getAllFrameworkNames().subscribe({
      next: (res: FrameworkNames[]) => {
        // console.log(res);
        this.frameworkNames = res;
      },
      error: (err) => {
        console.error('Error fetching framework names:', err);
      },
    });
  }

  /*  controlDisablityOfInputText(parent: string, child: string) {
    this.form.get(parent)?.valueChanges.subscribe((val) => {
      if (val) {
        this.form.get(child)?.enable();

        if (parent === 'frameworkCategory') {
          console.log(val.frameworkCategoryName);
          this.form.get(child)?.setValue(null);
          this.getFrameworkNames(val.frameworkCategoryName);
        }
        if (parent === 'controlCategory') {
          this.form.get(child)?.setValue(null);
          this.getControlNames(val.controlCategoryName);
        } else if (parent === 'control') {
          const selectedControls = this.form.get('control')?.value;
          console.log('Selected controls:', selectedControls);

          if (selectedControls.length === 0) {
            this.form.get(child)?.disable();
            this.form.get(child)?.setValue(null);
            if (this.complianceChecklistDropdown) {
              this.complianceChecklistDropdown.hide();
            }
          } else {
            const controlNames: string[] = selectedControls.map(
              (control: ControlNames) => control.controlName
            );

            this.form.get(child)?.setValue(null);
            console.log('Control names:', controlNames);
            this.getChecklistByControlName(controlNames);
          }
        }
      } else {
        this.form.get(child)?.setValue(null);
        this.form.get(child)?.disable();
        if (parent === 'control' && this.complianceChecklistDropdown) {
          this.complianceChecklistDropdown.hide();
        }
      }
    });
  } */

  searchFilter() {
    let calendarFrom = this.form.value.calendarFrom;
    let calendarTo = this.form.value.calendarTo;

    console.log('calendar-form', calendarFrom);

    let searchFilterVal = {
      frameworkCategory: this.form.value.frameworkCategory,
      frameworkName: this.form.value.frameworkName,
      controlCategory: this.form.value.controlCategory,
      control: this.form.value.control,
      complianceChecklist: this.form.value.complianceChecklist
        ? this.form.value.complianceChecklist
        : [],
      Department: this.form.value.Department ? this.form.value.Department : [],
      EvidenceStatus: this.form.value.EvidenceStatus.value,
      Status: this.form.value.Status.value,
      calendarFrom: this.formatDate(calendarFrom),
      calendarTo: this.formatDate(calendarTo),
    };

    console.log('TD filter search', searchFilterVal);
    // this.appliedFilters = searchFilterVal;
    this.complianceService.setFilters(searchFilterVal);

    this.loadData(undefined);
  }

  exportToExcel() {
    this.complianceService.exportExcelRequest().subscribe({
      next: (res: Blob) => {
        const excelUrl: string = URL.createObjectURL(res);
        const a: HTMLAnchorElement = document.createElement('a');
        a.href = excelUrl;
        a.download = 'export.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(excelUrl);
      },
    });
  }

  exportToPDF() {
    const element = document.querySelector('.table-responsive') as HTMLElement;
    if (element) {
      html2canvas(element, { scale: 2 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const headerHeight = 200; // Height for the "CONFIDENTIAL DATA" header
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height + headerHeight],
          });

          // Add "CONFIDENTIAL DATA" heading
          pdf.setFontSize(52);
          pdf.setTextColor(255, 0, 0); // Red color
          pdf.setFont('Aerial', 'bold');
          pdf.text('CONFIDENTIAL DATA', canvas.width / 2, headerHeight / 2, {
            align: 'center',
            baseline: 'middle',
          });

          // Add a line under the heading
          pdf.setDrawColor(0);
          pdf.setLineWidth(1);
          pdf.line(20, headerHeight, canvas.width - 20, headerHeight);

          // Add the table image below the heading
          pdf.addImage(
            imgData,
            'PNG',
            0,
            headerHeight,
            canvas.width,
            canvas.height
          );

          // Save the PDF
          pdf.save('confidential_export.pdf');
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
        });
    } else {
      console.error('Element not found');
    }
  }

  openEvidenceModal(evidence: any) {
    if (evidence) {
      this.evidencename = evidence.value;
      this.loading = true;
      console.log('Loading started:', this.loading);
      this.complianceService.getEvidenceView(evidence.value).subscribe({
        next: (res: Blob) => {
          this.selectedBlob = res;
          this.selectedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            URL.createObjectURL(res)
          );
          this.loading = false;
          console.log('Loading stopped:', this.loading);
          this.displayEvidenceModal = true;
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Error fetching evidence');
        },
      });
    } else {
      this.toastr.error('No evidence exists');
    }
  }

  calculateModalWidth(): string {
    const baseWidth = 800; // Base width for the modal at start
    const maxWidth = 1000; // Maximum width for the modal
    const widthPerFile = 50; // Additional width per file uploaded

    // Calculate the width dynamically based on the number of uploaded files
    const calculatedWidth =
      baseWidth + this.selectedFiles.length * widthPerFile;

    // Limit the width to a maximum width
    return `${Math.min(calculatedWidth, maxWidth)}px`;
  }

  calculateModalHeight(): string {
    const baseHeight = 400; // Base height for the modal at start
    const maxHeight = 700; // Maximum height for the modal
    const heightPerFile = 50; // Additional height per file uploaded

    // Calculate the height dynamically based on the number of uploaded files
    const calculatedHeight =
      baseHeight + this.selectedFiles.length * heightPerFile;

    // Limit the height to a maximum height
    return `${Math.min(calculatedHeight, maxHeight)}px`;
  }

  calculateModalTableHeight(): string {
    const baseHeight = 100; // Base height for the table inside the modal
    const maxHeight = 600; // Maximum height for the table
    const heightPerFile = 50; // Additional height per file

    // Calculate the height of the table dynamically based on the number of files
    const calculatedHeight =
      baseHeight + this.selectedFiles.length * heightPerFile;

    // Ensure the table doesn't exceed the max height
    return `${Math.min(calculatedHeight, maxHeight)}px`;
  }

  calculateFileListHeight(): string {
    const maxListHeight = 600; // Maximum height for the file list area
    const heightPerFile = 150; // Height per file in the list
    const calculatedHeight = this.selectedFiles.length * heightPerFile;

    // Ensure the file list height doesn't exceed a maximum value
    return `${Math.min(calculatedHeight, maxListHeight)}px`;
  }

  /*  downloadEvidence() {
    console.log(this.evidencename);

    if (this.evidencename) {
      this.loading = true;
      this.complianceService.getEvidenceView(this.evidencename).subscribe({
        next: (res: Blob) => {
          // Log the Blob details to inspect the response
          console.log('Blob received:', res);
          console.log('Blob type:', res.type); // Check the MIME type
          console.log('Blob size:', res.size); // Check the size of the file
          const blobUrl = URL.createObjectURL(res);
          const sanitizedUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          const a = document.createElement('a');
          a.href = sanitizedUrl as string;
          a.download = this.evidencename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Error downloading evidence');
        },
      });
    } else {
      this.toastr.error('Oops! Nothing happened');
    }
  } */
  downloadEvidence() {
    console.log(this.evidencename); // Log the file name to ensure it's correct

    if (this.evidencename) {
      this.loading = true;

      // Call the compliance service to get the evidence file
      this.complianceService.getEvidenceView(this.evidencename).subscribe({
        next: (res: Blob) => {
          // Log the Blob details to inspect the response
          console.log('Blob received:', res);
          console.log('Blob type:', res.type); // Check the MIME type
          console.log('Blob size:', res.size); // Check the size of the file

          // Create a URL for the Blob
          const blobUrl = window.URL.createObjectURL(res);

          // Log the created blob URL to ensure it's correct
          console.log('Blob URL:', blobUrl);

          // Create an anchor element to trigger the download
          const a = document.createElement('a');
          a.href = blobUrl;

          // Set the file name based on its type
          if (
            !this.evidencename.endsWith('.jpeg') &&
            res.type === 'image/jpeg'
          ) {
            a.download = `${this.evidencename}.jpeg`; // Append the correct file extension
          } else {
            a.download = this.evidencename;
          }

          // Append the link to the body
          document.body.appendChild(a);

          // Trigger the download by simulating a click event
          a.click();

          // Clean up the DOM after the download
          document.body.removeChild(a);

          // Revoke the Blob URL to free up memory
          window.URL.revokeObjectURL(blobUrl);

          this.loading = false; // Set loading to false when done
        },
        error: (error) => {
          // Log the error details if the download fails
          console.error('Error downloading file:', error);
          this.toastr.error('Error downloading evidence');
          this.loading = false;
        },
      });
    } else {
      this.toastr.error('Oops! Nothing happened');
    }
  }

  openUploadEvidenceModal(id: string, cid: string) {
    this.evidenceUploadId = id;
    this.checkListName = cid;
    console.log(id);
    this.displayUploadEvidenceModal = true;
  }

  isimage(): boolean {
    return this.selectedBlob && this.selectedBlob.type.startsWith('image/');
  }

  isPdf(): boolean {
    return this.selectedBlob && this.selectedBlob.type === 'application/pdf';
  }

  isvideo(): boolean {
    return this.selectedBlob?.type.startsWith('video/mp4');
  }
  uploadEvidence() {
    if (this.selectedFiles.length > 0) {
      const evidenceData = new FormData();
      this.loading = true;
      this.selectedFiles.forEach((file: File) => {
        evidenceData.append('files', file);
      });

      console.log(evidenceData);
      this.complianceService
        .uploadEvidence(evidenceData, this.evidenceUploadId, this.checkListName)
        .subscribe({
          next: (res: any) => {
            console.log(res);
            this.loadData(undefined);
            this.selectedFiles = [];
            this.closeDialog();
            this.loading = false;
          },
          error: (err) => {
            console.log(err);

            this.toastr.error(err);
          },
        });
    } else {
      console.log('No files selected for upload');
    }
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  isPDF(file: File): boolean {
    return file.type === 'application/pdf';
  }

  isVideo(file: File): boolean {
    return file.type === 'video/mp4';
  }

  isExcel(file: File): boolean {
    return file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
  }
  isaudio(file: File): boolean {
    console.log('duering upload', file.type === 'audio/mp3');

    return file.type === 'audio/mp3';
  }

  onFileSelectedOrDropped(file: File) {
    if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.toastr.error(
        `File size exceeds the ${this.maxSizeMB}MB limit. Please select a smaller file.`
      );
    } else {
      this.selectedFiles.push(file);
      this.toastr.success(`Selected file: ${file.name}`);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
    console.log(this.selectedFiles);
  }

  onFileInput(event: any) {
    const files: FileList = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        this.onFileSelectedOrDropped(file);
      }
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files) {
      const files = Array.from(event.dataTransfer.files);
      files.forEach((file) => this.onFileSelectedOrDropped(file));
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }
  cancelUpload() {
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.toastr.info('File upload Canceled');
  }
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }
  onDragLeave(event: DragEvent) {}
  closeDialog() {
    if (this.displayUploadEvidenceModal == true) {
      this.displayUploadEvidenceModal = false;
    } else {
      this.displayEvidenceModal = false;
    }
    this.loadData();
  }
  removeFile(index: number) {
    const removedFile = this.selectedFiles.splice(index, 1)[0];
    this.imagePreviews.splice(index, 1);
    console.log(this.selectedFiles);
    this.toastr.info(`Removed file: ${removedFile.name}`);
    this.fileInput.nativeElement.value = '';
  }

  navigateToAddEditPage() {
    console.log('VK', this.selecteddata);
    // this.selectedComplianceIds =  new Set<string>(this.selecteddata.map(item => item.complianceId).filter(id => id));
    // console.log("hello selected data",this.selectedComplianceIds);

    this.dataService.updateSelectedIds(Array.from(this.selecteddata));
    this.router.navigate(['/security-compliance-add-edit']);
  }

  onCancel() {
    this.selecteddata = [];
    this.selectedComplianceIds.clear();
  }

  onReset() {
    // Reset frameworkCategory
    this.form.reset();
    this.settingValue = true;

    this.form.get('EvidenceStatus')!.setValue(this.evidenceStatuses[0]);
    this.form.get('Status')!.setValue(this.statuses[0]);

    this.form.get('calendarFrom')!.setValue(this.today);
    this.form.get('calendarTo')!.setValue(this.today);

    this.settingValue = false;
    // Clear other states
    this.selecteddata = [];
    this.selectedComplianceIds.clear();
    // this.appliedFilters = {};
    this.complianceService.clearFilters();
    this.loadData();
    // this.searchFilter();
  }

  checkDateOrder(): void {
    const fromDate = this.form.get('calendarFrom')?.value;
    const toDate = this.form.get('calendarTo')?.value;

    if (fromDate && toDate && fromDate > toDate) {
      this.form.get('calendarFrom')?.setValue(null);
      this.toastr.error(
        '"Calendar From date" cannot be greater than the "Calendar To date". Please select a valid range.'
      );
    }
  }

  getEvidenceOptions(evidenceList: any[]): { label: string; value: any }[] {
    return evidenceList.map((ev, i) => ({
      label: 'Evidence ' + (i + 1),
      value: ev,
    }));
  }
}
