import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { ComplianceService } from '../../services/complianceService/compliance.service';
import { Checklist, Compliance, ComplianceResponse, ControlCategory, ControlNames, Department, FrameworkCategories, FrameworkNames } from '../../models/compliance';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../services/data/data.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-security-complaince',
  standalone: true,
  imports: [CommonModule,DropdownModule,TableModule,CalendarModule,DialogModule,ButtonModule,RouterLink,CheckboxModule,ReactiveFormsModule,FormsModule,ProgressSpinnerModule],
  templateUrl: './security-complaince.component.html',
  styleUrl: './security-complaince.component.scss',
  providers: [DatePipe]
})
export class SecurityComplainceComponent {


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form! : FormGroup;
  frameworkCategories !: FrameworkCategories[];
  frameworkNames! :FrameworkNames[];
  controlCategories! :ControlCategory[];
  controls! :ControlNames[];
  complianceChecklists! :Checklist[];
  departments! :Department[];
  evidenceStatuses! :any[];
  statuses! :any[];
  monthYearFormat = 'MM, yy';
  today = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(/\s+/g, ', ');
  // yearstartDate = new Date(new Date().getFullYear(), 0, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(/\s+/g, ', ');
;
  data! :Compliance[]
  loading:boolean=false;
  selectedIds!: Compliance;
 
  displayEvidenceModal: boolean = false;
  displayUploadEvidenceModal:boolean = false;
  currentEvidenceImg! : string;
  selectedFiles: File[] = [];
  maxSizeMB :number = 50;
  imagePreviews: string[] = [];
  evidenceUploadId! :string;
  isFrameworkNameDisabled: boolean = true;
 
  rows: number =10;
  first:number = 0;
  totalRecords:number =0;
  
  role!:string;
  appliedFilters ={};
  checkListName!:string;
  selectedComplianceIds:Set<string> = new Set();
  selecteddata:any[] =[];
  selectedUrl:SafeResourceUrl | null = null;;
  selectedBlob!:any;
  minDate!: Date;

  evidencename:any;
  
  constructor(private fb : FormBuilder, private toastr: ToastrService, private router: Router, private complianceService : ComplianceService , private datePipe : DatePipe, private cd:ChangeDetectorRef,private dataService: DataService,private sanitizer: DomSanitizer){
    this.form = this.fb.group({
      frameworkCategory: '',
      frameworkName: '' ,
      controlCategory:'',
      control:'',
      complianceChecklist:'',
      Department:'',
      EvidenceStatus:'',
      Status:'',
      calendarFrom:'',
      calendarTo:''
    });
    
  }
  
  ngOnInit(){
    this.getUserType();
    this.selecteddata=[]
    this.getFrameworkCateogaryNames();
    this.getControlCategoaryNames();
    this.getAllDepartments();
    this.evidenceStatuses = [
      {name: 'All',value:null},
      { name: 'Completed',value:'Completed'},
      {name: 'Pending', value:'Pending'}
    ]
    this.statuses = [
  { name: 'Active', value: true },
  { name: 'Inactive', value: false }
    ];
    
    this.form = new FormGroup({
      frameworkCategory: new FormControl(null),
      frameworkName: new FormControl({value: null , disabled: true}),
      controlCategory: new FormControl(null),
      control: new FormControl({value: null , disabled: true}),
      complianceChecklist: new FormControl({value: null , disabled: true}),
      Department: new FormControl(null),
      EvidenceStatus: new FormControl(this.evidenceStatuses[0]),
      Status: new FormControl(this.statuses[0]),
      calendarFrom: new FormControl(this.today),
      calendarTo: new FormControl(this.today)
    });

    this.controlDisablityOfInputText('frameworkCategory','frameworkName');
    this.controlDisablityOfInputText('controlCategory','control');
    this.controlDisablityOfInputText('control','complianceChecklist');

    this.form.get('calendarFrom')?.valueChanges.subscribe((selectedDate) => {
      this.minDate = selectedDate;
      this.checkDateOrder();
    });

    this.form.get('calendarTo')?.valueChanges.subscribe(() => {
      this.checkDateOrder();
    });
}

getUserType(){
  this.role = sessionStorage.getItem('role')|| '';
  
}

isAdmin():boolean{
  
  return this.role === 'Admin';
}
isUploader():boolean{
  return this.role === 'Uploader';
}

loadData(event?: TableLazyLoadEvent,filters?:any) {
  console.log(event);
   let sortField = event?.sortField ?? 'creationTime';  
  let sortOrder = event?.sortOrder === 1 ? 'asc' : 'desc';
  let page =event? Math.floor(event.first! / event.rows!):0 ;
  let size = event? event.rows:this.rows;
  this.appliedFilters = filters || this.appliedFilters;
  console.log(page,size);
  this.complianceService.getSecurityComplianceList(page, size,sortField,
    sortOrder, this.appliedFilters).subscribe({
    next: (res: ComplianceResponse) => {
      // console.log('data response',res);
	
      this.data = res.content;
      this.rows = res.pageSize;
      this.totalRecords = res.totalElements;
      this.first = event ? event.first! : 0;
      console.log("this is data",this.data)
      // console.log("This is selected data",this.selecteddata);

      this.cd.detectChanges();
    },
    error: (err) => {
      console.error('Error fetching compliance data:', err);
      
    }
  });
}
  
formatDate(date: Date): string {
  return this.datePipe.transform(date, 'MMMM yyyy') || '';
}
  
getFrameworkCateogaryNames(){
  this.complianceService.getAllFrameworkCateogry().subscribe({next:(res: FrameworkCategories[])=>{
    this.frameworkCategories = res;
    // console.log(res);
  },
  error:(err) => {
    console.error('Error fetching framework categories:', err);
  }});
}
 
