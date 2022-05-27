import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Base } from '../controls/base';

@Injectable({ providedIn: 'root' })

export class ControlService {
  constructor() { }
  toFormGroup(controls: Base<string>[] ) {    
    const group: any = {};
    controls.forEach(control => {
      group[control.key] = control.required ? new FormControl(control.value || '', Validators.required)
                                              : new FormControl(control.value || '');
    });
    return new FormGroup(group);
  }
}