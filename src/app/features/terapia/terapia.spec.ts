import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Terapia } from './terapia';

describe('Terapia', () => {
  let component: Terapia;
  let fixture: ComponentFixture<Terapia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terapia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Terapia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
