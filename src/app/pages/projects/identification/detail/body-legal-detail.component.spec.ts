import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BodyLegalDetailIdComponent } from './body-legal-detail.component';

describe('BodyLegalDetailIdComponent', () => {
  let component: BodyLegalDetailIdComponent;
  let fixture: ComponentFixture<BodyLegalDetailIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BodyLegalDetailIdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BodyLegalDetailIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
