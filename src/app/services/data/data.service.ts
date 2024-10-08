import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  private selectedIdsSubject = new BehaviorSubject<any[]>([]);
  selectedIds$ = this.selectedIdsSubject.asObservable();

  updateSelectedIds(ids: any[]) {
    this.selectedIdsSubject.next(ids);
  }
}
