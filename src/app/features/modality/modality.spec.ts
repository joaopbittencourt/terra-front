import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalityComponent } from './modality';

describe('ModalityComponent', () => {
  let component: ModalityComponent;
  let fixture: ComponentFixture<ModalityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
