import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserFormCOntrolComponent } from './user-form-control.component';

describe('UserFormCOntrolComponent', () => {
  let component: UserFormCOntrolComponent;
  let fixture: ComponentFixture<UserFormCOntrolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserFormCOntrolComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserFormCOntrolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
