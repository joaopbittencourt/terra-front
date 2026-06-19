import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthPlans } from './health-plan';

describe('HealthPlans', () => {
  let component: HealthPlans;
  let fixture: ComponentFixture<HealthPlans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthPlans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthPlans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
