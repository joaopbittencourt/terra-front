import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modalidade } from './modalidade';

describe('Modalidade', () => {
  let component: Modalidade;
  let fixture: ComponentFixture<Modalidade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modalidade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Modalidade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
