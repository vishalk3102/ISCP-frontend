import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../authService/auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const myToken = localStorage.getItem('token');
 
  const cloneRequest =  req.clone({
    setHeaders:{
      Authorization:`Bearer ${myToken}`
    }
    
  });console.log('hello from in');
  
  return next(cloneRequest);
};
