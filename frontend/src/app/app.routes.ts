import { Routes } from '@angular/router';
import { DailyDigestComponent } from './features/daily-digest/daily-digest.component';
import { ArchiveCalendarComponent } from './features/archive-calendar/archive-calendar.component';
import { BookmarksComponent } from './features/bookmarks/bookmarks.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { ExamZoneComponent } from './features/exam-zone/exam-zone.component';
import { RrbAgricultureComponent } from './features/rrb-agriculture/rrb-agriculture.component';

export const routes: Routes = [
  {
    path: '',
    component: DailyDigestComponent,
    title: 'BankDCA - Today\'s Banking Current Affairs'
  },
  {
    path: 'date/:date',
    component: DailyDigestComponent,
    title: 'BankDCA - Date Wise Notes'
  },
  {
    path: 'exam-zone',
    component: ExamZoneComponent,
    title: 'BankDCA - Exam Target Zone & Expected Questions'
  },
  {
    path: 'rrb-agriculture',
    component: RrbAgricultureComponent,
    title: 'BankDCA - RRB & Agriculture Banking Special'
  },
  {
    path: 'archive',
    component: ArchiveCalendarComponent,
    title: 'BankDCA - Calendar & Date Archive'
  },
  {
    path: 'bookmarks',
    component: BookmarksComponent,
    title: 'BankDCA - Saved Revision Notes'
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    title: 'BankDCA - Operations & Automation Admin'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
