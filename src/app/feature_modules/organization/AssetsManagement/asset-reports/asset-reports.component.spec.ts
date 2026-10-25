import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetReportsComponent } from './asset-reports.component';

describe('AssetReportsComponent', () => {
  let component: AssetReportsComponent;
  let fixture: ComponentFixture<AssetReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
