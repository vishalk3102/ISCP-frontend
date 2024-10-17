import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import {
  FrameworkCategories,
  FrameworkNames,
} from '../../../models/compliance';
import { ToastrService } from 'ngx-toastr';
import { ComplianceService } from '../../../services/complianceService/compliance.service';
import { FrameworkService } from '../../../services/master/framework/framework.service';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-framework',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    TableModule,
    CalendarModule,
    ReactiveFormsModule,
    ProgressSpinnerModule,
    InputTextModule,
    CheckboxModule,
    FormsModule,
  ],
  templateUrl: './framework.component.html',
  styleUrl: './framework.component.scss',
  providers: [DatePipe],
})
export class FrameworkComponent {
  form!: FormGroup;
  frameworkCategories!: FrameworkCategories[];
  frameworkNames!: FrameworkNames[];
  statuses!: any[];
  monthYearFormat = 'MM, yy';
  today = new Date()
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })
    .replace(/\s+/g, ', ');
  yearstartDate = new Date(new Date().getFullYear(), 0, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })
    .replace(/\s+/g, ', ');
  loading: boolean = false;
  rows: number = 10;
  first: number = 0;
  totalRecords: number = 0;
  data: any;
  appliedFilters = {};
  minDate!: Date;
  selecteddata: any;

  frameworkForm: FormGroup;
  editingRows: { [key: number]: boolean } = {};
  isEditingControl: FormControl;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private complianceService: ComplianceService,
    private datePipe: DatePipe,
    private frameworkService: FrameworkService,
    private cd: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      frameworkCategory: '',
      frameworkName: '',
      Status: '',
      calendarFrom: '',
      calendarTo: '',
    });

    this.frameworkForm = this.fb.group({
      frameworkCategory: [''],
      frameworkName: [''],
      description: [''],
    });
    this.isEditingControl = new FormControl(false);
  }

  ngOnInit() {
    this.statuses = [
      { name: 'All', value: null },
      { name: 'Active', value: true },
      { name: 'Inactive', value: false },
    ];

    this.getFrameworkCateogaryNames();

    this.form = new FormGroup({
      frameworkCategory: new FormControl(null),
      frameworkName: new FormControl({ value: null, disabled: true }),
      Status: new FormControl(this.statuses[0]),
      calendarFrom: new FormControl(null),
      calendarTo: new FormControl(null),
    });

    this.controlDisablityOfInputText('frameworkCategory', 'frameworkName');

    this.form.get('calendarFrom')?.valueChanges.subscribe((selectedDate) => {
      this.minDate = selectedDate;
      this.checkDateOrder();
    });

    this.form.get('calendarTo')?.valueChanges.subscribe(() => {
      this.checkDateOrder();
    });
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

  controlDisablityOfInputText(parent: string, child: string) {
    this.form.get(parent)?.valueChanges.subscribe((val) => {
      if (val) {
        this.form.get(child)?.enable();
        console.log(val.frameworkCategoryName);
        this.getFrameworkNames(val.frameworkCategoryName);
      }
    });
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

  searchFilter() {
    let calendarFrom = this.form.value.calendarFrom;
    let calendarTo = this.form.value.calendarTo;
    let searchFilterVal = {
      frameworkCategory: this.form.value.frameworkCategory,
      frameworkName: this.form.value.frameworkName,
      Status: this.form.value.Status.value,
      calendarFrom: this.form.value.calendarFrom
        ? this.formatDate(calendarFrom)
        : '',
      calendarTo: this.form.value.calendarTo ? this.formatDate(calendarTo) : '',
    };
    console.log('filter search', searchFilterVal);
    this.appliedFilters = searchFilterVal;
    this.loadData(undefined, searchFilterVal);
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'MMMM yyyy') || '';
  }

  loadData(event?: TableLazyLoadEvent, filters?: any) {
    console.log(event);

    let page = event ? Math.floor(event.first! / event.rows!) : 0;
    let size = event ? event.rows : this.rows;
    this.appliedFilters = filters || this.appliedFilters;
    console.log(page, size);
    this.frameworkService
      .getFrameworksPaginated(page, size, this.appliedFilters)
      .subscribe({
        next: (res: any) => {
          this.data = res.content;
          this.rows = res.pageSize;
          this.totalRecords = res.totalElements;
          this.first = event ? event.first! : 0;
          console.log('this is data', this.data);
          // console.log("This is selected data",this.selecteddata);

          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching compliance data:', err);
        },
      });
  }

  toggleEdit() {
    // Logic to toggle editing state
    if (this.isEditingControl.value) {
      // Do something if editing is enabled
    } else {
      this.frameworkForm.reset(); // Clear the form when not editing
    }
  }
  // toggleEdit(rowData: any) {
  //   rowData.editing = !rowData.editing;
  //   if (!rowData.editing) {
  //     this.saveChanges(rowData);
  //   }
  // }
  saveChanges(rowData: any) {
    const newFramework = this.frameworkForm.value;
    // Add the new framework logic (e.g., push to data array or call an API)
    console.log(newFramework);
    this.frameworkForm.reset(); // Reset the form after adding
  }
}
