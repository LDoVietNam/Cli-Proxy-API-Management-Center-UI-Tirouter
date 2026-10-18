// DOM setup cho bun:test — thay thế vitest environment 'jsdom' + tests/setup.ts
// (bản vitest-specific không tương thích bun: vi.mock không-factory, window ở top-level).
// Bun KHÔNG cung cấp DOM globals và KHÔNG hỗ trợ vi.mock(path) không factory,
// nên preload này tự dựng jsdom instance lên globalThis TRƯỚC khi module graph
// của test được evaluate — nhờ đó @testing-library/dom bind document.body đúng.
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const w = dom.window as any;
const g = globalThis as any;

g.window = w;
g.document = w.document;
g.HTMLElement = w.HTMLElement;
g.HTMLInputElement = w.HTMLInputElement;
g.HTMLTextAreaElement = w.HTMLTextAreaElement;
g.HTMLButtonElement = w.HTMLButtonElement;
g.HTMLAnchorElement = w.HTMLAnchorElement;
g.Element = w.Element;
g.Node = w.Node;
g.Event = w.Event;
g.CustomEvent = w.CustomEvent;
g.MouseEvent = w.MouseEvent;
g.KeyboardEvent = w.KeyboardEvent;
g.MutationObserver = w.MutationObserver;
g.getComputedStyle = w.getComputedStyle.bind(w);
g.requestAnimationFrame = w.requestAnimationFrame.bind(w);
g.cancelAnimationFrame = w.cancelAnimationFrame.bind(w);
g.navigator = w.navigator;
g.localStorage = w.localStorage;
g.location = w.location;
g.history = w.history;

// Browser API mocks cần cho component tree (tương đương tests/setup.ts)
w.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as any;
w.open = () => null as any;
