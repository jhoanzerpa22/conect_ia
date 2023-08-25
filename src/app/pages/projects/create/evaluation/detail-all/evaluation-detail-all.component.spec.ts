import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationDetailAllComponent } from './evaluation-detail-all.component';

describe('EvaluationDetailAllComponent', () => {
  let component: EvaluationDetailAllComponent;
  let fixture: ComponentFixture<EvaluationDetailAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationDetailAllComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationDetailAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
