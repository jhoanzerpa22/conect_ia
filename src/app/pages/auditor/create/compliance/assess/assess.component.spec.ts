import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceAssessComponent } from './assess.component';

describe('ComplianceAssessComponent', () => {
  let component: ComplianceAssessComponent;
  let fixture: ComponentFixture<ComplianceAssessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplianceAssessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceAssessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
