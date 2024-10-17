import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import {
  Checklist,
  Compliance,
  Compliances,
  ControlNames,
  Department,
  FrameworkCategories,
  FrameworkNames,
  Periodicities,
} from '../../models/compliance';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule, DatePipe } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ComplianceService } from '../../services/complianceService/compliance.service';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DataService } from '../../services/data/data.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-security-complaince-add-edit',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    DialogModule,
    DropdownModule,
    TableModule,
    MultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    DialogModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './security-complaince-add-edit.component.html',
  styleUrl: './security-complaince-add-edit.component.scss',
  providers: [DatePipe],
})
export class SecurityComplainceAddEditComponent {
  form: FormGroup;
  dataForm: FormGroup;
  departments: string[] = [];
  controls: ControlNames[] = [];
  periodicities: Periodicities[] = [
    { name: 'Annually', value: 'Annually' },
    { name: 'Bi Annually', value: 'Bi_Annually' },
    { name: 'Quarterly', value: 'Quarterly' },
    { name: 'Monthly', value: 'Monthly' },
    { name: 'On Event', value: 'OnEvent' },
  ];

  frameworkCategories: FrameworkCategories[] = [];
  frameworkNames: FrameworkNames[] = [];
  checklistMap: { [controlName: string]: Checklist[] } = {};

