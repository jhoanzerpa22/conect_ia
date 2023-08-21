import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationTaskComponent } from './task.component';

describe('EvaluationTaskComponent', () => {
  let component: EvaluationTaskComponent;
  let fixture: ComponentFixture<EvaluationTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
