import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureStateComponent } from './configure-state.component';

describe('ConfigureStateComponent', () => {
  let component: ConfigureStateComponent;
  let fixture: ComponentFixture<ConfigureStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigureStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigureStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
