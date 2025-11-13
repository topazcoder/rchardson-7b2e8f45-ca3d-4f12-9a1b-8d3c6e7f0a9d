import { Pipe, PipeTransform } from '@angular/core';
import { Task } from 'libs/data/task';

@Pipe({ name: 'categoryFilter', standalone: true })
export class CategoryFilterPipe implements PipeTransform {
  transform(tasks?: Task[], category?: string) {
    if (!tasks) return [];
    if (!category || category === 'all') return tasks;
    return tasks.filter(
      (t) => (t.category || '').toLowerCase() === category.toLowerCase()
    );
  }
}
