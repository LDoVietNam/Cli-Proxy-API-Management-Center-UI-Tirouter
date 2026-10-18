import { createElement, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useVisualConfig } from '../../src/hooks/useVisualConfig';
import type { VisualConfigValues } from '../../src/types/visualConfig';

/**
 * Exercise the real hook without a browser or management connection.
 *
 * The previous implementation drove phases with setState-during-render under
 * renderToStaticMarkup, which crashes React 19's server renderer under bun
 * (null `diag` channel). This version mounts with a real client root in the
 * jsdom document and advances phases from an effect, awaiting a macrotask
 * between dispatches so reducer updates flush. Async by necessity: callers
 * must `await runVisualConfig(...)`.
 */
export function runVisualConfig(
  yaml?: string,
  patches: Partial<VisualConfigValues>[] = []
): Promise<ReturnType<typeof useVisualConfig>> {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Visual config harness timed out'));
    }, 4000);
    const cleanup = () => {
      clearTimeout(timer);
      try {
        root.unmount();
      } catch {
        // Unmount failures must not mask the real result.
      }
      container.remove();
    };

    function Harness() {
      const api = useVisualConfig();
      const apiRef = useRef(api);
      apiRef.current = api;
      const [started, setStarted] = useState(false);

      useEffect(() => {
        if (started) return;
        setStarted(true);
        const tick = () => new Promise<void>((r) => setTimeout(r, 0));
        (async () => {
          try {
            if (yaml !== undefined) {
              const loaded = apiRef.current.loadVisualValuesFromYaml(yaml);
              if (!loaded.ok) throw new Error(loaded.error);
              await tick();
            }
            for (const patch of patches) {
              apiRef.current.setVisualValues(patch);
              await tick();
            }
            await tick();
            const done = apiRef.current;
            cleanup();
            resolve(done);
          } catch (err) {
            cleanup();
            reject(err);
          }
        })();
      }, [started]);
      return null;
    }

    root.render(createElement(Harness));
  });
}
