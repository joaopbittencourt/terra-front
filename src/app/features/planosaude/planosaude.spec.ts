import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Planosaude } from './planosaude';

describe('Planosaude', () => {
  let component: Planosaude;
  let fixture: ComponentFixture<Planosaude>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planosaude]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Planosaude);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
