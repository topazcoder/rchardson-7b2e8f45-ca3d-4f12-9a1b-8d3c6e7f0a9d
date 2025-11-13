import { Pipe, PipeTransform } from '@angular/core';
import { Task } from 'libs/data/task';

@Pipe({ name: 'taskSearch', standalone: true })
export class TaskSearchPipe implements PipeTransform {
  transform(tasks?: Task[], query?: string) {
    if (!tasks) return [];
    if (!query) return tasks;
    const q = query.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q)
    );
  }
}
