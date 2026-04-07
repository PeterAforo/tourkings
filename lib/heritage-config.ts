export type HeritageMedalConfig = {
  id: string;
  name: string;
  tier: string;
  requirement: string;
  xpYield: string;
  iconKey: string;
};

export type HeritageConfig = {
  pointsPerGhsSaved: number;
  pointsPerTourCompletion: number;
  medals: HeritageMedalConfig[];
};

export const DEFAULT_HERITAGE_CONFIG: HeritageConfig = {
  pointsPerGhsSaved: 12,
  pointsPerTourCompletion: 500,
  medals: [
    {
      id: "1",
      name: "Historian",
      tier: "COMMON",
      requirement: "Visit 5 coastal sites",
      xpYield: "250",
      iconKey: "history_edu",
    },
    {
      id: "2",
      name: "Fortress Explorer",
      tier: "RARE",
      requirement: "Unlock 3 regional forts",
      xpYield: "1200",
      iconKey: "castle",
    },
    {
      id: "3",
      name: "Canopy Walker",
      tier: "EPIC",
      requirement: "Complete a canopy walk booking",
      xpYield: "2400",
      iconKey: "eco",
    },
  ],
};

export function parseHeritageConfig(raw: unknown): HeritageConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_HERITAGE_CONFIG, medals: DEFAULT_HERITAGE_CONFIG.medals.map((m) => ({ ...m })) };
  const o = raw as Record<string, unknown>;
  const medalsRaw = Array.isArray(o.medals) ? o.medals : [];
  const medals = medalsRaw.length
    ? medalsRaw.map((m, i) => {
        const row = (m || {}) as Record<string, unknown>;
        return {
          id: typeof row.id === "string" ? row.id : String(i + 1),
          name: typeof row.name === "string" ? row.name : DEFAULT_HERITAGE_CONFIG.medals[i]?.name ?? `Medal ${i + 1}`,
          tier: typeof row.tier === "string" ? row.tier : "COMMON",
          requirement: typeof row.requirement === "string" ? row.requirement : "",
          xpYield: typeof row.xpYield === "string" ? row.xpYield : "",
          iconKey: typeof row.iconKey === "string" ? row.iconKey : "star",
        };
      })
    : DEFAULT_HERITAGE_CONFIG.medals.map((m) => ({ ...m }));
  return {
    pointsPerGhsSaved:
      typeof o.pointsPerGhsSaved === "number" && !Number.isNaN(o.pointsPerGhsSaved)
        ? o.pointsPerGhsSaved
        : DEFAULT_HERITAGE_CONFIG.pointsPerGhsSaved,
    pointsPerTourCompletion:
      typeof o.pointsPerTourCompletion === "number" && !Number.isNaN(o.pointsPerTourCompletion)
        ? o.pointsPerTourCompletion
        : DEFAULT_HERITAGE_CONFIG.pointsPerTourCompletion,
    medals,
  };
}
