import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { CreateTaskDto, Task } from 'libs/data/task';
import { ResponseData } from 'libs/data/response';

import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks$ = new BehaviorSubject<Task[]>([]);
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private notify: NotificationService) {
    this.loadTasks().subscribe();
  }

  get value$() {
    return this.tasks$.asObservable();
  }

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks`).pipe(
      tap((list: Task[]) => {
        this.tasks$.next(list || []);
      }),
      catchError((err) => {
        const msg = err?.error?.message || 'Failed to load tasks';
        this.notify.error(msg);
        return of(this.tasks$.value);
      })
    );
  }

  addTask(task: CreateTaskDto): Observable<ResponseData<{}>> {
    const payload: CreateTaskDto = {
      title: task.title || 'Untitled',
      description: task.description || '',
      status: task.status || 0,
      category: task.category || 'General',
    };
    return this.http
      .post<ResponseData<{}>>(`${this.apiUrl}/tasks`, payload)
      .pipe(
        tap(() => {
          this.notify.success('Task created successfully.');
          this.loadTasks().subscribe();
        }),
        catchError((err) => {
          const msg = err?.error?.message || 'Create task failed';
          this.notify.error(msg);
          return of({ success: false, data: {}, message: msg });
        })
      );
  }

  updateTask(updated: Task): Observable<Task> {
    const payload: Partial<Task> = {
      title: updated.title,
      description: updated.description,
      status: typeof updated.status === 'number' ? updated.status : 0,
      category: updated.category,
      order: updated.order,
    };
    const copy = this.tasks$.value.map((t) =>
      t.id === updated.id ? { ...t, ...payload } : t
    );
    this.tasks$.next(copy);
    return this.http
      .put<Task>(`${this.apiUrl}/tasks/${updated.id}`, payload)
      .pipe(
        tap(() => this.notify.success('Task updated successfully.')),
        catchError((err) => {
          const msg = err?.error?.message || 'Update task failed';
          this.notify.error(msg);
          return of(updated);
        })
      );
  }

  deleteTask(id: string): Observable<boolean> {
    this.tasks$.next(this.tasks$.value.filter((t) => t.id !== id));
    return this.http.delete(`${this.apiUrl}/tasks/${id}`).pipe(
      map(() => {
        this.notify.success('Task deleted successfully');
        return true;
      }),
      catchError((err) => {
        const msg = err?.error?.message || 'Delete task failed';
        this.notify.error(msg);
        return of(true);
      })
    );
  }

  reorderTasks(newList: Task[]) {
    this.tasks$.next(newList.map((t, i) => ({ ...t, order: i })));
    this.http
      .post(`${this.apiUrl}/tasks/reorder`, { tasks: this.tasks$.value })
      .subscribe({
        next: () => this.notify.success('Tasks reordered'),
        error: () => {},
      });
  }
}
