import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth/authService/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule,RouterLinkActive,RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  username:any='';
  role:string='';
  constructor(private authService : AuthService, private router: Router){}
  ngOnInit(){
    this.username = localStorage.getItem('username');
    this.getUserType();
  }
  logout(){
    this.authService.logout().subscribe((res:any)=>{
      console.log(res);
      localStorage.removeItem('token');
      localStorage.removeItem('username');
    this.router.navigate(['/login']);
    })
  }
  getUserType(){
    this.role = sessionStorage.getItem('role')|| '';
    
  }
  isAdmin():boolean{
    return this.role === 'Admin';
  }
}
