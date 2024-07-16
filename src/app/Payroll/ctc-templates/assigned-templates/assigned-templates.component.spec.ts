import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedTemplatesComponent } from './assigned-templates.component';

describe('AssignedTemplatesComponent', () => {
  let component: AssignedTemplatesComponent;
  let fixture: ComponentFixture<AssignedTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignedTemplatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssignedTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
