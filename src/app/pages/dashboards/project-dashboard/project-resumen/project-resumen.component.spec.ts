import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectResumenComponent } from './project-resumen.component';

describe('ProjectResumenComponent', () => {
  let component: ProjectResumenComponent;
  let fixture: ComponentFixture<ProjectResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectResumenComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectResumenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
