import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansWorkAnalityComponent } from './plans-work-anality.component';

describe('PlansWorkAnalityComponent', () => {
  let component: PlansWorkAnalityComponent;
  let fixture: ComponentFixture<PlansWorkAnalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlansWorkAnalityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlansWorkAnalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
