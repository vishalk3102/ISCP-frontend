import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../authService/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  let authService = inject(AuthService);
  let routerService = inject(Router);
  console.log('Auth guard activated for route:', state.url);

  if (authService.isAuthenticated()) {
    const role = sessionStorage.getItem('role');
    const expectedRole = route.data['roles'] as Array<string>;
    console.log("excpected role",expectedRole);
    console.log(role && expectedRole && expectedRole.includes(role));
    console.log(role);
    
    
    if (role && expectedRole && expectedRole.includes(role) ) {
      return true;
    } else {
      console.warn('Access denied. Redirecting to security compliance.',state.url);
      routerService.navigate(['/unauthorized']); 
      return false;
    }

  }else{
    console.warn('User not authenticated. Logging out and redirecting to login.');
  authService.logout();
  routerService.navigate(['/login']);
  return false;
}
};
