import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'theme';

  isDark(): boolean {
    try {
      return document.documentElement.classList.contains('dark') || localStorage.getItem(this.storageKey) === 'dark';
    } catch {
      return false;
    }
  }

  setDark(value: boolean) {
    try {
      if (value) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem(this.storageKey, value ? 'dark' : 'light');
    } catch {
      // ignore (server-side renders or restricted environments)
    }
  }

  toggle(): boolean {
    const next = !this.isDark();
    this.setDark(next);
    return next;
  }

  init() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'dark') this.setDark(true);
      else if (stored === 'light') this.setDark(false);
      else {
        // Respect system preference when no explicit choice
        const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setDark(!!prefersDark);
      }
    } catch {
      // ignore
    }
  }
}
