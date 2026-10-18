import { describe, expect, test } from 'bun:test';
import {
  resolveProviderPanelEmptyState,
  type ProviderPanelEmptyState,
} from '../src/features/providers/components/providerPanelEmptyState';

describe('resolveProviderPanelEmptyState', () => {
  test('returns content when filtered resources are visible', () => {
    expect(
      resolveProviderPanelEmptyState({ totalResources: 5, visibleResources: 2 })
    ).toBe<ProviderPanelEmptyState>('content');
  });

  test('returns content when all resources are visible', () => {
    expect(
      resolveProviderPanelEmptyState({ totalResources: 3, visibleResources: 3 })
    ).toBe<ProviderPanelEmptyState>('content');
  });

  test('returns filterNoMatch when the group has resources but none match filters', () => {
    expect(
      resolveProviderPanelEmptyState({ totalResources: 4, visibleResources: 0 })
    ).toBe<ProviderPanelEmptyState>('filterNoMatch');
  });

  test('returns emptyGroup when the provider group has no resources at all', () => {
    expect(
      resolveProviderPanelEmptyState({ totalResources: 0, visibleResources: 0 })
    ).toBe<ProviderPanelEmptyState>('emptyGroup');
  });

  test('never returns filterNoMatch for an empty group even with active filters', () => {
    // A group with zero resources has nothing to filter — the "no resources yet"
    // invitation is the correct state, not a "no matching results" state.
    expect(
      resolveProviderPanelEmptyState({ totalResources: 0, visibleResources: 0 })
    ).toBe<ProviderPanelEmptyState>('emptyGroup');
  });

  test('defensive: empty group with negative visible resources returns emptyGroup', () => {
    expect(
      resolveProviderPanelEmptyState({ totalResources: 0, visibleResources: -1 })
    ).toBe<ProviderPanelEmptyState>('emptyGroup');
  });

  test('clamps negative counts defensively', () => {
    expect(
      resolveProviderPanelEmptyState({ totalResources: -1, visibleResources: -5 })
    ).toBe<ProviderPanelEmptyState>('emptyGroup');
    expect(
      resolveProviderPanelEmptyState({ totalResources: 2, visibleResources: -1 })
    ).toBe<ProviderPanelEmptyState>('filterNoMatch');
  });
});
