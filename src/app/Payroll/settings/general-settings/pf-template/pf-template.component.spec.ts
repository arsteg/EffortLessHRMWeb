import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PfTemplateComponent } from './pf-template.component';

describe('PfTemplateComponent', () => {
  let component: PfTemplateComponent;
  let fixture: ComponentFixture<PfTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PfTemplateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PfTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
