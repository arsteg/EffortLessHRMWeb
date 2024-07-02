import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GratuityTemplateComponent } from './gratuity-template.component';

describe('GratuityTemplateComponent', () => {
  let component: GratuityTemplateComponent;
  let fixture: ComponentFixture<GratuityTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GratuityTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GratuityTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
