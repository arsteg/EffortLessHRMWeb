import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Base } from '../controls/base';

@Injectable({ providedIn: 'root' })

export class ControlService {
  constructor() { }
  toFormGroup(controls: Base<string>[] ) {    
    const group: any = {};
    controls.forEach(control => {
      group[control.key] = control.required ? new UntypedFormControl(control.value || '', Validators.required)
                                              : new UntypedFormControl(control.value || '');
    });
    return new UntypedFormGroup(group);
  }
}