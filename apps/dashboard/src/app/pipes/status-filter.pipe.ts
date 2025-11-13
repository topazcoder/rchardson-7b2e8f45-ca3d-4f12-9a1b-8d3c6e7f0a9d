import { Pipe, PipeTransform } from '@angular/core';
import { Task } from 'libs/data/task';

@Pipe({ name: 'statusFilter', standalone: true })
export class StatusFilterPipe implements PipeTransform {
  transform(tasks?: Task[], status?: string) {
    if (!tasks) return [];
    if (!status || status === 'all') return tasks;
    const map: Record<string, number> = {
      todo: 0,
      'in-progress': 1,
      inprogress: 1,
      progress: 1,
      done: 2,
    };
    const target = map[status.toLowerCase()] ?? null;
    if (target === null) return tasks;
    return tasks.filter((t) => (typeof t.status === 'number' ? t.status === target : false));
  }
}
