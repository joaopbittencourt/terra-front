import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { TherapyService } from './therapy.service';

describe('TherapyService', () => {
  let service: TherapyService;
  let http: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['get', 'post', 'put', 'delete']);
    http.get.and.returnValue(of([{ id: '1', name: 'Terapia inicial' }] as any[]));
    service = new TherapyService(http);
  });

  it('should not duplicate cached therapies when creating or updating by id', (done) => {
    const createdTherapy = { id: '1', name: 'Terapia criada' } as any;
    const updatedTherapy = { id: '1', name: 'Terapia atualizada' } as any;

    http.post.and.returnValue(of(createdTherapy));
    http.put.and.returnValue(of(updatedTherapy));

    const snapshots: any[][] = [];

    service.getAll().subscribe((items) => {
      snapshots.push(items);

      if (snapshots.length === 3) {
        expect(snapshots[1].filter((item) => item.id === '1')).toHaveSize(1);
        expect(snapshots[2].filter((item) => item.id === '1')).toHaveSize(1);
        expect(snapshots[2][0].name).toBe('Terapia atualizada');
        done();
      }
    });

    service.create({ id: '1', name: 'Terapia criada' } as any).subscribe();
    service.update('1', { name: 'Terapia atualizada' } as any).subscribe();
  });
});
