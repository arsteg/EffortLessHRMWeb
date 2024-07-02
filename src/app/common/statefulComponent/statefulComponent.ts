import { OnInit, OnDestroy, Directive } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/_services/common.Service';

@Directive()
export abstract class StatefulComponent implements OnInit, OnDestroy {
  abstract userId: string;
  componentName: string; // Add componentName as an abstract property
  state: any;

  constructor(protected commonService: CommonService,private activatedRoute: ActivatedRoute,
    private router: Router) {}

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

  generateUniqueKey(): string {
    return `${this.userId}-${this.componentName}`;
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

  getCurrentComponentName(): string {
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const component = route.snapshot.routeConfig?.component;
    return component ? component.name : 'UnknownComponent';
  }

  abstract captureState(): any;
  abstract restoreState(state: any): void;
}
