import { TestBed } from '@angular/core/testing';
import { TaskListComponent } from './taskList.component';
import { AuthService } from '../../services/auth.service';

describe('TaskListComponent', () => {
  let fixture: any;
  let comp: TaskListComponent;
  const mockAuth: any = { getUserRole: () => 'owner' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [{ provide: AuthService, useValue: mockAuth }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    comp = fixture.componentInstance;
  });

  it('isTransferAllowed returns true for owner/admin', () => {
    expect(comp.isTransferAllowed()).toBe(true);
  });

  it('toggleDone emits updated task', () => {
    const spy = jest.fn();
    comp.update.subscribe(spy);
    const t: any = { id: '1', status: 0 };
    comp.toggleDone(t);
    expect(spy).toHaveBeenCalled();
    const updated = spy.mock.calls[0][0];
    expect(updated.status).toBe(1);
  });

  it('onDrop emits update with mapped status', () => {
    const spy = jest.fn();
    comp.update.subscribe(spy);
    // set dragData via onDragStart by bypassing drag event
    (comp as any).dragData = { id: '2', status: 0 };
    const evt: any = { preventDefault: jest.fn() };
    comp.onDrop(evt as any, 'done');
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls[0][0].status).toBe(2);
  });

  it('categories returns unique categories', () => {
    comp.tasks = [
      { id: '1', category: 'a' } as any,
      { id: '2', category: 'b' } as any,
      { id: '3', category: 'a' } as any,
    ];
    const cats = comp.categories;
    expect(cats).toContain('a');
    expect(cats).toContain('b');
    expect(cats.length).toBe(2);
  });
});
