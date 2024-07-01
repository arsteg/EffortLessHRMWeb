import { OnInit, OnDestroy, Directive } from '@angular/core'
import { CommonService } from 'src/app/_services/common.Service';

@Directive()
export abstract class StatefulComponent implements OnInit, OnDestroy {
  abstract userId: string;
  abstract componentName: string; // Add componentName as an abstract property
  state: any;

  constructor(protected commonService: CommonService) {}

  ngOnInit(): void {
    const key = this.generateUniqueKey();
    this.commonService.getUserUiState(key).subscribe(
      (data) => {
        if (data) {
          this.state = data.value;
          this.restoreState(this.state);
        }
      },
      (error) => {
        console.error('Error retrieving state:', error);
      }
    );
  }

  ngOnDestroy(): void {
    this.saveState();
  }

  saveState(): void {
    const key = this.generateUniqueKey();
    const state = this.captureState();
    this.commonService.setUserUiState({'key':key, 'value':state}).subscribe(
      (response) => {
        console.log('State saved successfully');
      },
      (error) => {
        console.error('Error saving state:', error);
      }
    );
  }

  generateUniqueKey(): string {
    return `${this.userId}-${this.componentName}`;
  }

  abstract captureState(): any;
  abstract restoreState(state: any): void;
}
