import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { authInterceptor } from './services/auth/authInterceptor/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),provideHttpClient(withInterceptors([authInterceptor])),provideNoopAnimations(),provideToastr({timeOut: 2000 , positionClass: 'toast-top-center',
    preventDuplicates: true})]
};
