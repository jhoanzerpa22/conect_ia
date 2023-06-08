import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyLegalTypeComponent } from './body-legal.component';

describe('BodyLegalTypeComponent', () => {
  let component: BodyLegalTypeComponent;
  let fixture: ComponentFixture<BodyLegalTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyLegalTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BodyLegalTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
