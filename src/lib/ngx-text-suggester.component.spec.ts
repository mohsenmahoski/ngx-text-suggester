import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxTextSuggesterComponent } from './ngx-text-suggester.component';

describe('NgxTextSuggesterComponent', () => {
  let component: NgxTextSuggesterComponent;
  let fixture: ComponentFixture<NgxTextSuggesterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxTextSuggesterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxTextSuggesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
