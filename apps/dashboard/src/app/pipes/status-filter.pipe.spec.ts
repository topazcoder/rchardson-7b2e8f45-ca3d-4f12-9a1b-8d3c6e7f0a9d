import { StatusFilterPipe } from './status-filter.pipe';

describe('StatusFilterPipe', () => {
  const pipe = new StatusFilterPipe();

  const tasks = [
    { id: '1', title: 'A', status: 0 },
    { id: '2', title: 'B', status: 1 },
    { id: '3', title: 'C', status: 2 },
  ];

  it('returns empty array when tasks undefined', () => {
    expect(pipe.transform(undefined, 'todo')).toEqual([]);
  });

  it('returns tasks when status is all or empty', () => {
    expect(pipe.transform(tasks as any, 'all')).toBe(tasks as any);
    expect(pipe.transform(tasks as any, '')).toBe(tasks as any);
  });

  it('filters todo correctly', () => {
    const res = pipe.transform(tasks as any, 'todo');
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('1');
  });

  it('filters in-progress synonyms', () => {
    expect(pipe.transform(tasks as any, 'in-progress').length).toBe(1);
    expect(pipe.transform(tasks as any, 'inprogress').length).toBe(1);
    expect(pipe.transform(tasks as any, 'progress').length).toBe(1);
  });

  it('returns tasks if unknown status', () => {
    expect(pipe.transform(tasks as any, 'weird')).toBe(tasks as any);
  });
});
