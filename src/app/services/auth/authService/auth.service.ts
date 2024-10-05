import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {  Router } from '@angular/router';
import { EMPTY, Observable, of, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router  ) { }
  private base_url = environment.BASE_URL;
  private token!:string;
  private username!:string;
  private reCaptchaAuth!: boolean;
  private roles!:string[];
  private departments!:[]

  login(credentials:{username:string , password:string}):Observable<any>{
   
    return this.http.post<any>(`${this.base_url}/auth/login`, credentials).pipe(
      tap(res => {
        if (res && res.jwtToken) {
          this.token = res.jwtToken;
          this.username = res.username;
          // console.log(res.jwtToken);
          
          localStorage.setItem('username', this.username);
          localStorage.setItem('token', this.token);
          const decodedToken: any = jwtDecode(this.token);
        this.roles = decodedToken.roles;
        console.log(this.roles);
        this.whatIsRole(this.roles)
        
        this.departments = decodedToken.departments;
        console.log(this.departments);
        
        }
      })
    );
  }

  logout():any{
    return this.http.post<any>(`${this.base_url}/auth/logout`,null)
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {

    const token = localStorage.getItem('token')
    if (!token) {
      return false;
    }
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(new Date().getTime()/1000); 
    if (decodedToken.exp && decodedToken.exp > currentTime) {
      return true;
    } else {
      this.logout(); 
      return false;
    }
  }


  whatIsRole(role:string[])  {
    if (role.includes('Admin')) {
      sessionStorage.setItem('role', 'Admin');
    } else if (role.includes('Uploader')) {
      sessionStorage.setItem('role', 'Uploader');
    } else {
      sessionStorage.setItem('role', 'Viewer');
    }
  }

}

