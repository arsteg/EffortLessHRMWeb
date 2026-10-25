import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDepartmentComponent } from './sub-department.component';

describe('SubDepartmentComponent', () => {
  let component: SubDepartmentComponent;
  let fixture: ComponentFixture<SubDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [SubDepartmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
