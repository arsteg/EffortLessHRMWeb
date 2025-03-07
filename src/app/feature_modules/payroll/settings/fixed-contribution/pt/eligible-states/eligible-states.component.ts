import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PayrollService } from 'src/app/_services/payroll.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-eligible-states',
  templateUrl: './eligible-states.component.html',
  styleUrls: ['./eligible-states.component.css']
})
export class EligibleStatesComponent implements OnInit {
  searchText: string;
  closeResult: string;
  isEdit: boolean = false;
  eligibleStates: any[] = [];
  eligibleStateForm: FormGroup;
  states: any;
  eleState: any;

  constructor(private modalService: NgbModal,
    private payroll: PayrollService,
    private fb: FormBuilder,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.eligibleStateForm = this.fb.group({
      states: this.fb.array([])
    });

    this.getEligibleStates();
    this.getAllStates();
    this.getState();
  }

  getAllStates() {
    this.payroll.getAllStates().subscribe((res: any) => {
      this.states = res.data;
      // Ensure all states are in the form array
      this.states.forEach(state => {
        const exists = this.eligibleStateForm.value.states.some(s => s.state === state._id);
        if (!exists) {
          this.addStateControl(state._id, false);
        }
      });
    });
  }

  addStateControl(stateId: string, isEligible: boolean): void {
    (this.eligibleStateForm.get('states') as FormArray).push(
      this.fb.group({
        state: [stateId],
        isEligible: [isEligible]
      })
    );
  }

  onStateChange(event: any, stateId: string, index: number): void {
    const statesFormArray = this.eligibleStateForm.get('states') as FormArray;
    const stateControl = statesFormArray.controls.find(control => control.get('state').value === stateId);
    if (stateControl) {
      stateControl.get('isEligible').setValue(event.checked);
    } else {
      console.error('State not found in eligibleStates');
    }
  }

  isStateEligible(stateId: string): boolean {
    const state = this.eligibleStates.find(s => s.state === stateId);
    return state ? state.isEligible : false;
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  clearForm() {
    this.isEdit = false;
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  // getEligibleStates() {
  //   this.payroll.getEligibleStates().subscribe((res: any) => {
  //     this.eleState = res.data;

  //     this.eligibleStateForm = this.fb.group({
  //       states: this.fb.array(this.eleState.map(data =>
  //         this.fb.group({
  //           state: [data.state.state],
  //           isEligible: [data.isEligible]
  //         })
  //       ))
  //     });
  //   });
  // }
  getEligibleStates() {
    this.payroll.getEligibleStates().subscribe((res: any) => {
      this.eleState = res.data;
      this.eligibleStates = res.data; // Update eligibleStates array
      
      // Clear existing form array
      const statesArray = this.eligibleStateForm.get('states') as FormArray;
      while (statesArray.length !== 0) {
        statesArray.removeAt(0);
      }

      // Populate form array with current eligible states
      this.eleState.forEach(data => {
        this.addStateControl(data.state._id || data.state.state, data.isEligible);
      });
    });
  }
  onSubmission() {
    this.payroll.updateEligibleState(this.eligibleStateForm.value).subscribe((data: any) => {
      this.eligibleStates = data.data;
      this.getEligibleStates();
    });
  }

  getState() {
    this.payroll.getAllConfiguredStates().subscribe((data: any) => {
      this.states = data.data;
      this.states.forEach((state) => {
        (this.eligibleStateForm.get('states') as FormArray).push(
          this.fb.group({
            state: [state._id],
            isEligible: [false]
          })
        );
      });
    });
  }

  refreshList() { this.getState(); }

}
