import { Pipe, PipeTransform } from '@angular/core';
import { Task } from 'libs/data/task';

@Pipe({ name: 'taskSort', standalone: true })
export class TaskSortPipe implements PipeTransform {
  transform(tasks?: Task[], key?: string, dir: 'asc' | 'desc' = 'asc') {
    if (!tasks) return [];
    if (!key) return tasks;
    const items = [...tasks];
    if (key === 'status') {
      // Sort primarily by numeric status: 0 (todo), 1 (in-progress), 2 (done)
      // Then by order (if present), then by title to make ordering stable.
      items.sort((a: Task, b: Task) => {
        const sa = typeof a.status === 'number' ? a.status : 0;
        const sb = typeof b.status === 'number' ? b.status : 0;
        if (sa !== sb) return sa - sb;
        const oa = typeof a.order === 'number' ? a.order : 0;
        const ob = typeof b.order === 'number' ? b.order : 0;
        if (oa !== ob) return oa - ob;
        return String(a.title || '').localeCompare(String(b.title || ''));
      });
      if (dir === 'desc') items.reverse();
    } else {
      items.sort((a: Task, b: Task) => {
        const va = (a as unknown as Record<string, unknown>)[key as string];
        const vb = (b as unknown as Record<string, unknown>)[key as string];
        if (va == null && vb == null) return 0;
        if (va == null) return -1;
        if (vb == null) return 1;
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va as number) - (vb as number);
        }
        const sa = String(va).toLowerCase();
        const sb = String(vb).toLowerCase();
        if (sa < sb) return -1;
        if (sa > sb) return 1;
        return 0;
      });
      if (dir === 'desc') items.reverse();
    }
    return items;
  }
}
