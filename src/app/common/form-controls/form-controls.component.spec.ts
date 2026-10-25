import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControlsComponent } from './form-controls.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Base } from 'src/app/controls/base';

describe('FormControlsComponent', () => {
  let component: FormControlsComponent;
  let fixture: ComponentFixture<FormControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ FormControlsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormControlsComponent);
    component = fixture.componentInstance;
    component.control = new Base({ key: 'name', label: 'Name', controlType: 'textbox', type: 'text', required: true });
    component.form = new FormGroup({ name: new FormControl('', Validators.required) });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe('name');
    expect(fixture.nativeElement.querySelector('.validationErroMessage').textContent).toContain('Name is required');
  });
});
