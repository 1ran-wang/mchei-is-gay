// Will be populated from OpenDota heroes endpoint
let heroCache: Record<number, string> | null = null;

export async function getHeroName(heroId: number): Promise<string> {
  if (!heroCache) {
    const res = await fetch("https://api.opendota.com/api/heroes");
    const heroes = await res.json();
    heroCache = {};
    for (const h of heroes) {
      heroCache[h.id] = h.localized_name;
    }
  }
  return heroCache[heroId] || `Hero ${heroId}`;
}

export async function getAllHeroes(): Promise<Record<number, string>> {
  if (!heroCache) {
    await getHeroName(1); // trigger cache
  }
  return heroCache!;
}
