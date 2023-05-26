import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansAssessComponent } from './assess.component';

describe('PlansAssessComponent', () => {
  let component: PlansAssessComponent;
  let fixture: ComponentFixture<PlansAssessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlansAssessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansAssessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
