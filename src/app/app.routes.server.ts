import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'auth/login', renderMode: RenderMode.Prerender },
  { path: 'auth/signup', renderMode: RenderMode.Prerender },
  { path: 'trips', renderMode: RenderMode.Prerender },
  { path: 'trips/new', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
