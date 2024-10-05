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
import {  FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ProgressSpinnerModule
  ],
  templateUrl: './security-complaince-add-edit.component.html',
  styleUrl: './security-complaince-add-edit.component.scss',
  providers: [DatePipe]
})
export class SecurityComplainceAddEditComponent {
  form: FormGroup;
  dataForm: FormGroup;
  departments:string[] = [];
  controls: ControlNames[] = [];
  periodicities: Periodicities[] = [
    { name: 'Bi Annually' ,value:'Bi_Annually'},
    { name: 'Annually' , value: 'Annually'},
    { name: 'Quarterly' ,value:'Quarterly'},
    { name: 'Monthly',value:'Monthly' },
    { name: 'On Event',value:'OnEvent' },
  ];
  
  frameworkCategories: FrameworkCategories[] = [];
  frameworkNames: FrameworkNames[] = [];
  checklistMap: { [controlName: string]: Checklist[] } = {};
  
  displayEventDateModal = false;
  monthYearFormat = 'MM, yy';
  minDate!: Date;
  maxDate!: Date;
  eventDate: Date | null = null;
  loading:boolean= false;
 statuses = [
    { name: 'Active', value: true },
    { name: 'Inactive', value: false }
      ];
      dropdownClosed = true; 

      selectedChecklistData: { index: number; selectedChecklists: string[] } | null = null;
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
      data: this.fb.array([])
    });
  }

  ngOnInit() {
    this.getFrameworkCategoryNames();
    this.getAllControls();
    this.getAllDepartments();
    this.controlDisablityOfInputText('frameworkCategory','frameworkNames');
    this.dataService.selectedIds$.subscribe((ids) => {
      const data = ids;
      console.log('Received data:', data);
      this.initializeDataForm(data);
    });


  }


 


  initializeDataForm(data: Compliance[]) {
    const dataArray = this.dataForm.get('data') as FormArray;
    data.forEach((item,index) => {
      // dataArray.push(this.createDataFormGroup(item));
      const formGroup = this.createDataFormGroup(item);
      this.getChecklistByControlId(item.controlName);
      // console.log('Departments to patch:', item.departments);
      // console.log('Current formGroup before patch:', formGroup.value);

      dataArray.push(formGroup);
      
      console.log("helllo this is department after init",formGroup.value.departments);
      this.setDepartment({value:item.departments},index)
    });
    
    console.log(dataArray);
    
  }
 
  

  createDataFormGroup(item: Compliance): FormGroup {
    return this.fb.group({
        securityId: [item.securityId || ''],
        complianceId: [item.complianceId || ''],
        recordId: [item.recordId || ''],
        frameworkCategory: [item.frameworkCategory || ''],
        frameworkName: [item.frameworkName || ''],
        controlCategory: [item.controlCategory || ''],
        controlName: [item.controlName || ''],
        checklistName: [item.checklistName || ''],
        periodicity: [item.periodicity || ''],
        departments: [item.departments || []],
        evidence: [item.evidenceList || []],
        evidenceComments: [item.evidenceComments || ''],
        evidenceComplianceStatus: [item.evidenceComplianceStatus],
        eventDate: [item.eventDate || '']
    });
    
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
      }
    });
  }

  getFrameworkNames(_frameworkCategoryName:string) {
    this.complianceService.getFrameworkNameByFrameworkCateogary(_frameworkCategoryName).subscribe({
      next: (res: FrameworkNames[]) => {
        this.frameworkNames = res;
      },
      error: (err) => {
        console.error('Error fetching framework names:', err);
      }
    });
  }

  setFrameworkName(event: any) {
    const selected = event.value;
    this.form.patchValue({ 
      frameworkName: selected.frameworkName,
      complianceCalendar: `${selected.startDate} - ${selected.endDate}`
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
      }
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
      }
    });
  }
  isPeriodicityOnEvent(event: any, index: number) {
    const dataArray = this.dataForm.get('data') as FormArray; 
    const periodicityControl = dataArray.at(index)?.get('periodicity');
    const isOnEvent = event.value === 'OnEvent';
    
    if (isOnEvent) {
      this.displayEventDateModal = true;
    } else {
      this.displayEventDateModal = false;
    }
    periodicityControl?.setValue(event.value);
  }

  setChecklist(event:any , index :number){
    const dataArray = this.dataForm.get('data') as FormArray;
    const checklistControl = dataArray.at(index)?.get('checklistName');
    // const fname = dataArray.at(index)?.get('frameworkName')?.value;
    // const cname = dataArray.at(index)?.get('controlName')?.value;
    const selectedChecklists = event.value.map((item: any) => item.controlChecklist);
    console.log(encodeURIComponent(selectedChecklists));
    // console.log("helllloooo",fname,cname,selectedChecklists);
    if (selectedChecklists.length === 0) {
      checklistControl?.setValue([]);
    } else {
      checklistControl?.setValue(selectedChecklists);
    }
  
  }

 