  displayEventDateModal = false;
  monthYearFormat = 'MM, yy';
  minDate!: Date;
  maxDate!: Date;
  eventDate: Date | null = null;
  loading: boolean = false;
  statuses = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false },
  ];
  dropdownClosed = true;
  isComplianceValid: boolean = true;
  selectedChecklistData: {
    index: number;
    selectedChecklists: string[];
  } | null = null;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private complianceService: ComplianceService,
    private datePipe: DatePipe,
    private dataService: DataService,
    private cd: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      frameworkCategory: ['', Validators.required],
      frameworkNames: [{ value: '', disabled: true }, Validators.required],
      complianceCalendar: [{ value: '', disabled: true }],
      controls: [[], Validators.required],
    });

    this.dataForm = this.fb.group({
      data: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.getFrameworkCategoryNames();
    this.getAllControls();
    this.getAllDepartments();
    this.controlDisablityOfInputText('frameworkCategory', 'frameworkNames');

    this.dataService.selectedIds$.subscribe((ids) => {
      const data = ids;
      console.log('Received data:', data);

      this.initializeDataForm(data);
    });
  }

  initializeDataForm(data: Compliance[]) {
    const dataArray = this.dataForm.get('data') as FormArray;
    data.forEach((item, index) => {
      const formGroup = this.createDataFormGroup(item);
      this.getChecklistByControlId(item.controlName);
      dataArray.push(formGroup);
      this.setDepartment({ value: item.departments }, index);
    });

    console.log(dataArray);
  }
  createDataFormGroup(item: Compliance): FormGroup {
    const formGroup = this.fb.group({
      securityId: [item.securityId || ''],
      complianceId: [item.complianceId || ''],
      recordId: [item.recordId || ''],
      frameworkCategory: [item.frameworkCategory || ''],
      frameworkName: [item.frameworkName || ''],
      controlCategory: [item.controlCategory || ''],
      controlName: [item.controlName || ''],
      checklistName: [
        { value: item.checklistName || '', disabled: !!item.securityId },
      ],
      periodicity: [item.periodicity || ''],
      departments: [item.departments || []],
      evidence: [item.evidenceList || []],
      evidenceComments: [item.evidenceComments || ''],
      evidenceComplianceStatus: [item.evidenceComplianceStatus],
      eventDate: [item.eventDate || ''],
    });
    console.log('FormDAta :', formGroup.controls);

    return formGroup;
  }

  get rowData() {
    return (this.dataForm.get('data') as FormArray)?.controls;
  }

  getFrameworkCategoryNames() {
    this.complianceService.getAllFrameworkCateogry().subscribe({
      next: (res: FrameworkCategories[]) => {
        this.frameworkCategories = res;
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
          this.frameworkNames = res;
        },
        error: (err) => {
          console.error('Error fetching framework names:', err);
        },
      });
  }

  setFrameworkName(event: any) {
    const selected = event.value;
    this.form.patchValue({
      frameworkName: selected.frameworkName,
      complianceCalendar: `${selected.startDate} - ${selected.endDate}`,
    });

    this.minDate = this.convertStringToDate(selected.startDate);
    this.maxDate = this.convertStringToDate(selected.endDate);
  }

  getAllControls() {
    this.complianceService.getAllControls().subscribe({
      next: (res: ControlNames[]) => {
        this.controls = res;
      },
      error: (err) => {
        console.error('Error fetching control names:', err);
      },
    });
  }

  getChecklistByControlId(controlName: string) {
    this.complianceService.getChecklistByControlName(controlName).subscribe({
      next: (res: Checklist[]) => {
        this.checklistMap[controlName] = res;
        console.log(this.checklistMap);
      },
      error: (err) => {
        console.error('Error fetching checklists', err);
      },
    });
  }
  isPeriodicityOnEvent(event: any, index: number) {
    const dataArray = this.dataForm.get('data') as FormArray;
    const periodicityControl = dataArray.at(index)?.get('periodicity');
    const isOnEvent = event.value === 'OnEvent';
    console.log('selected -value :', periodicityControl);
    if (isOnEvent) {
      this.displayEventDateModal = true;
    } else {
      this.displayEventDateModal = false;
    }
    periodicityControl?.setValue(event.value);
  }

  setChecklist(event: any, index: number) {
    const dataArray = this.dataForm.get('data') as FormArray;
    const checklistControl = dataArray.at(index)?.get('checklistName');

    const selectedChecklists = event.value.map(
      (item: any) => item.controlChecklist
    );

    // Log the selected checklists for debugging
    console.log('Selected Checklists:', selectedChecklists);

    // Set the checklist control value based on the selected checklists
    checklistControl?.setValue(
      selectedChecklists.length > 0 ? selectedChecklists : null
    );
  }

  setDepartment(event: any, index: number) {
    console.log('Test Selected departments:', event.value);
    console.log('Index:', index);

    const dataArray = this.dataForm.get('data') as FormArray;
    const departmentControl = dataArray.at(index)?.get('departments');

    const selectedDepartments = event.value.length > 0 ? event.value : [];

    departmentControl?.setValue(selectedDepartments);
    console.log('Updated department control:', departmentControl?.value);
    // this.cd.detectChanges();
  }

  saveDate(event: Date) {
    this.eventDate = event;
  }
  submitEventDate() {
    this.displayEventDateModal = false;

    if (this.eventDate) {
      const formattedDate = this.formatDate(this.eventDate);
      (this.dataForm.get('data') as FormArray).controls.forEach((control) => {
        if (control.get('periodicity')?.value === 'OnEvent') {
          control.patchValue({ eventDate: formattedDate });
        }
      });
    }
  }

  getAllDepartments() {
    this.complianceService.getAllDepartments().subscribe({
      next: (res: Department[]) => {
        this.departments = Array.isArray(res)
          ? res.map((department) => department.departmentName)
          : [];
      },
      error: (err) => {
        console.error('Error fetching departments', err);
      },
    });
    console.log('helllo this is department', this.departments);
  }

  setEvidenceComplianceStatus(event: any, index: number) {
    console.log('Selected evidence compliance status:', event.value);
    console.log('Index:', index);

    const dataArray = this.dataForm.get('data') as FormArray;
    const evidenceComplianceStatusControl = dataArray
      .at(index)
      ?.get('evidenceComplianceStatus');

    evidenceComplianceStatusControl?.setValue(event.value);
  }

  addCompliance() {
    if (this.form.valid) {
      console.log('TD-1');
      const selectedControls = this.form.get('controls')?.value;
      console.log('hello this is controls', this.controls);

      selectedControls.forEach((control: ControlNames) => {
        this.getChecklistByControlId(control.controlName);
        let controlCategoryName = 'Unknown';
        if (control.controlCategory) {
          controlCategoryName = control.controlCategory.controlCategoryName;
        } else {
          console.log('Control Category is empty or undefined');
        }

        const newData = this.createDataFormGroup({
          securityId: '',
          complianceId: '',
          recordId: '',
          frameworkCategory:
            this.form.get('frameworkCategory')?.value.frameworkCategoryName,
          frameworkName: this.form.get('frameworkNames')?.value.frameworkName,
          controlCategory: controlCategoryName,
          controlName: control.controlName,
          checklistName: [],
          periodicity: '',
          departments: [],
          evidenceList: [],
          evidenceComments: '',
          evidenceComplianceStatus: true,
          eventDate: '',
        });
        (this.dataForm.get('data') as FormArray).push(newData);
        console.log(
          'New Data Form Array:',
          (this.dataForm.get('data') as FormArray).controls
        );
        // Update the checklistMap with the new checklists for each control
        this.checklistMap[control.controlName] = [];
        this.complianceService
          .getChecklistByControlName(control.controlName)
          .subscribe({
            next: (res: Checklist[]) => {
              this.checklistMap[control.controlName] = res;
              console.log(this.checklistMap);
            },
            error: (err) => {
              console.error('Error fetching checklists', err);
            },
          });
      });
      this.toastr.success('Compliance added successfully!');
      this.activateLoading();
      // this.resetForm();
    } else {
      this.toastr.error('Please select all required fields.');
    }
  }

  activateLoading() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  resetForm() {
    this.form.reset();
    const multiSelect = document.querySelector('p-multiSelect');
    console.log(multiSelect);
  }
  resetTable() {
    const dataArray = this.dataForm.get('data') as FormArray;
    while (dataArray.length !== 0) {
      dataArray.removeAt(0);
    }
  }

  submitSuccess() {
    if (this.dataForm.valid) {
      this.loading = true;

      // Get the raw form value, including disabled controls
      const formData = (this.dataForm.get('data') as FormArray).controls.map(
        (control) => {
          const rawValue = (control as FormGroup).getRawValue();

          // Ensure checklistName is always an array
          if (rawValue.checklistName) {
            rawValue.checklistName = Array.isArray(rawValue.checklistName)
              ? rawValue.checklistName
              : [rawValue.checklistName];
          } else {
            rawValue.checklistName = [];
          }

          // Convert department names to the format accepted by the backend
          if (rawValue.departments) {
            rawValue.departments = rawValue.departments.map(
              (department: string) =>
                this.convertDepartmentToBackendFormat(department)
            );
          }

          return rawValue;
        }
      );

      console.log('Form data to be submitted:', formData);

      this.complianceService.addNewCompliance(formData).subscribe({
        next: (res: any) => {
          this.toastr.success('Form submitted successfully!');
          this.loading = false;
          this.router.navigateByUrl('/security-compliance');
        },
        error: (error) => {
          this.loading = false;
          /* this.toastr.error('Error while adding/updating', error); */
          // Check if error response has specific structure from backend
          if (error?.error && error.error.message) {
            // Display the error message from the backend
            this.toastr.error(error.error.message, 'Error');
          } else if (error?.error && error.error.errorTag) {
            // Optionally, use the error tag to show a specific message or handle it differently
            this.toastr.error(`Error: ${error.error.errorTag}`, 'Error');
          } else {
            // Fallback if no specific message or tag is provided
            this.toastr.error(
              'Error while adding/updating. Please try again.',
              'Error'
            );
          }
        },
      });
    } else {
      this.loading = false;
      this.toastr.error('Please fill all required fields.');
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
  // Helper methods
  convertStringToDate(dateStr: string): Date {
    const [monthStr, yearStr] = dateStr.split(' ');
    const month = new Date(Date.parse(monthStr + ' 1, ' + yearStr)).getMonth();
    const year = parseInt(yearStr);
    return new Date(year, month, 1);
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'MMMM yyyy') || '';
  }

  controlDisablityOfInputText(parent: string, child: string) {
    this.form.get(parent)?.valueChanges.subscribe((val) => {
      console.log(val);

      if (val) {
        this.getFrameworkNames(val.frameworkCategoryName);
        this.form.get(child)?.enable();
      } else {
        this.form.get(child)?.disable();
      }
    });
  }
  setRowColor(rowIndex: number, color: string) {
    console.log(rowIndex);
    const row = document.getElementById(`row-${rowIndex}`);
    console.log(row);

    if (row) {
      row.style.backgroundColor = color;
    }
  }
  onFieldChange(rowIndex: number) {
    const dataArray = this.dataForm.get('data') as FormArray;
    const rowControl = dataArray.at(rowIndex) as FormGroup;
    const rawValue = rowControl.getRawValue();

    console.log('rowData :', rawValue);
    this.setRowColor(rowIndex, '');

    // Ensure checklistName is always an array
    if (rawValue.checklistName) {
      rawValue.checklistName = Array.isArray(rawValue.checklistName)
        ? rawValue.checklistName
        : [rawValue.checklistName];
    } else {
      rawValue.checklistName = [];
    }

    // Set periodicity to "Annually" if it's empty or null
    if (!rawValue.periodicity) {
      rawValue.periodicity = 'Annually';
      rowControl.get('periodicity')?.setValue('Annually');
    }

    if (
      rawValue.periodicity &&
      rawValue.checklistName &&
      rawValue.checklistName.length > 0
    ) {
      const requestBody = {
        framework: rawValue.frameworkName,
        control: rawValue.controlName,
        periodicity: rawValue.periodicity,
        checklist: rawValue.checklistName,
        // evidenceComplianceStatus: true,
      };
      console.log('requestBody :', requestBody);
      this.complianceService.checkComplianceExists(requestBody).subscribe({
        next: (res: boolean) => {
          if (res) {
            console.log('Compliance already exists!');
            this.toastr.error('Compliance already exists!');
            this.setRowColor(rowIndex, '#FFACAC');
            // this.isComplianceValid = false;
          }
          this.checkAllRowsForDuplicates();
        },
        error: (error) => {
          this.toastr.error('Error while checking compliance', error);
          this.setRowColor(rowIndex, ''); // Reset to default color
          // this.isComplianceValid = false;
          this.checkAllRowsForDuplicates();
        },
      });
    } else {
      console.warn(
        'Periodicity and checklist must be set before checking compliance'
      );
      this.setRowColor(rowIndex, ''); // Reset to default color if conditions are not met
      // this.isComplianceValid = false;
      this.checkAllRowsForDuplicates();
    }
  }
  getChecklistPlaceholder(rowData: FormGroup): string {
    let checklistValue = rowData.get('checklistName')?.value;

    if (typeof checklistValue === 'string') {
      checklistValue = [checklistValue];
    }
    if (
      checklistValue &&
      Array.isArray(checklistValue) &&
      checklistValue.length > 0
    ) {
      return checklistValue.join(',');
    }
    return 'Select Checklist';
  }

  getDepartmentPlaceholder(rowData: FormGroup): string {
    const departmentValue = rowData.get('departments')?.value;
    if (
      departmentValue &&
      Array.isArray(departmentValue) &&
      departmentValue.length > 0
    ) {
      return departmentValue.join(', ');
    }
    return 'Select Department';
  }
  checkAllRowsForDuplicates() {
    const dataArray = this.dataForm.get('data') as FormArray;
    let hasDuplicates = false;

    for (let i = 0; i < dataArray.length; i++) {
      const rowControl = dataArray.at(i) as FormGroup;
      const rawValue = rowControl.getRawValue();
      console.log('rowValue :', rawValue);
      if (
        rawValue.checklistName &&
        rawValue.checklistName.length > 0 &&
        this.getRowColor(i) === 'rgb(255, 172, 172)'
      ) {
        hasDuplicates = true;
        break;
      }
    }
    this.isComplianceValid = !hasDuplicates;
  }

  getRowColor(rowIndex: number): string {
    const row = document.getElementById(`row-${rowIndex}`);
    return row ? row.style.backgroundColor : '';
  }

  clearChecklist(index: number) {
    const dataArray = this.dataForm.get('data') as FormArray;
    const rowData = dataArray.at(index);

    rowData.get('checklistName')?.setValue([]);
    rowData.get('checklistName')?.markAsDirty();
  }

  clearDepartment(index: number) {
    const dataArray = this.dataForm.get('data') as FormArray;
    const rowData = dataArray.at(index);

    rowData.get('departments')?.setValue([]);
    rowData.get('departments')?.markAsDirty();
  }
}
