import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyLegalDetailComponent } from './body-legal-detail.component';

describe('BodyLegalDetailComponent', () => {
  let component: BodyLegalDetailComponent;
  let fixture: ComponentFixture<BodyLegalDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyLegalDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyLegalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
