import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePackageFormDialogComponent } from './service-package-form-dialog';

describe('ServicePackageFormDialogComponent', () => {
  let component: ServicePackageFormDialogComponent;
  let fixture: ComponentFixture<ServicePackageFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicePackageFormDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicePackageFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
