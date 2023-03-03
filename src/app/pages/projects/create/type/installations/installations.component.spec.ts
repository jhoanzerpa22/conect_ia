import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallationsTypeComponent } from './installations.component';

describe('InstallationsTypeComponent', () => {
  let component: InstallationsTypeComponent;
  let fixture: ComponentFixture<InstallationsTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallationsTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallationsTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
