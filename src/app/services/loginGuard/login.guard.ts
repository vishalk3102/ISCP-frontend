import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/authService/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  let routerService = inject(Router);
  if(state.url == '/login'){
  if (authService.isAuthenticated()) {
    routerService.navigate(['/security-compliance']); 
    return false;
  }}
  // console.log("hello afrom authgard");
  return true;
};