  getFrameworkNames(_frameworkCategoryName:string){
    this.complianceService.getFrameworkNameByFrameworkCateogary(_frameworkCategoryName).subscribe({next:(res: FrameworkNames[])=>{
      // console.log(res);
      this.frameworkNames = res;
    },
    error:(err) => {
      console.error('Error fetching framework names:', err);
    }})

  }


  getControlCategoaryNames(){
    this.complianceService.getAllControlCategory().subscribe({next:(res:ControlCategory[])=>{
      // console.log(res);
      this.controlCategories = res;
    },
  error:(err)=>{
    console.error('Error fetching control cateogaries',err); 
  }})
  }

  getControlNames(_controlCategoryName:string){
    this.complianceService.getControlNameByControlCateogary(_controlCategoryName).subscribe({next:(res:ControlNames[])=>{
      
      this.controls = res;
      // console.log(this.controls);
    },
    error:(err)=>{
      console.error('Error fetching control names',err);
    }
  })
  }

  getAllDepartments(){
    this.complianceService.getAllDepartments().subscribe({next:(res:Department[])=>{
      this.departments = res;
    },
  error:(err)=>{
    console.error('Error fetching department names',err);
  }})
  }

  getChecklistByControlId(_controlName:string){
    this.complianceService.getChecklistByControlName(_controlName).subscribe({next:(res:Checklist[])=>{
      // console.log(res);
      
      this.complianceChecklists = res;
    },
    error:(err)=>{
      console.error('Error fetching checklists',err);
      
    }})
  }

  
  

  controlDisablityOfInputText(parent: string, child: string) {
    this.form.get(parent)?.valueChanges.subscribe((val) => {
      if (val) {
        this.form.get(child)?.enable();
  
        if (parent === "frameworkCategory") {

          console.log(val.frameworkCategoryName);
          this.getFrameworkNames(val.frameworkCategoryName);
        } else if (parent === "controlCategory") {
          
          this.getControlNames(val.controlCategoryName);
        } else if (parent === "control") {
          console.log(val.controlName);
          
          this.getChecklistByControlId(val.controlName);
        }
      } else {
        this.form.get(child)?.disable();
      }
    });
  }

  searchFilter(){
    let calendarFrom = this.form.value.calendarFrom;
    let calendarTo = this.form.value.calendarTo;
    let searchFilterVal = {
      frameworkCategory: this.form.value.frameworkCategory,
      frameworkName: this.form.value.frameworkName,
      controlCategory:this.form.value.controlCategory,
      control:this.form.value.control,
      complianceChecklist:this.form.value.complianceChecklist,
      Department:this.form.value.Department,
      EvidenceStatus:this.form.value.EvidenceStatus.value,
      Status:this.form.value.Status.value,
      calendarFrom:this.form.value.calendarFrom  ? this.formatDate(calendarFrom) : '',
      calendarTo:this.form.value.calendarTo ? this.formatDate(calendarTo) : ''
    }
    console.log('filter search',searchFilterVal);
    this.appliedFilters = searchFilterVal;
    this.loadData(undefined,searchFilterVal);
  }

  exportToExcel() {
    this.complianceService.exportExcelRequest().subscribe({next:(res:Blob)=>{
      const excelUrl: string = URL.createObjectURL(res);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = excelUrl;
      a.download = 'export.xlsx';
      document.body.appendChild(a); 
      a.click();
      document.body.removeChild(a); 
      URL.revokeObjectURL(excelUrl);
    }})
  }

