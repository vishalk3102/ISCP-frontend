import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FrameworkService {

  constructor(private http: HttpClient) { }
  private base_url = environment.BASE_URL;

  getFrameworksPaginated(page:number, size:number| null |undefined , filters?:any){
    let params = new HttpParams();
    if(filters){
      if (filters.frameworkCategory && filters.frameworkCategory.frameworkCategoryName) {
        params = params.set('frameworkCategory', filters.frameworkCategory.frameworkCategoryName);
      }
      if (filters.frameworkName && filters.frameworkName.frameworkName) {
        params = params.set('framework', filters.frameworkName.frameworkName);
      }
      if (filters.Status !== null && filters.Status !== undefined) {
        params = params.set('status', filters.Status);
      }
      if (filters.calendarFrom) {
        params = params.set('startDate', filters.calendarFrom);
      }
      if (filters.calendarTo) {
        params = params.set('endDate', filters.calendarTo);
      }
    }
    return this.http.get<any>(`${this.base_url}/framework/get-filtered-framework-paginated?page=${page}&size=${size}&sortBy=frameworkName&isAscending=true`,{params})
  }
}
