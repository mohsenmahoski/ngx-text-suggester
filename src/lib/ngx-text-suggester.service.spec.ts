import { TestBed } from '@angular/core/testing';

import { NgxTextSuggesterService } from './ngx-text-suggester.service';

describe('NgxTextSuggesterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxTextSuggesterService = TestBed.get(NgxTextSuggesterService);
    expect(service).toBeTruthy();
  });
});
