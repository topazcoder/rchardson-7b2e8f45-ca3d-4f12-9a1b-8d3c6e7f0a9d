import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { CreateTaskDto, Task } from 'libs/data/task';

import { TaskFormComponent } from '../../components/taskForm/taskForm.component';
import { TaskListComponent } from '../../components/taskList/taskList.component';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../layout/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    TaskFormComponent,
    TaskListComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  tasks: Task[] = [];
  isLoggedIn = false;
  username = '';
  canCreate = false;

  constructor(
    private ts: TaskService,
    private auth: AuthService,
    private router: Router
  ) {
    this.ts.value$.subscribe(
      (v) => (this.tasks = v.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
    );
    this.isLoggedIn = this.auth.isLoggedIn();
    effect(() => {
      this.isLoggedIn = this.auth.isLoggedIn();
    });

    this.username = this.auth.getUserName() || '';
    this.canCreate = ['owner', 'admin'].includes(this.auth.getUserRole() || '');

    this.auth.token$.subscribe(() => {
      this.canCreate = ['owner', 'admin'].includes(
        this.auth.getUserRole() || ''
      );
    });

    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.ts.loadTasks().subscribe();
  }

  get progress() {
    if (!this.tasks.length) return 0;
    const done = this.tasks.filter((t) => t.status === 2).length;
    return Math.round((done / this.tasks.length) * 100);
  }

  onCreate(payload: CreateTaskDto) {
    console.log('Creating task:', payload);
    this.ts.addTask(payload).subscribe((data) => {
      if (data.success) {
        this.ts.loadTasks().subscribe();
      }
    });
  }

  onUpdate(task: Task) {
    this.ts.updateTask(task).subscribe();
  }

  onDelete(id: string) {
    this.ts.deleteTask(id).subscribe();
  }

  onReorder(list: Task[]) {
    this.ts.reorderTasks(list);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
  }
}
