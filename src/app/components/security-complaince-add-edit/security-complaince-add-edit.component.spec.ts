import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityComplainceAddEditComponent } from './security-complaince-add-edit.component';

describe('SecurityComplainceAddEditComponent', () => {
  let component: SecurityComplainceAddEditComponent;
  let fixture: ComponentFixture<SecurityComplainceAddEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityComplainceAddEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecurityComplainceAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
