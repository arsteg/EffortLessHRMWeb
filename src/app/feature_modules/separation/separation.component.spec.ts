import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeparationComponent } from './separation.component';

describe('SeparationComponent', () => {
  let component: SeparationComponent;
  let fixture: ComponentFixture<SeparationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      imports: [UiTestingModule],
      declarations: [ SeparationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
