// Comprehensive Internal Audit and Validation Utility for Kenya Location Dataset
// For developer verification and regression prevention (not exposed in production UI)

import {
  KENYA_LOCATIONS_DATA,
  KENYA_SUBCOUNTY_ALIASES,
  KenyaCounty,
  KenyaSubCounty,
  KenyaWard
} from '../data/kenyaLocationData';
import {
  getCounties,
  getSubCountiesInCounty,
  getWardsInSubCounty,
  resolveSubCountyName
} from './kenyaLocations';

export interface AuditReport {
  timestamp: string;
  totalCounties: number;
  totalSubCounties: number;
  totalWards: number;
  totalAliases: number;
  subCountiesWithZeroWards: { county: string; subCounty: string }[];
  duplicateWardsInSubCounty: { county: string; subCounty: string; duplicateWard: string }[];
  invalidParentMappings: { county: string; subCounty: string; reason: string }[];
  brokenAliases: { aliasKey: string; target: string; reason: string }[];
  countyBreakdown: {
    code: string;
    name: string;
    subCountyCount: number;
    wardCount: number;
  }[];
  passed: boolean;
  errors: string[];
}

/**
 * Runs a complete structural and data-integrity audit on the Kenya Location dataset.
 */
export function runKenyaLocationAudit(): AuditReport {
  const errors: string[] = [];
  const subCountiesWithZeroWards: { county: string; subCounty: string }[] = [];
  const duplicateWardsInSubCounty: { county: string; subCounty: string; duplicateWard: string }[] = [];
  const invalidParentMappings: { county: string; subCounty: string; reason: string }[] = [];
  const brokenAliases: { aliasKey: string; target: string; reason: string }[] = [];

  let totalSubCounties = 0;
  let totalWards = 0;

  const countyBreakdown: AuditReport['countyBreakdown'] = [];

  // 1. Audit all 47 counties
  const counties = getCounties();
  if (counties.length !== 47) {
    errors.push(`Expected exactly 47 counties, found ${counties.length}`);
  }

  // Set of all county names
  const countyNamesSet = new Set(counties.map((c) => c.name.toLowerCase()));

  KENYA_LOCATIONS_DATA.forEach((county) => {
    let countyWardCount = 0;
    const subCounties = county.subCounties;
    totalSubCounties += subCounties.length;

    if (!county.name || !county.code) {
      invalidParentMappings.push({
        county: county.name || 'UNKNOWN',
        subCounty: 'N/A',
        reason: 'Missing county name or code'
      });
    }

    subCounties.forEach((sub) => {
      if (sub.county.toLowerCase() !== county.name.toLowerCase()) {
        invalidParentMappings.push({
          county: county.name,
          subCounty: sub.name,
          reason: `Sub-county parent mismatch: points to "${sub.county}" instead of "${county.name}"`
        });
      }

      const wards = sub.wards;
      if (!wards || wards.length === 0) {
        subCountiesWithZeroWards.push({ county: county.name, subCounty: sub.name });
      } else {
        totalWards += wards.length;
        countyWardCount += wards.length;

        // Check for duplicates within the same sub-county
        const seenWards = new Set<string>();
        wards.forEach((w) => {
          const lowerWard = w.name.toLowerCase();
          if (seenWards.has(lowerWard)) {
            duplicateWardsInSubCounty.push({
              county: county.name,
              subCounty: sub.name,
              duplicateWard: w.name
            });
          }
          seenWards.add(lowerWard);
        });
      }

      // Test resolving through getter function
      const resolvedWards = getWardsInSubCounty(sub.name, county.name);
      if (resolvedWards.length === 0) {
        errors.push(`Getter getWardsInSubCounty("${sub.name}", "${county.name}") unexpectedly returned 0 wards`);
      }
    });

    countyBreakdown.push({
      code: county.code,
      name: county.name,
      subCountyCount: subCounties.length,
      wardCount: countyWardCount
    });
  });

  // 2. Audit all aliases
  const aliasEntries = Object.entries(KENYA_SUBCOUNTY_ALIASES);
  aliasEntries.forEach(([aliasKey, targetSubName]) => {
    // Determine if alias has a county prefix
    let countyPrefix: string | undefined;
    let subAlias: string = aliasKey;
    if (aliasKey.includes(':')) {
      const parts = aliasKey.split(':');
      countyPrefix = parts[0];
      subAlias = parts[1];
    }

    const wards = getWardsInSubCounty(subAlias, countyPrefix);
    if (wards.length === 0) {
      brokenAliases.push({
        aliasKey,
        target: targetSubName,
        reason: `Alias "${aliasKey}" -> "${targetSubName}" resolved to 0 wards`
      });
    }
  });

  if (subCountiesWithZeroWards.length > 0) {
    errors.push(`Found ${subCountiesWithZeroWards.length} sub-counties with 0 wards`);
  }
  if (duplicateWardsInSubCounty.length > 0) {
    errors.push(`Found ${duplicateWardsInSubCounty.length} duplicate wards`);
  }
  if (invalidParentMappings.length > 0) {
    errors.push(`Found ${invalidParentMappings.length} invalid parent mappings`);
  }
  if (brokenAliases.length > 0) {
    errors.push(`Found ${brokenAliases.length} broken aliases`);
  }

  const passed = errors.length === 0;

  return {
    timestamp: new Date().toISOString(),
    totalCounties: counties.length,
    totalSubCounties,
    totalWards,
    totalAliases: aliasEntries.length,
    subCountiesWithZeroWards,
    duplicateWardsInSubCounty,
    invalidParentMappings,
    brokenAliases,
    countyBreakdown,
    passed,
    errors
  };
}
