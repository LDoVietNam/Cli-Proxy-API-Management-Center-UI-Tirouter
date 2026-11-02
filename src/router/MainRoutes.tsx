import { Navigate, useRoutes, type Location } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProvidersWorkbenchPage } from '@/features/providers/ProvidersWorkbenchPage';
import { AuthFilesPage } from '@/features/authFiles/AuthFilesPage';
import { AuthFilesOAuthExcludedEditPage } from '@/pages/AuthFilesOAuthExcludedEditPage';
import { AuthFilesOAuthModelAliasEditPage } from '@/pages/AuthFilesOAuthModelAliasEditPage';
import { OAuthPage } from '@/pages/OAuthPage';
import { LogsPage } from '@/pages/LogsPage';
import { SystemPage } from '@/pages/SystemPage';
import { ModelsPage } from '@/features/models/ModelsPage';
import { useAuthStore } from '@/stores';

// Lazy load heavy pages
const QuotaPage = lazy(() => import('@/features/quota/QuotaPage'));
const ConfigPage = lazy(() => import('@/pages/ConfigPage'));
const PluginsPage = lazy(() => import('@/features/plugins/PluginsPage'));
const PluginStorePage = lazy(() => import('@/features/plugins/PluginStorePage'));
const PluginResourcePage = lazy(() => import('@/features/plugins/PluginResourcePage'));
const RTKConfigPage = lazy(() => import('@/features/rtk/RTKConfigPage'));
const PromptsConfigPage = lazy(() => import('@/features/prompts/PromptsConfigPage'));

// Lazy loading fallback
const LazyFallback = () => <div className="lazy-fallback" role="status" aria-label="Loading page..." />;

// Suspense wrapper for lazy components
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LazyFallback />}>{children}</Suspense>;
}

const createMainRoutes = (supportsPlugin: boolean) => [
  { path: '/', element: <DashboardPage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/settings', element: <Navigate to="/config" replace /> },
  { path: '/api-keys', element: <Navigate to="/config" replace /> },
  { path: '/quick-start', element: <Navigate to="/ai-providers" replace /> },
  { path: '/quick-start/*', element: <Navigate to="/ai-providers" replace /> },
  { path: '/ai-providers', element: <ProvidersWorkbenchPage /> },
  { path: '/ai-providers/*', element: <Navigate to="/ai-providers" replace /> },
  { path: '/auth-files', element: <AuthFilesPage /> },
  { path: '/auth-files/oauth-excluded', element: <AuthFilesOAuthExcludedEditPage /> },
  { path: '/auth-files/oauth-model-alias', element: <AuthFilesOAuthModelAliasEditPage /> },
  { path: '/oauth', element: <OAuthPage /> },
  { path: '/quota', element: <SuspenseWrapper><QuotaPage /></SuspenseWrapper> },
  // TASK B: /quota-monitoring hợp nhất thành tab trong /quota — redirect deep-link
  { path: '/quota-monitoring', element: <Navigate to="/quota?tab=monitoring" replace /> },
  { path: '/cli-providers', element: <Navigate to="/" replace /> }, // PRUNED 2026-10-14: backend endpoints missing
  { path: '/models', element: <ModelsPage /> },
  { path: '/taskboard', element: <Navigate to="/" replace /> }, // PRUNED 2026-10-14: backend endpoints missing
  { path: '/compression', element: <Navigate to="/" replace /> }, // PRUNED 2026-10-14: backend endpoints missing
  { path: '/rtk', element: <SuspenseWrapper><RTKConfigPage /></SuspenseWrapper> },
  { path: '/prompts', element: <SuspenseWrapper><PromptsConfigPage /></SuspenseWrapper> },
  { path: '/routing-test', element: <Navigate to="/" replace /> }, // PRUNED 2026-10-14: backend endpoints missing
  ...(supportsPlugin
    ? [
        { path: '/plugin-pages/:pluginId/:menuIndex', element: <SuspenseWrapper><PluginResourcePage /></SuspenseWrapper> },
        { path: '/plugins', element: <SuspenseWrapper><PluginsPage /></SuspenseWrapper> },
        { path: '/plugin-store', element: <SuspenseWrapper><PluginStorePage /></SuspenseWrapper> },
        { path: '/plugins/*', element: <Navigate to="/plugins" replace /> },
      ]
    : [
        { path: '/plugin-pages/*', element: <Navigate to="/" replace /> },
        { path: '/plugins/*', element: <Navigate to="/" replace /> },
        { path: '/plugin-store', element: <Navigate to="/" replace /> },
      ]),
  { path: '/config', element: <SuspenseWrapper><ConfigPage /></SuspenseWrapper> },
  { path: '/logs', element: <LogsPage /> },
  { path: '/system', element: <SystemPage /> },
  { path: '/services', element: <Navigate to="/" replace /> }, // PRUNED 2026-10-14: backend endpoints missing
  { path: '*', element: <Navigate to="/" replace /> },
];

export function MainRoutes({ location }: { location?: Location }) {
  const supportsPlugin = useAuthStore((state) => state.supportsPlugin);
  return useRoutes(createMainRoutes(supportsPlugin), location);
}
