import { TestBed } from '@angular/core/testing';

import { EmailtemplateService } from './emailtemplate.service';

describe('EmailtemplateService', () => {
  let service: EmailtemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmailtemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
