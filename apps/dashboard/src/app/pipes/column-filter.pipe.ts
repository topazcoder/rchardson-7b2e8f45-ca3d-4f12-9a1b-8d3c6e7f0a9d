import { Pipe, PipeTransform } from '@angular/core';
import { Task, taskStatusList } from 'libs/data/task';

@Pipe({ name: 'columnFilter', standalone: true })
export class ColumnFilterPipe implements PipeTransform {
  transform(tasks: Task[] | undefined, status: string) {
    if (!tasks) return [];
    return tasks.filter((t) => taskStatusList[t.status] === status);
  }
}
