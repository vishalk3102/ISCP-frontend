import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { LoginComponent } from './components/login/login.component';
import { SecurityComplainceComponent } from './components/security-complaince/security-complaince.component';
import { SecurityComplainceAddEditComponent } from './components/security-complaince-add-edit/security-complaince-add-edit.component';
import { authGuard } from './services/auth/authGuard/auth.guard';
import { loginGuard } from './services/loginGuard/login.guard';
import { UnAuthorizedComponent } from './components/un-authorized/un-authorized.component';
import { FrameworkComponent } from './components/masters/framework/framework.component';

export const routes: Routes = [
    {
        path:'' , redirectTo:'/login' , pathMatch:'full' 
    },
    {
        path:'login' , title:'Login | Information Security Portal' , component: LoginComponent, canActivate:[loginGuard]
    },
    {
        path:'security-compliance' , title: 'Framework Listing | Information Security Portal' , component:SecurityComplainceComponent , canActivate:[authGuard],data: { roles: ['Viewer', 'Uploader', 'Admin'] }
    },
    {
        path:'security-compliance-add-edit' , title: 'Framework Add Edit | Information Security Portal' , component:SecurityComplainceAddEditComponent , canActivate:[authGuard],data: { roles: ['Admin'] }
    },
    {
        path:'unauthorized' , title: 'UNAUTHORIZED' , component:UnAuthorizedComponent
    },
    {
        path:'framework' , title:'Framework | Information Security Portal' , component:FrameworkComponent ,canActivate:[authGuard],data: { roles: ['Admin'] }
    },
    {
        path:'**' , component: PageNotFoundComponent
    }
    
];
