import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceTaskComponent } from './task.component';

describe('ComplianceTaskComponent', () => {
  let component: ComplianceTaskComponent;
  let fixture: ComponentFixture<ComplianceTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplianceTaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
