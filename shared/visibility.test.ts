import { describe, expect, it } from "vitest";
import { visibleBots } from "./visibility";

const marina = { id: "marina", chiefOfStaff: true };
const leo = { id: "leo", chiefOfStaff: true };
const caio = { id: "caio" };
const tati = { id: "tati", chiefOfStaff: false };
const bots = [caio, marina, tati, leo];
const ids = (list: { id: string }[]) => list.map((bot) => bot.id);

describe("which bots the sidebar lists", () => {
  it("shows only the chief bots by default", () => {
    expect(ids(visibleBots(bots, { showTeam: false, searching: false }))).toEqual(["marina", "leo"]);
  });

  it("shows every bot when the team is shown", () => {
    expect(ids(visibleBots(bots, { showTeam: true, searching: false }))).toEqual(["caio", "marina", "tati", "leo"]);
  });

  it("shows a new bot created as chief and hides one created as member", () => {
    const created = [...bots, { id: "nova", chiefOfStaff: true }, { id: "novo" }];
    expect(ids(visibleBots(created, { showTeam: false, searching: false }))).toEqual(["marina", "leo", "nova"]);
  });

  it("lets a search reach every bot", () => {
    expect(ids(visibleBots(bots, { showTeam: false, searching: true }))).toEqual(["caio", "marina", "tati", "leo"]);
  });
});
