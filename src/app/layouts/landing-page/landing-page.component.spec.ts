import { LandingPlansComponent } from 'src/app/layouts/landing-page/landing-plans/landing-plans.component';
import { TrustComponent } from 'src/app/layouts/landing-page/trust/trust.component';
import { FooterComponent } from 'src/app/layouts/landing-page/footer/footer.component';
import { HeroComponent } from 'src/app/layouts/landing-page/hero/hero.component';
import { NavbarComponent } from 'src/app/layouts/landing-page/navbar/navbar.component';
import { HrmFeaturesComponent } from 'src/app/layouts/landing-page/hrm-features/hrm-features.component';
import { FeaturesComponent } from 'src/app/layouts/landing-page/features/features.component';
import { WorkspaceComponent } from 'src/app/layouts/landing-page/workspace/workspace.component';
import { AboutUsComponent } from 'src/app/layouts/landing-page/about-us/about-us.component';
import { UiTestingModule } from 'src/testing/ui-testing.module';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      errorOnUnknownElements: true, errorOnUnknownProperties: true,
      declarations: [AboutUsComponent, WorkspaceComponent, FeaturesComponent, HrmFeaturesComponent, NavbarComponent, HeroComponent, FooterComponent, TrustComponent, LandingPageComponent],
      imports: [LandingPlansComponent, UiTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
