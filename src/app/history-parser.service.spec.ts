import { TestBed } from '@angular/core/testing';

import { HistoryParserService } from './history-parser.service';

describe('HistoryParserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HistoryParserService = TestBed.get(HistoryParserService);
    expect(service).toBeTruthy();
  });
});
