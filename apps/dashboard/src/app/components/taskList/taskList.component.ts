import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Task } from 'libs/data/task';
import { ColumnFilterPipe } from '../../pipes/column-filter.pipe';
import { TaskSearchPipe } from '../../pipes/search.pipe';
import { CategoryFilterPipe } from '../../pipes/category-filter.pipe';
import { StatusFilterPipe } from '../../pipes/status-filter.pipe';
import { TaskSortPipe } from '../../pipes/sort.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ColumnFilterPipe,
    TaskSearchPipe,
    CategoryFilterPipe,
    TaskSortPipe,
    StatusFilterPipe,
  ],
  templateUrl: './taskList.component.html',
})
export class TaskListComponent {
  @Input() tasks: Task[] = [];
  @Output() update = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<string>();
  @Output() reorder = new EventEmitter<Task[]>();

  columns = [
    { key: 'todo', title: 'To do' },
    { key: 'in-progress', title: 'In progress' },
    { key: 'done', title: 'Done' },
  ];

  // UI controls
  searchQuery = '';
  selectedCategory = 'all';
  selectedStatus = 'all';
  private _sortKey = 'status';
  get sortKey() {
    return this._sortKey;
  }
  set sortKey(v: string) {
    this._sortKey = v;
    // reset status filter when not sorting by status
    if (v !== 'status') {
      this.selectedStatus = 'all';
    }
  }
  sortDir: 'asc' | 'desc' = 'asc';

  private dragData: Task | null = null;

  constructor(public auth: AuthService) {}

  onDragStart(evt: DragEvent, t: Task) {
    // Only allow drag (transfer) for admin or owner roles.
    if (!this.isTransferAllowed()) {
      // prevent drag from starting
      evt.preventDefault();
      return;
    }
    this.dragData = t;
    try {
      evt.dataTransfer?.setData('text/plain', t.id);
    } catch {}
  }

  isTransferAllowed(): boolean {
    const role = this.auth.getUserRole();
    return role === 'admin' || role === 'owner';
  }

  onDrop(evt: DragEvent, status: string) {
    evt.preventDefault();
    if (!this.dragData) return;
    // map column keys to numeric status
    const statusMap: Record<string, number> = {
      todo: 0,
      'in-progress': 1,
      done: 2,
    };
    const newStatus = statusMap[status] ?? 0;
    const moved = { ...this.dragData, status: newStatus };
    // persist the moved task's new status and notify parent to reorder
    this.update.emit(moved);
    this.dragData = null;
  }

  toggleDone(t: Task) {
    const updated = {
      ...t,
      status: t.status < 2 ? t.status + 1 : 0,
    };
    this.update.emit(updated);
  }

  remove(t: Task) {
    this.delete.emit(t.id);
  }

  get categories(): string[] {
    const cats = new Set<string>();
    (this.tasks || []).forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
  }
}
