import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/settings-home/settings-home.component').then((m) => m.SettingsHomeComponent),
  },
];
