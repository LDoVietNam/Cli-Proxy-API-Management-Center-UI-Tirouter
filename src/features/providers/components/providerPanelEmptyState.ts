/**
 * Resolves which empty state the provider resource panel should render.
 *
 * The panel has three visually distinct empty situations:
 * - `content`: resources are visible, nothing special to render.
 * - `filterNoMatch`: the provider group has resources, but the current
 *   search/model filters hide all of them. The user should see a
 *   "no matching results" state with a clear-filters CTA.
 * - `emptyGroup`: the provider group has no resources at all. The user
 *   should see the "no resources yet" invitation with a create/register CTA.
 */
export type ProviderPanelEmptyState = 'content' | 'filterNoMatch' | 'emptyGroup';

interface ProviderPanelEmptyStateInput {
  /** Total resources in the active provider group, before any filtering. */
  totalResources: number;
  /** Resources remaining after search + model filters are applied. */
  visibleResources: number;
}

export function resolveProviderPanelEmptyState({
  totalResources,
  visibleResources,
}: ProviderPanelEmptyStateInput): ProviderPanelEmptyState {
  if (totalResources <= 0) return 'emptyGroup';
  if (visibleResources <= 0) return 'filterNoMatch';
  return 'content';
}
