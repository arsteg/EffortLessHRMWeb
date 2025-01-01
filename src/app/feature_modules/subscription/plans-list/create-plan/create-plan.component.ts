import { Component, inject, signal, ViewEncapsulation, DestroyRef } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { SubscriptionService } from 'src/app/_services/subscription.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-create-plan',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatRadioModule,
  ],
  providers: [
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {floatLabel: 'auto'}}
  ],
  templateUrl: './create-plan.component.html',
  styleUrl: './create-plan.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CreatePlanComponent {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly destroyRef = inject(DestroyRef);
  planForm: FormGroup;
  loading = signal(false);
  
  constructor(public dialogRef: MatDialogRef<CreatePlanComponent>){}

  ngOnInit() {
    this.planForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      currentprice: new FormControl('', [Validators.required, Validators.min(1)]),
      frequency: new FormControl('monthly'),
      interval: new FormControl('1', [Validators.min(1)]),
      description: new FormControl(''),
      notes1: new FormControl(''),
      notes2: new FormControl(''),
      quantity: new FormControl('1', [Validators.min(1)]),
    });
  }

  createPlan(){
    this.loading.set(true);
    const payload = this.planForm.value;
    payload['IsActive'] = true;
    this.subscriptionService.createPlan(this.planForm.value)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((data:any)=>{
      this.loading.set(false);
      this.dialogRef.close('success');
    },(error:any)=>{
      this.loading.set(false);
    })
  }
}
