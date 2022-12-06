import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermissionModelComponent } from './permission-model.component';

describe('PermissionModelComponent', () => {
  let component: PermissionModelComponent;
  let fixture: ComponentFixture<PermissionModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PermissionModelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PermissionModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
