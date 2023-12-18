import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.css']
})
export class CRUDComponent {
  @Output() onSubmit: any = new EventEmitter();
  @Input() readOnly: boolean = false;
  @Input() fields: any = [
    {
      name: 'Employee Name',
      type: 'text',
      isRequired: true,
      options: null,
      charLimit: 50,
      id: 'empName',
      value: 'Test'
    },
    {
      name: 'Gender',
      type: 'radio',
      isRequired: true,
      options: [
        { id: 1, value: 'Male' },
        { id: 2, value: 'Female' },
        { id: 3, value: 'Other' }
      ],
      charLimit: null,
      id: 'gender'
    },
    {
      name: 'Department',
      type: 'select',
      isRequired: false,
      options: [
        { id: 1, value: 'Accounts' },
        { id: 2, value: 'Development' },
        { id: 3, value: 'R&D' },
        { id: 4, value: 'Analytics and Reporting' },
      ],
      value: '1',
      id: 'department'
    },
    {
      name: 'Type of Attachments',
      type: 'check',
      isRequired: false,
      options: [
        { id: 1, value: 'png' },
        { id: 2, value: 'jpg' },
        { id: 3, value: 'doc' },
        { id: 4, value: 'pdf' },
      ],
      id: 'check'
    },
    {
      name: 'Start Date',
      type: 'date',
      isRequired: true,
      id: 'date',
      value: new Date,
      options: null
    }
  ];

  crudForm: FormGroup;
  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.crudForm = this.fb.group({});

    if (this.fields && this.fields.length > 0) {
      this.fields.forEach((field: any) => {
        if (field.id) {
          if (field.type === 'check') {
            const checkboxes = this.fb.array(
              field.options.map(option => this.fb.control(false))
            );
            this.crudForm.addControl(field.id, checkboxes);
          } else {
            this.crudForm.addControl(field.id, new FormControl(field.value));
          }
        }
      });
    }
  }

  get check() {
    return this.crudForm.get('check') as FormArray;
  }



  onCheckboxChange(event, i: number) {
    this.check.at(i).setValue(event.target.checked);
  }

  submitted(event: any) {
    const selectedCheckboxes = this.check.value
      .map((checked, index) => checked ? this.fields[3].options[index].value : null)
      .filter(value => value !== null);

    this.crudForm.value['check'] = selectedCheckboxes;
    console.log(this.crudForm.value)
    this.onSubmit.emit(this.crudForm.value);
  }


  onCancel() {
    this.crudForm.reset();
  }
}