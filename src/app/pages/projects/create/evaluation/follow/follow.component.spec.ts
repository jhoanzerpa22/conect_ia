import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluationFollowComponent } from './follow.component';

describe('EvaluationFollowComponent', () => {
  let component: EvaluationFollowComponent;
  let fixture: ComponentFixture<EvaluationFollowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluationFollowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluationFollowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