  exportToPDF() {
    const element = document.querySelector('.table-responsive') as HTMLElement;
  
    if (element) {
      html2canvas(element, { scale: 2 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
  
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save('export.pdf');
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
          this.selectedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(res));
          this.loading = false;
          console.log('Loading stopped:', this.loading);
          this.displayEvidenceModal = true;
        },
        error: (error) => {
          this.loading = false;
          this.toastr.error('Error fetching evidence');
        }
      });
    } else {
      this.toastr.error('No evidence exists');
    }
  }

  downloadEvidence(){
    console.log(this.evidencename);
    
   if(this.evidencename){
    this.loading = true;
    this.complianceService.getEvidenceView(this.evidencename).subscribe({next:(res: Blob)=>{
      const blobUrl = URL.createObjectURL(res);
      const sanitizedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
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
    }});
  }
  else{
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

//   isAudio(): boolean {
//     console.log("is mp3 check",this.selectedBlob?.type.startsWith('audio/mp3'));
    
//     return this.selectedBlob?.type.startsWith("During check",'audio/mp3');
// }

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

      console.log(evidenceData)
      this.complianceService.uploadEvidence(evidenceData,this.evidenceUploadId , this.checkListName).subscribe({next:(res:any)=>{
        console.log(res);
        this.loadData(undefined)
        this.selectedFiles = [];
        this.closeDialog()
        this.loading = false;
      },
    error:(err)=>{
      console.log(err);
      
      this.toastr.error(err);
      
    }})
    
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
isaudio(file:File): boolean{
  console.log("duering upload",file.type === 'audio/mp3');
  
  return file.type === 'audio/mp3';
}



onFileSelectedOrDropped(file: File) {
  if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.toastr.error(`File size exceeds the ${this.maxSizeMB}MB limit. Please select a smaller file.`);
  } else {
      this.selectedFiles.push(file);
      this.toastr.success(`Selected file: ${file.name}`);
      const reader = new FileReader();
      reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
  }
  console.log(this.selectedFiles)
}

onFileInput(event:any){
  const files: FileList = event.target.files;
  if (files) {
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          this.onFileSelectedOrDropped(file);
      }
  }
}

onDrop(event:DragEvent){
  event.preventDefault();
  if (event.dataTransfer && event.dataTransfer.files) {
      const files = Array.from(event.dataTransfer.files);
      files.forEach(file => this.onFileSelectedOrDropped(file));
  }
}

  triggerFileInput(){
    this.fileInput.nativeElement.click();
  }
  cancelUpload(){
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.toastr.info('File upload Canceled')
  }
  onDragOver(event:DragEvent){
    event.preventDefault();
  }
  onDragLeave(event:DragEvent){

  }
  closeDialog(){
    if(this.displayUploadEvidenceModal == true){
    this.displayUploadEvidenceModal=false;}
    else{
      this.displayEvidenceModal = false;
    }
    this.loadData()
  }
  removeFile(index: number){
    const removedFile = this.selectedFiles.splice(index, 1)[0];
    this.imagePreviews.splice(index, 1);
    console.log(this.selectedFiles)
    this.toastr.info(`Removed file: ${removedFile.name}`);
    this.fileInput.nativeElement.value = '';
  }


  navigateToAddEditPage() {
    console.log(this.selecteddata);
    // this.selectedComplianceIds =  new Set<string>(this.selecteddata.map(item => item.complianceId).filter(id => id));
    // console.log("hello selected data",this.selectedComplianceIds);
    
    this.dataService.updateSelectedIds(Array.from(this.selecteddata))
    this.router.navigate(['/security-compliance-add-edit']);
  }



  onCancel(){
    this.selecteddata = [];
    this.selectedComplianceIds.clear();
  }

  onReset(){
    this.form.get('frameworkCategory')!.setValue(null);
    this.form.get('frameworkName')!.setValue({ value: null, disabled: true });
    this.form.get('controlCategory')!.setValue(null);
    this.form.get('control')!.setValue({ value: null, disabled: true });
    this.form.get('complianceChecklist')!.setValue({ value: null, disabled: true });
    this.form.get('Department')!.setValue(null);
    this.form.get('EvidenceStatus')!.setValue(this.evidenceStatuses[0]);
    this.form.get('Status')!.setValue(this.statuses[0]); 
    this.form.get('calendarTo')!.setValue(null);
  this.selecteddata = [];
  this.selectedComplianceIds.clear();
  }

  checkDateOrder(): void {
    const fromDate = this.form.get('calendarFrom')?.value;
    const toDate = this.form.get('calendarTo')?.value;

    if (fromDate && toDate && fromDate > toDate) {
   
      this.form.get('calendarFrom')?.setValue(null); 
      this.toastr.error('"Calendar From date" cannot be greater than the "Calendar To date". Please select a valid range.'); 
    }
  }

  getEvidenceOptions(evidenceList: any[]): { label: string, value: any }[] {
    return evidenceList.map((ev, i) => ({
      label: 'Evidence ' + (i + 1),
      value: ev
    }));
  }

  
//   onSort(event: SortEvent) {
//     const { field, order } = event;

//     // Check if field or order is undefined
//     if (!field || typeof order === 'undefined') {
//         return; // Exit if we cannot sort
//     }

//     this.data.sort((data1, data2) => {
//       const fieldName = field as keyof Compliance; // Ensures the field is a key of Compliance
//       let value1 = data1[fieldName];
//       let value2 = data2[fieldName];

//       if (typeof value1 === 'string' && typeof value2 === 'string') {
//           return (value1 < value2 ? -1 : (value1 > value2 ? 1 : 0)) * order;
//       } else if (typeof value1 === 'number' && typeof value2 === 'number') {
//           return (value1 - value2) * order;
//       } else {
//           return 0; // Handle cases with mixed or undefined types
//       }
//   });
// }


}



