import { TestBed } from '@angular/core/testing';

import { PermissionModelService } from './permission-model.service';

describe('PermissionModelService', () => {
  let service: PermissionModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
