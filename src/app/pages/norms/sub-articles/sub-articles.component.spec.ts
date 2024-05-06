import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubArticlesComponent } from './sub-articles.component';

describe('SubArticlesComponent', () => {
  let component: SubArticlesComponent;
  let fixture: ComponentFixture<SubArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubArticlesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
