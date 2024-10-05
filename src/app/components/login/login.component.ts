import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth/authService/auth.service';
import { Router } from '@angular/router';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgxCaptchaModule,ReactiveFormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  LoginForm! : FormGroup;
  siteKey! : string;
  captchaSubmit :boolean = false;
  errorMessage! :string;
  messages! :any[]

  constructor(private toastr: ToastrService,private fb: FormBuilder, private authService: AuthService, private router: Router){}

  ngOnInit(){

     
    this.LoginForm = this.fb.group({
      username:['',[Validators.required,this.emailDomainValidator()]],
      password:['',[Validators.required,Validators.minLength(4), Validators.maxLength(40)]],
      recaptcha:['']
    })
    this.siteKey = environment.SITE_KEY;
  }
  
  get loginForm(): { [key: string]: AbstractControl } {
    return this.LoginForm.controls;
  }

  emailDomainValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const email: string = control.value;
      if (email && (email.endsWith('contata.com') || email.endsWith('contata.in'))) {
        return null; 
      }
      return { 'emailDomain': true };  
    };
  }

  onSubmit(){
    if(this.LoginForm.invalid){
      Object.values(this.LoginForm.controls).forEach(control => control.markAsTouched());
    }
    console.log(this.LoginForm);
    this.authService.login({
      username: this.LoginForm.value.username,
      password: this.LoginForm.value.password
    }).subscribe({next:(res)=>{
      console.log("Sucess Login");
      this.router.navigateByUrl('/security-compliance')
    }, error:(error) => {
      if (error.status === 401) {
        this.errorMessage = 'Bad Credentials.';
        this.toastr.error(this.errorMessage);
      } 
      
      else {
        this.errorMessage = 'An unexpected error occurred.';
        this.toastr.error(this.errorMessage);
      }}});
  }

  onRecaptchaResolved(token:any){
    console.log(token);
    this.LoginForm.patchValue({ recaptcha: token });
  }

  handleCaptchaError(error:any){
    console.error(error);
    
  }
  
}
