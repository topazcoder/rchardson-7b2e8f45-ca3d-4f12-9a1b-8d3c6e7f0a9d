import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { TaskService } from './task.service';
import { NotificationService } from './notification.service';

const mockTasks = [
  { id: '1', title: 'A', description: '', status: 0, category: 'General', order: 0 },
  { id: '2', title: 'B', description: '', status: 1, category: 'General', order: 1 },
];

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: any;
  let notifyMock: any;

  beforeEach(() => {
    httpMock = {
      get: jest.fn(() => of(mockTasks)),
      post: jest.fn(() => of({ success: true })),
      put: jest.fn(() => of({})),
      delete: jest.fn(() => of({})),
    };
    notifyMock = { success: jest.fn(), error: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: 'HttpClient', useValue: httpMock },
        { provide: NotificationService, useValue: notifyMock },
      ],
    });

    // use TestBed.inject with manual provider resolution
    service = new TaskService(httpMock as any, notifyMock as any);
  });

  it('loads tasks on construction / loadTasks', (done) => {
    service.loadTasks().subscribe((list) => {
      expect(list.length).toBe(2);
      expect(service['tasks$'].value.length).toBe(2);
      done();
    });
  });

  it('shows error toast when loadTasks fails', (done) => {
    httpMock.get = jest.fn(() => throwError(() => ({ error: { message: 'boom' } })));
    const svc = new TaskService(httpMock as any, notifyMock as any);
    svc.loadTasks().subscribe((list) => {
      expect(notifyMock.error).toHaveBeenCalledWith('boom');
      done();
    });
  });

  it('create/add task triggers success toast and reload', (done) => {
    httpMock.post = jest.fn(() => of({ success: true }));
    const spyLoad = jest.spyOn(service, 'loadTasks').mockImplementation(() => of(mockTasks));
    service.addTask({ title: 'X' } as any).subscribe((res) => {
      expect(notifyMock.success).toHaveBeenCalled();
      spyLoad.mockRestore();
      done();
    });
  });
});
