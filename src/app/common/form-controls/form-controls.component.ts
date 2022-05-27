import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Base } from 'src/app/controls/base';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-form-controls',
  templateUrl: './form-controls.component.html',
  styleUrls: ['./form-controls.component.css']
})
export class FormControlsComponent implements OnInit {
  
  @Input() control!: Base<string>;
  @Input() form!: FormGroup;
  get isValid() { return this.form.controls[this.control.key].valid; }

  constructor() { }

  ngOnInit(): void {
  }
}