// ngDoCheck() {
//   console.log('Change detection triggered');
// }

  setDepartment(event: any, index: number) {
    console.log('Selected departments:', event.value);
    console.log('Index:', index);
    
    const dataArray = this.dataForm.get('data') as FormArray;
    const departmentControl = dataArray.at(index)?.get('departments');
    
    
    const selectedDepartments = event.value.length > 0 
        ? event.value 
        : []; 

    departmentControl?.setValue(selectedDepartments);
    // this.cd.detectChanges();
    
}

  saveDate(event: Date) {
    this.eventDate = event;
  }
  submitEventDate() {
    this.displayEventDateModal = false;
    
    if (this.eventDate) {
      const formattedDate = this.formatDate(this.eventDate);
      (this.dataForm.get('data') as FormArray).controls.forEach(control => {
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
                ? res.map(department => department.departmentName) 
                : [];
        },
        error: (err) => {
            console.error('Error fetching departments', err);
        }
    });
    console.log("helllo this is department",this.departments);
    
}

setEvidenceComplianceStatus(event: any, index: number) {
  console.log('Selected evidence compliance status:', event.value);
  console.log('Index:', index);
  
  const dataArray = this.dataForm.get('data') as FormArray;
  const evidenceComplianceStatusControl = dataArray.at(index)?.get('evidenceComplianceStatus');
  
  evidenceComplianceStatusControl?.setValue(event.value);
}


  addCompliance() {
  if (this.form.valid) {
    
    const selectedControls = this.form.get('controls')?.value;
    console.log("hello this is controls",this.controls);
    
    selectedControls.forEach((control: ControlNames) => {
      
      this.getChecklistByControlId(control.controlName);
      // const controlCategoryName = control.controlCategory[0]?.controlCategoryName || 'Unknown';
      let controlCategoryName = 'Unknown';
      if (control.controlCategory) {
        controlCategoryName = control.controlCategory.controlCategoryName;
        // console.log('Found Control Category Name:', controlCategoryName);
      } else {
        console.log('Control Category is empty or undefined');
      }
      
      
      const newData = this.createDataFormGroup({
        securityId: '',
        complianceId: '',
        recordId: '',
        frameworkCategory: this.form.get('frameworkCategory')?.value.frameworkCategoryName,
        frameworkName: this.form.get('frameworkNames')?.value.frameworkName,
        controlCategory: controlCategoryName,
        controlName: control.controlName,
        checklistName: [],
        periodicity: '',
        departments: [],
        evidenceList: [],
        evidenceComments: '',
        evidenceComplianceStatus: true,
        eventDate: ''
      });
      (this.dataForm.get('data') as FormArray).push(newData);
      console.log('New Data Form Array:', (this.dataForm.get('data') as FormArray).controls);
      // Update the checklistMap with the new checklists for each control
      this.checklistMap[control.controlName] = [];
      this.complianceService.getChecklistByControlName(control.controlName).subscribe({
        next: (res: Checklist[]) => {
          this.checklistMap[control.controlName] = res;
          console.log(this.checklistMap);
        },
        error: (err) => {
          console.error('Error fetching checklists', err);
        }
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

  }
  resetTable(){
    const dataArray = this.dataForm.get('data') as FormArray;
    while (dataArray.length !== 0) {
      dataArray.removeAt(0);
    }
    
  }

  submitSuccess() {
    if (this.dataForm.valid) {
      this.loading = true;
      console.log(this.dataForm.value.data);
      this.complianceService.addNewCompliance(this.dataForm.value.data).subscribe({next:(res:any)=>{
        this.toastr.success('Form submitted successfully!');
        this.loading = false;
        this.router.navigateByUrl('/security-compliance')
      },
    error:(error)=>{
      this.loading = false;
      this.toastr.error('Error while adding/updating',error);
      
    }})
      
    } else {
      this.loading = false;
      this.toastr.error('Please fill all required fields.');
    }
  }

  // Helper methods
  convertStringToDate(dateStr: string): Date {
    const [monthStr, yearStr] = dateStr.split(' ');
    const month = new Date(Date.parse(monthStr + " 1, " + yearStr)).getMonth();
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
        this.getFrameworkNames(val.frameworkCategoryName)
        this.form.get(child)?.enable();
      } else {
        this.form.get(child)?.disable();
      }
    });
  }

  
}

