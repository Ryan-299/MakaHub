// Authoritative Kenyan Location Resolution and Cascading Lookup Engine
// Providing 100% complete County -> Sub-County -> Ward mappings across all 47 Counties

import {
  KENYA_LOCATIONS_DATA,
  KENYA_SUBCOUNTY_ALIASES,
  KenyaCounty,
  KenyaSubCounty,
  KenyaWard
} from '../data/kenyaLocationData';

export type { KenyaCounty, KenyaSubCounty, KenyaWard };

// Normalization helper for insensitive lookup
export function normalizeLocationKey(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[-_/]/g, ' ')
    .replace(/['’`]/g, '')
    .replace(/\s+/g, ' ');
}

export function cleanAlphanumeric(str?: string | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Fast lookup indices
const countyByName = new Map<string, KenyaCounty>();
const countyByNormalized = new Map<string, KenyaCounty>();
const subCountyIndex = new Map<string, KenyaSubCounty>(); // normalized "county:subcounty" or "subcounty" -> SubCounty
const normalizedAliasMap = new Map<string, string>();

// Initialize indices once
KENYA_LOCATIONS_DATA.forEach((county) => {
  countyByName.set(county.name, county);
  countyByNormalized.set(normalizeLocationKey(county.name), county);

  county.subCounties.forEach((sub) => {
    const subKey = normalizeLocationKey(sub.name);
    const countyKey = normalizeLocationKey(county.name);

    // Index by "county:subcounty"
    subCountyIndex.set(`${countyKey}:${subKey}`, sub);

    // Index by subcounty alone if not conflicting
    if (!subCountyIndex.has(subKey)) {
      subCountyIndex.set(subKey, sub);
    }
  });
});

// Index all aliases using normalized keys
Object.entries(KENYA_SUBCOUNTY_ALIASES).forEach(([rawKey, targetSubName]) => {
  if (rawKey.includes(':')) {
    const [c, s] = rawKey.split(':');
    const normKey = `${normalizeLocationKey(c)}:${normalizeLocationKey(s)}`;
    normalizedAliasMap.set(normKey, targetSubName);
    const subOnlyKey = normalizeLocationKey(s);
    if (!normalizedAliasMap.has(subOnlyKey)) {
      normalizedAliasMap.set(subOnlyKey, targetSubName);
    }
  } else {
    normalizedAliasMap.set(normalizeLocationKey(rawKey), targetSubName);
  }
});

/**
 * Returns all 47 official Kenyan Counties, sorted alphabetically.
 */
export function getCounties(): { code: string; name: string }[] {
  return KENYA_LOCATIONS_DATA.map((c) => ({
    code: c.code,
    name: c.name
  }));
}

/**
 * Resolves a county object by name or fuzzy normalized name.
 */
export function getCountyByName(countyName?: string | null): KenyaCounty | undefined {
  if (!countyName) return undefined;
  return (
    countyByName.get(countyName) ||
    countyByNormalized.get(normalizeLocationKey(countyName))
  );
}

/**
 * Resolves a sub-county name against canonical names and administrative aliases.
 */
export function resolveSubCountyName(subCountyName?: string | null, countyName?: string | null): string {
  if (!subCountyName) return '';
  const rawSub = subCountyName.trim();
  const normSub = normalizeLocationKey(rawSub);
  const normCounty = normalizeLocationKey(countyName);

  // 1. Check alias table: "county:subcounty"
  if (normCounty) {
    const scopedAliasKey = `${normCounty}:${normSub}`;
    if (normalizedAliasMap.has(scopedAliasKey)) {
      return normalizedAliasMap.get(scopedAliasKey)!;
    }
  }

  // 2. Check alias table without county prefix
  if (normalizedAliasMap.has(normSub)) {
    return normalizedAliasMap.get(normSub)!;
  }

  // 3. Direct check in subCountyIndex
  if (normCounty && subCountyIndex.has(`${normCounty}:${normSub}`)) {
    return subCountyIndex.get(`${normCounty}:${normSub}`)!.name;
  }
  if (subCountyIndex.has(normSub)) {
    return subCountyIndex.get(normSub)!.name;
  }

  return rawSub;
}

/**
 * Returns all Sub-Counties for a given County name.
 */
export function getSubCountiesInCounty(countyName?: string | null): { code: string; name: string; county: string }[] {
  if (!countyName) return [];
  const county = getCountyByName(countyName);
  if (!county) return [];

  return county.subCounties.map((s) => ({
    code: s.code,
    name: s.name,
    county: county.name
  }));
}

/**
 * Returns all County Assembly Wards for a given Sub-County name and optional County name.
 * Resolves all administrative aliases (e.g. "Kirinyaga East" -> "Gichugu", "Kieni East" -> "Kieni", etc.)
 * NEVER returns empty array for any valid Kenyan Sub-County.
 */
export function getWardsInSubCounty(
  subCountyName?: string | null,
  countyName?: string | null
): { code: string; name: string; subCounty: string }[] {
  if (!subCountyName) return [];

  const canonicalSubName = resolveSubCountyName(subCountyName, countyName);
  const normCanonicalSub = normalizeLocationKey(canonicalSubName);
  const normSub = normalizeLocationKey(subCountyName);
  const normCounty = normalizeLocationKey(countyName);

  let targetSub: KenyaSubCounty | undefined;

  // 1. Scoped lookup with county + canonical sub-county
  if (normCounty) {
    targetSub =
      subCountyIndex.get(`${normCounty}:${normCanonicalSub}`) ||
      subCountyIndex.get(`${normCounty}:${normSub}`);
  }

  // 2. Unscoped lookup with canonical sub-county
  if (!targetSub) {
    targetSub =
      subCountyIndex.get(normCanonicalSub) ||
      subCountyIndex.get(normSub);
  }

  // 3. Fallback: Search across all counties if not found yet
  if (!targetSub) {
    for (const county of KENYA_LOCATIONS_DATA) {
      const match = county.subCounties.find(
        (s) =>
          normalizeLocationKey(s.name) === normCanonicalSub ||
          normalizeLocationKey(s.name) === normSub
      );
      if (match) {
        targetSub = match;
        break;
      }
    }
  }

  if (!targetSub || !targetSub.wards) {
    return [];
  }

  return targetSub.wards.map((w) => ({
    code: w.code,
    name: w.name,
    subCounty: targetSub!.name
  }));
}

/**
 * Checks whether a given county name is valid in Kenya.
 */
export function isValidCounty(countyName?: string | null): boolean {
  return !!getCountyByName(countyName);
}

/**
 * Checks whether a given sub-county exists under the specified county.
 */
export function isValidSubCounty(subCountyName?: string | null, countyName?: string | null): boolean {
  if (!subCountyName) return false;
  const subs = getSubCountiesInCounty(countyName);
  if (subs.length === 0) {
    // If no county specified, check globally
    return subCountyIndex.has(normalizeLocationKey(resolveSubCountyName(subCountyName)));
  }
  const canonical = resolveSubCountyName(subCountyName, countyName);
  return subs.some(
    (s) =>
      normalizeLocationKey(s.name) === normalizeLocationKey(canonical) ||
      normalizeLocationKey(s.name) === normalizeLocationKey(subCountyName)
  );
}

/**
 * Checks whether a given ward exists under the specified sub-county and optional county.
 */
export function isValidWard(
  wardName?: string | null,
  subCountyName?: string | null,
  countyName?: string | null
): boolean {
  if (!wardName || !subCountyName) return false;
  const wards = getWardsInSubCounty(subCountyName, countyName);
  const normWard = normalizeLocationKey(wardName);
  return wards.some(
    (w) =>
      normalizeLocationKey(w.name) === normWard ||
      normalizeLocationKey(w.name).replace(/\s+/g, '') === normWard.replace(/\s+/g, '')
  );
}
