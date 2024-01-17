import { TestBed } from '@angular/core/testing';

import { CallingFunctionsService } from './calling-functions.service';

describe('CallingFunctionsService', () => {
  let service: CallingFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CallingFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
