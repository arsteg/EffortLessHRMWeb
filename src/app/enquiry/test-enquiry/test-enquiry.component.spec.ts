import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestEnquiryComponent } from './test-enquiry.component';

describe('TestEnquiryComponent', () => {
  let component: TestEnquiryComponent;
  let fixture: ComponentFixture<TestEnquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestEnquiryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestEnquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
