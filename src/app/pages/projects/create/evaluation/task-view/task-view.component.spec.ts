import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationTaskViewComponent } from './task-view.component';

describe('EvaluationTaskViewComponent', () => {
  let component: EvaluationTaskViewComponent;
  let fixture: ComponentFixture<EvaluationTaskViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationTaskViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationTaskViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
