import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectEvaluationsComponent } from './project-evaluations.component';

describe('ProjectEvaluationsComponent', () => {
  let component: ProjectEvaluationsComponent;
  let fixture: ComponentFixture<ProjectEvaluationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectEvaluationsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectEvaluationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
