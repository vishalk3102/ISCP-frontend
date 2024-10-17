import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityComplainceComponent } from './security-complaince.component';

describe('SecurityComplainceComponent', () => {
  let component: SecurityComplainceComponent;
  let fixture: ComponentFixture<SecurityComplainceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SecurityComplainceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SecurityComplainceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
