import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTreeComponent } from './employee-tree.component';

describe('EmployeeTreeComponent', () => {
  let component: EmployeeTreeComponent;
  let fixture: ComponentFixture<EmployeeTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeTreeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmployeeTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
