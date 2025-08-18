import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { LazyPage } from './components/LazyWrapper';

const HomeUpload = lazy(() => import('./pages/HomeUpload'));
const JobProgress = lazy(() => import('./pages/JobProgress'));
const Results = lazy(() => import('./pages/Results'));
const Jobs = lazy(() => import('./pages/Jobs'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LazyPage>
        <HomeUpload />
      </LazyPage>
    ),
  },
  {
    path: '/job/:jobId',
    element: (
      <LazyPage>
        <JobProgress />
      </LazyPage>
    ),
  },
  {
    path: '/results/:jobId',
    element: (
      <LazyPage>
        <Results />
      </LazyPage>
    ),
  },
  {
    path: '/jobs',
    element: (
      <LazyPage>
        <Jobs />
      </LazyPage>
    ),
  },
]);
