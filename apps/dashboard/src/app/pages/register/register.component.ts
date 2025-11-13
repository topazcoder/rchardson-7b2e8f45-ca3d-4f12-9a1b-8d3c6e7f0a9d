import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);

  username = '';
  password = '';
  confirmPassword = '';
  error = '';
  role = 'owner';

  signupForm: FormGroup;
  organizations: { id: string; name?: string }[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private organization: OrganizationService
  ) {
    this.signupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
      role: ['owner', Validators.required],
      organizationName: [''],
      parentOrganizationId: ['', Validators.required],
    });
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.organization.getParentOrganizations().subscribe((data) => {
      console.log(data);
      this.organizations = Array.isArray(data) ? data : [];
      if (this.organizations.length > 0) {
        this.signupForm
          .get('parentOrganizationId')
          ?.setValue(this.organizations[0].id);
      }
    });
  }

  onRoleChange(): void {
    this.role = this.signupForm.get('role')?.value;
    if (this.role === 'owner') {
      this.organization.getParentOrganizations().subscribe((data) => {
        this.organizations = data;
        this.signupForm.get('parentOrganization')?.setValue(data[0].id);
      });
    } else {
      this.organization.getOrganizations().subscribe((data) => {
        this.organizations = data;
        this.signupForm.get('organization')?.setValue(data[0].id);
      });
    }
  }

  submit() {
    if (this.signupForm.get('email')?.value === '') {
      this.error = 'Email cannot be empty';
      return;
    }
    if (this.signupForm.get('username')?.value === '') {
      this.error = 'Username cannot be empty';
      return;
    }
    if (
      this.signupForm.get('password')?.value === '' ||
      this.signupForm.get('confirmPassword')?.value === ''
    ) {
      this.error = 'Password fields cannot be empty';
      return;
    }
    if (
      this.signupForm.get('password')?.value !==
      this.signupForm.get('confirmPassword')?.value
    ) {
      this.error = 'Passwords do not match';
      return;
    }
    if (
      this.signupForm.get('role')?.value === 'owner' &&
      this.signupForm.get('organizationName')?.value === ''
    ) {
      this.error = 'Organization Name cannot be empty';
      return;
    }

    this.auth.register(this.signupForm.value).subscribe((data) => {
      console.log(data);
      if (data.success) {
        this.router.navigate(['/']);
      } else {
        this.error = data.message || 'Registration failed';
      }
    });
  }

  login() {
    this.router.navigate(['/login']);
  }
}
