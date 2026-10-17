// @vitest-environment happy-dom
import { createElement } from "react";
import { act } from "react";
import { flushSync } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Bot } from "@/state/store";

vi.mock("@/lib/use-owner-or-admin", () => ({ useOwnerOrAdmin: () => true }));
vi.mock("./DesktopCapabilities", async (original) => ({
  ...await original<typeof import("./DesktopCapabilities")>(),
  useDesktopCapabilities: () => ({ capabilities: { dictation: { available: false }, host: { packaged: false, platform: "other" }, localComputer: { available: false } }, ready: true }),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("@/lib/cloud-guest", () => ({ useCanWriteIn: () => true }));

const { Sidebar } = await import("./Sidebar");
const { BotEditorStore, initialState } = await import("@/state/store");
const { setLocale } = await import("@/lib/i18n");

const bot = (id: string, name: string, extra: Partial<Bot> = {}): Bot => ({
  id, name, threadId: `${id}-t`, title: "", description: "", color: "green", unread: false,
  notifications: true, messages: [], modelSelection: { instanceId: "test", model: "test" }, cwd: "/projects/default",
  tasks: [{ threadId: `${id}-t`, title: "Current thread", createdAt: 1 }], ...extra,
});
const bots = [
  bot("marina", "Marina", { chiefOfStaff: true, section: "Tech Mom Ease" }),
  bot("caio", "Caio", { section: "Tech Mom Ease" }),
  bot("clara", "Clara"),
];
let host: HTMLDivElement;
let root: Root;
const render = (showTeam: boolean) => flushSync(() => root.render(createElement(BotEditorStore, {
  value: { state: { ...initialState, connected: true, bots, selectedId: "marina",
    config: { features: { skillAuthoring: true, showTeam } } as typeof initialState.config }, dispatch: vi.fn(),
    flushBotPatches: async () => null, refreshInstances: async () => {}, refreshModels: async () => {} },
  children: createElement(Sidebar, { open: true, onClose: () => {} }),
})));
const listed = () => [...document.querySelectorAll<HTMLElement>("[data-sidebar-bot-row]")].map((row) => row.dataset.sidebarBotRow);
const search = async (text: string) => {
  const input = document.querySelector<HTMLInputElement>('input[aria-label="Search bots and messages"]')!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

beforeEach(() => {
  vi.stubGlobal("fetch", () => new Promise(() => {}));
  setLocale("en");
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  flushSync(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe("the team in the rendered sidebar", () => {
  it("lists only the chiefs while the team is hidden", () => {
    render(false);
    expect(listed()).toEqual(["marina"]);
  });

  it("lists every bot once the team is shown", () => {
    render(true);
    expect(listed().sort()).toEqual(["caio", "clara", "marina"]);
  });

  it("finds a hidden bot by search", async () => {
    render(false);
    await search("caio");
    expect(listed()).toEqual(["caio"]);
  });
});
