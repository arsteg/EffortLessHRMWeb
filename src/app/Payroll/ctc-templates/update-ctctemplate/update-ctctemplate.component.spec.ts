import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCTCTemplateComponent } from './update-ctctemplate.component';

describe('UpdateCTCTemplateComponent', () => {
  let component: UpdateCTCTemplateComponent;
  let fixture: ComponentFixture<UpdateCTCTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateCTCTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateCTCTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
