import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectAnalityComponent } from './project-anality.component';

describe('ProjectAnalityComponent', () => {
  let component: ProjectAnalityComponent;
  let fixture: ComponentFixture<ProjectAnalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectAnalityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectAnalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
