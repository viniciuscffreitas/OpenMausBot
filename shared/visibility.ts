export interface VisibilitySettings {
  showTeam: boolean;
  searching: boolean;
}

export function visibleBots<T extends { chiefOfStaff?: boolean }>(bots: T[], settings: VisibilitySettings): T[] {
  if (settings.showTeam || settings.searching) return bots;
  return bots.filter((bot) => bot.chiefOfStaff === true);
}
