import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceFollowComponent } from './follow.component';

describe('ComplianceFollowComponent', () => {
  let component: ComplianceFollowComponent;
  let fixture: ComponentFixture<ComplianceFollowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComplianceFollowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComplianceFollowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
