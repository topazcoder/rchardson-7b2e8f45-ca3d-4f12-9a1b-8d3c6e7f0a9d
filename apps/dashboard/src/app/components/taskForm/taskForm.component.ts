import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CreateTaskDto } from 'libs/data/task';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './taskForm.component.html',
})
export class TaskFormComponent {
  title = '';
  category = '';
  description = '';

  @Output() create = new EventEmitter<CreateTaskDto>();

  submit() {
    if (!this.title.trim()) return;
    this.create.emit({
      title: this.title,
      category: this.category || 'General',
      description: this.description,
      status: 0,
    });
    this.clear();
  }

  clear() {
    this.title = '';
    this.category = '';
    this.description = '';
  }
}
