// Coordinate dataset and geocoding helper for Kenyan Counties, Sub-Counties, Wards, Estates and Properties

import { resolveSubCountyName } from './kenyaLocations';
import { KENYA_LOCATIONS_DATA } from '../data/kenyaLocationData';
import { PropertyListing } from '../types';

export interface GeocodedLocation {
  lat: number;
  lng: number;
  zoom: number;
  level: 'property' | 'estate' | 'ward' | 'subCounty' | 'county' | 'country';
  displayName: string;
}

export interface AutocompleteSuggestion {
  id: string;
  label: string;
  subLabel: string;
  category: 'property' | 'estate' | 'ward' | 'subCounty' | 'county';
  lat: number;
  lng: number;
  zoom: number;
  county?: string;
  subCounty?: string;
  ward?: string;
  estate?: string;
  propertyId?: string;
  propertyPrice?: number;
  propertyType?: string;
  listingCount?: number;
}

// All 47 Kenyan Counties with geographic centers
export const KENYA_COUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  mombasa: { lat: -4.0435, lng: 39.6682 },
  kwale: { lat: -4.1744, lng: 39.4606 },
  kilifi: { lat: -3.5107, lng: 39.9093 },
  'tana river': { lat: -1.487, lng: 39.8466 },
  tanariver: { lat: -1.487, lng: 39.8466 },
  lamu: { lat: -2.2696, lng: 40.9006 },
  'taita taveta': { lat: -3.3161, lng: 38.3582 },
  'taita/taveta': { lat: -3.3161, lng: 38.3582 },
  'taita-taveta': { lat: -3.3161, lng: 38.3582 },
  garissa: { lat: -0.4532, lng: 39.646 },
  wajir: { lat: 1.7471, lng: 40.0573 },
  mandera: { lat: 3.9373, lng: 41.8569 },
  marsabit: { lat: 2.3347, lng: 37.9899 },
  isiolo: { lat: 0.3546, lng: 37.5822 },
  meru: { lat: 0.0463, lng: 37.6559 },
  'tharaka-nithi': { lat: -0.2965, lng: 37.7262 },
  'tharaka nithi': { lat: -0.2965, lng: 37.7262 },
  embu: { lat: -0.5348, lng: 37.4571 },
  kitui: { lat: -1.3628, lng: 38.0106 },
  machakos: { lat: -1.5177, lng: 37.2634 },
  makueni: { lat: -1.7828, lng: 37.6288 },
  nyandarua: { lat: -0.1804, lng: 36.5229 },
  nyeri: { lat: -0.4197, lng: 36.9511 },
  kirinyaga: { lat: -0.4996, lng: 37.2803 },
  "murang'a": { lat: -0.7189, lng: 37.1528 },
  muranga: { lat: -0.7189, lng: 37.1528 },
  kiambu: { lat: -1.1714, lng: 36.8356 },
  turkana: { lat: 3.1167, lng: 35.5966 },
  'west pokot': { lat: 1.2333, lng: 35.1167 },
  samburu: { lat: 1.2155, lng: 36.6908 },
  'trans nzoia': { lat: 1.0566, lng: 34.9542 },
  'trans-nzoia': { lat: 1.0566, lng: 34.9542 },
  'uasin gishu': { lat: 0.5143, lng: 35.2698 },
  'elgeyo marakwet': { lat: 0.8037, lng: 35.5539 },
  'elgeyo/marakwet': { lat: 0.8037, lng: 35.5539 },
  'elgeyo-marakwet': { lat: 0.8037, lng: 35.5539 },
  nandi: { lat: 0.1836, lng: 35.1056 },
  baringo: { lat: 0.5186, lng: 35.9723 },
  laikipia: { lat: 0.3606, lng: 36.782 },
  nakuru: { lat: -0.3031, lng: 36.08 },
  narok: { lat: -1.0833, lng: 35.8667 },
  kajiado: { lat: -2.0981, lng: 36.782 },
  kericho: { lat: -0.3689, lng: 35.2863 },
  bomet: { lat: -0.7813, lng: 35.3416 },
  kakamega: { lat: 0.2827, lng: 34.7519 },
  vihiga: { lat: 0.0827, lng: 34.7225 },
  bungoma: { lat: 0.5695, lng: 34.5584 },
  busia: { lat: 0.4608, lng: 34.1115 },
  siaya: { lat: 0.0607, lng: 34.2882 },
  kisumu: { lat: -0.0917, lng: 34.768 },
  'homa bay': { lat: -0.5273, lng: 34.4571 },
  homabay: { lat: -0.5273, lng: 34.4571 },
  migori: { lat: -1.0634, lng: 34.4731 },
  kisii: { lat: -0.6817, lng: 34.7667 },
  nyamira: { lat: -0.5633, lng: 34.9358 },
  nairobi: { lat: -1.286389, lng: 36.817223 },
  'nairobi city': { lat: -1.286389, lng: 36.817223 }
};

// Kenyan Sub-Counties / Constituencies geographic coordinates
export const KENYA_SUBCOUNTY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Nairobi Sub-Counties
  'nairobi:kasarani': { lat: -1.2223, lng: 36.9015 },
  'nairobi:westlands': { lat: -1.2676, lng: 36.8115 },
  'nairobi:dagoretti north': { lat: -1.2892, lng: 36.762 },
  'nairobi:dagoretti south': { lat: -1.3061, lng: 36.7455 },
  'nairobi:langata': { lat: -1.3475, lng: 36.7588 },
  "nairobi:lang'ata": { lat: -1.3475, lng: 36.7588 },
  'nairobi:kibra': { lat: -1.3142, lng: 36.7865 },
  'nairobi:roysambu': { lat: -1.2185, lng: 36.8872 },
  'nairobi:ruaraka': { lat: -1.2468, lng: 36.8778 },
  'nairobi:embakasi south': { lat: -1.3417, lng: 36.8953 },
  'nairobi:embakasi north': { lat: -1.2582, lng: 36.8931 },
  'nairobi:embakasi central': { lat: -1.2783, lng: 36.9042 },
  'nairobi:embakasi east': { lat: -1.2917, lng: 36.9278 },
  'nairobi:embakasi west': { lat: -1.2889, lng: 36.8833 },
  'nairobi:makadara': { lat: -1.3006, lng: 36.8583 },
  'nairobi:kamukunji': { lat: -1.2847, lng: 36.8436 },
  'nairobi:starehe': { lat: -1.275, lng: 36.8286 },
  'nairobi:mathare': { lat: -1.2614, lng: 36.8589 },

  // Kirinyaga Sub-Counties
  'kirinyaga:gichugu': { lat: -0.45, lng: 37.3333 },
  'kirinyaga:kirinyaga east': { lat: -0.45, lng: 37.3333 },
  'kirinyaga:kirinyaga central': { lat: -0.4996, lng: 37.2803 },
  'kirinyaga:mwea': { lat: -0.6667, lng: 37.3667 },
  'kirinyaga:mwea east': { lat: -0.6667, lng: 37.3667 },
  'kirinyaga:mwea west': { lat: -0.6667, lng: 37.3667 },
  'kirinyaga:ndia': { lat: -0.55, lng: 37.2167 },
  'kirinyaga:kirinyaga west': { lat: -0.55, lng: 37.2167 },

  // Nyeri Sub-Counties
  'nyeri:kieni': { lat: -0.3167, lng: 36.9833 },
  'nyeri:kieni east': { lat: -0.3167, lng: 36.9833 },
  'nyeri:kieni west': { lat: -0.3167, lng: 36.9833 },
  'nyeri:mathira': { lat: -0.4833, lng: 37.1167 },
  'nyeri:mathira east': { lat: -0.4833, lng: 37.1167 },
  'nyeri:mathira west': { lat: -0.4833, lng: 37.1167 },
  'nyeri:mukurweini': { lat: -0.5667, lng: 37.05 },
  'nyeri:mukurwe-ini': { lat: -0.5667, lng: 37.05 },
  'nyeri:mkurweni': { lat: -0.5667, lng: 37.05 },
  'nyeri:nyeri town': { lat: -0.4197, lng: 36.9511 },
  'nyeri:othaya': { lat: -0.55, lng: 36.9333 },
  'nyeri:tetu': { lat: -0.4333, lng: 36.9 },

  // Wajir Sub-Counties
  'wajir:wajir north': { lat: 2.5539, lng: 39.5539 },
  'wajir:wajir east': { lat: 1.7471, lng: 40.0573 },
  'wajir:tarbaj': { lat: 2.1667, lng: 40.0833 },
  'wajir:wajir west': { lat: 1.6333, lng: 39.5833 },
  'wajir:eldas': { lat: 2.3833, lng: 39.5833 },
  'wajir:wajir south': { lat: 1.0833, lng: 40.25 },

  // Kiambu Sub-Counties
  'kiambu:ruiru': { lat: -1.1467, lng: 36.9611 },
  'kiambu:thika town': { lat: -1.0333, lng: 37.0694 },
  'kiambu:thika': { lat: -1.0333, lng: 37.0694 },
  'kiambu:juja': { lat: -1.1022, lng: 37.0144 },
  'kiambu:kiambu': { lat: -1.1714, lng: 36.8356 },
  'kiambu:kiambaa': { lat: -1.1833, lng: 36.7833 },
  'kiambu:kabete': { lat: -1.2583, lng: 36.7333 },
  'kiambu:kikuyu': { lat: -1.2467, lng: 36.6631 },
  'kiambu:limuru': { lat: -1.1167, lng: 36.65 },
  'kiambu:lari': { lat: -0.9833, lng: 36.6333 },
  'kiambu:gatundu south': { lat: -1.0167, lng: 36.9 },
  'kiambu:gatundu north': { lat: -0.95, lng: 36.9333 },
  'kiambu:githunguri': { lat: -1.0583, lng: 36.7778 },

  // Mombasa Sub-Counties
  'mombasa:nyali': { lat: -4.0325, lng: 39.7042 },
  'mombasa:mvita': { lat: -4.0547, lng: 39.6636 },
  'mombasa:kisauni': { lat: -3.9972, lng: 39.7028 },
  'mombasa:changamwe': { lat: -4.025, lng: 39.6278 },
  'mombasa:jomvu': { lat: -4.0042, lng: 39.6014 },
  'mombasa:likoni': { lat: -4.0833, lng: 39.65 },

  // Nakuru Sub-Counties
  'nakuru:nakuru town east': { lat: -0.2833, lng: 36.0833 },
  'nakuru:nakuru town west': { lat: -0.3, lng: 36.05 },
  'nakuru:naivasha': { lat: -0.7167, lng: 36.4333 },
  'nakuru:gilgil': { lat: -0.4931, lng: 36.2861 },
  'nakuru:molo': { lat: -0.25, lng: 35.7333 },
  'nakuru:njoro': { lat: -0.3333, lng: 35.95 },
  'nakuru:bahati': { lat: -0.15, lng: 36.15 },
  'nakuru:rongai': { lat: -0.1667, lng: 35.8667 },
  'nakuru:subukia': { lat: 0.0167, lng: 36.25 },
  'nakuru:kuresoi south': { lat: -0.4667, lng: 35.6333 },
  'nakuru:kuresoi north': { lat: -0.3167, lng: 35.5833 },

  // Machakos Sub-Counties
  'machakos:machakos town': { lat: -1.5177, lng: 37.2634 },
  'machakos:mavoko': { lat: -1.4333, lng: 36.9833 },
  'machakos:athi river': { lat: -1.45, lng: 36.9833 },
  'machakos:matungulu': { lat: -1.25, lng: 37.3333 },
  'machakos:kangundo': { lat: -1.2972, lng: 37.3472 },
  'machakos:kathiani': { lat: -1.4167, lng: 37.35 },
  'machakos:mwala': { lat: -1.3333, lng: 37.45 },
  'machakos:yatta': { lat: -1.1333, lng: 37.5833 },
  'machakos:masinga': { lat: -0.9667, lng: 37.6 },

  // Kajiado Sub-Counties
  'kajiado:kajiado north': { lat: -1.35, lng: 36.65 },
  'kajiado:kajiado central': { lat: -1.85, lng: 36.7833 },
  'kajiado:kajiado east': { lat: -1.7, lng: 37.05 },
  'kajiado:kajiado west': { lat: -1.85, lng: 36.3167 },
  'kajiado:kajiado south': { lat: -2.6833, lng: 37.5333 },

  // Kisumu Sub-Counties
  'kisumu:kisumu central': { lat: -0.0917, lng: 34.768 },
  'kisumu:kisumu east': { lat: -0.0833, lng: 34.8 },
  'kisumu:kisumu west': { lat: -0.0333, lng: 34.6 },
  'kisumu:seme': { lat: -0.15, lng: 34.45 },
  'kisumu:nyando': { lat: -0.1833, lng: 34.9167 },
  'kisumu:muhoroni': { lat: -0.15, lng: 35.2 },
  'kisumu:nyakach': { lat: -0.3333, lng: 34.95 },

  // Uasin Gishu Sub-Counties
  'uasin gishu:ainabkoi': { lat: 0.35, lng: 35.45 },
  'uasin gishu:kapseret': { lat: 0.45, lng: 35.2333 },
  'uasin gishu:kesses': { lat: 0.2833, lng: 35.3333 },
  'uasin gishu:moiben': { lat: 0.7833, lng: 35.4333 },
  'uasin gishu:soy': { lat: 0.75, lng: 35.15 },
  'uasin gishu:turbo': { lat: 0.6333, lng: 35.05 }
};

// Kenyan Known Wards / Local Areas geographic coordinates
export const KENYA_WARD_COORDS: Record<string, { lat: number; lng: number }> = {
  // Nairobi - Kasarani Wards
  'nairobi:kasarani:clay city': { lat: -1.2185, lng: 36.9032 },
  'nairobi:kasarani:claycity': { lat: -1.2185, lng: 36.9032 },
  'nairobi:kasarani:mwiki': { lat: -1.2238, lng: 36.9189 },
  'nairobi:kasarani:kasarani': { lat: -1.2223, lng: 36.9015 },
  'nairobi:kasarani:njiru': { lat: -1.2422, lng: 36.9441 },
  'nairobi:kasarani:ruai': { lat: -1.2667, lng: 36.9833 },

  // Nairobi - Roysambu Wards
  'nairobi:roysambu:githurai': { lat: -1.2033, lng: 36.9242 },
  'nairobi:roysambu:kahawa west': { lat: -1.1825, lng: 36.8986 },
  'nairobi:roysambu:zimmerman': { lat: -1.2078, lng: 36.8953 },
  'nairobi:roysambu:roysambu': { lat: -1.2185, lng: 36.8872 },
  'nairobi:roysambu:kahawa': { lat: -1.1825, lng: 36.9186 },

  // Nairobi - Westlands Wards
  'nairobi:westlands:kitisuru': { lat: -1.2372, lng: 36.7725 },
  'nairobi:westlands:parklands/highridge': { lat: -1.2614, lng: 36.8153 },
  'nairobi:westlands:karura': { lat: -1.2333, lng: 36.8333 },
  'nairobi:westlands:kangemi': { lat: -1.2639, lng: 36.7472 },
  'nairobi:westlands:mountain view': { lat: -1.2625, lng: 36.7361 },

  // Nakuru Wards
  'nakuru:nakuru town east:biashara': { lat: -0.2833, lng: 36.0667 },
  'nakuru:nakuru town east:flamingos': { lat: -0.2917, lng: 36.0833 },
  'nakuru:nakuru town east:menengai': { lat: -0.2667, lng: 36.0667 },
  'nakuru:nakuru town east:kivumbini': { lat: -0.3000, lng: 36.0833 },
  'nakuru:nakuru town west:freehold': { lat: -0.2890, lng: 36.0620 },
  'nakuru:nakuru town west:rhonda': { lat: -0.3167, lng: 36.0500 },
  'nakuru:nakuru town west:kaptembwa': { lat: -0.3083, lng: 36.0333 },
  'nakuru:nakuru town west:shabab': { lat: -0.2833, lng: 36.0500 },
  'nakuru:naivasha:lake view': { lat: -0.7200, lng: 36.4300 },
  'nakuru:naivasha:viwandani': { lat: -0.7100, lng: 36.4400 },

  // Wajir - Wajir North Wards
  'wajir:wajir north:godoma': { lat: 2.6333, lng: 39.4667 },
  'wajir:wajir north:bute': { lat: 2.5539, lng: 39.5539 },
  'wajir:wajir north:korondile': { lat: 2.6481, lng: 39.6381 },
  'wajir:wajir north:malkagufu': { lat: 2.7833, lng: 39.6667 },
  'wajir:wajir north:batalu': { lat: 2.4833, lng: 39.5833 },
  'wajir:wajir north:danaba': { lat: 2.8167, lng: 39.7167 },
  'wajir:wajir north:gurar': { lat: 3.1667, lng: 39.7 },

  // Kiambu - Ruiru Wards
  'kiambu:ruiru:kahawa sukari': { lat: -1.1917, lng: 36.9361 },
  'kiambu:ruiru:kahawa wendani': { lat: -1.2056, lng: 36.9278 },
  'kiambu:ruiru:mwihoko': { lat: -1.2167, lng: 36.95 },
  'kiambu:ruiru:githurai': { lat: -1.2033, lng: 36.9242 },
  'kiambu:ruiru:biashara': { lat: -1.1467, lng: 36.9611 },
  'kiambu:ruiru:gatongora': { lat: -1.1333, lng: 37.0 },
  'kiambu:ruiru:gitothua': { lat: -1.15, lng: 36.95 }
};

// Kenyan Known Estates / Local Areas geographic coordinates
export const KENYA_ESTATE_COORDS: Record<string, { lat: number; lng: number; estate: string; subCounty: string; county: string; ward?: string }> = {
  // Kasarani Estates
  'seasons': { lat: -1.2223, lng: 36.9015, estate: 'Seasons', subCounty: 'Kasarani', county: 'Nairobi', ward: 'Clay City' },
  'hunters': { lat: -1.2201, lng: 36.9052, estate: 'Hunters', subCounty: 'Kasarani', county: 'Nairobi', ward: 'Clay City' },
  'clay works': { lat: -1.2185, lng: 36.8988, estate: 'Clay Works', subCounty: 'Kasarani', county: 'Nairobi', ward: 'Clay City' },
  'mwiki phase 3': { lat: -1.2312, lng: 36.9241, estate: 'Mwiki Phase 3', subCounty: 'Kasarani', county: 'Nairobi', ward: 'Mwiki' },
  'santon': { lat: -1.2280, lng: 36.9080, estate: 'Santon', subCounty: 'Kasarani', county: 'Nairobi', ward: 'Kasarani' },
  'sportsview': { lat: -1.2250, lng: 36.8990, estate: 'Sportsview', subCounty: 'Kasarani', county: 'Nairobi', ward: 'Kasarani' },
  'maji mazuri': { lat: -1.2300, lng: 36.9150, estate: 'Maji Mazuri', subCounty: 'Kasarani', county: 'Nairobi', ward: 'Mwiki' },

  // Roysambu Estates
  'trm drive': { lat: -1.2185, lng: 36.8872, estate: 'TRM Drive', subCounty: 'Roysambu', county: 'Nairobi', ward: 'Roysambu' },
  'mirema drive': { lat: -1.2110, lng: 36.8890, estate: 'Mirema Drive', subCounty: 'Roysambu', county: 'Nairobi', ward: 'Roysambu' },
  'zimmerman': { lat: -1.2078, lng: 36.8953, estate: 'Base Area', subCounty: 'Roysambu', county: 'Nairobi', ward: 'Zimmerman' },
  'lumumba drive': { lat: -1.2170, lng: 36.8850, estate: 'Lumumba Drive', subCounty: 'Roysambu', county: 'Nairobi', ward: 'Roysambu' },
  'kahawa west': { lat: -1.1825, lng: 36.8986, estate: 'Kahawa West', subCounty: 'Roysambu', county: 'Nairobi', ward: 'Kahawa West' },
  'githurai 44': { lat: -1.1980, lng: 36.9150, estate: 'Githurai 44', subCounty: 'Roysambu', county: 'Nairobi', ward: 'Githurai' },

  // Kilimani & Kileleshwa
  'dennis pritt road': { lat: -1.2892, lng: 36.7865, estate: 'Dennis Pritt Road', subCounty: 'Kilimani', county: 'Nairobi', ward: 'Kilimani' },
  'yaya centre': { lat: -1.2925, lng: 36.7870, estate: 'Yaya Centre Area', subCounty: 'Kilimani', county: 'Nairobi', ward: 'Kilimani' },
  'argwings kodhek': { lat: -1.2950, lng: 36.7820, estate: 'Argwings Kodhek', subCounty: 'Kilimani', county: 'Nairobi', ward: 'Kilimani' },
  'oloitokitok road': { lat: -1.2800, lng: 36.7800, estate: 'Oloitokitok Road', subCounty: 'Kilimani', county: 'Nairobi', ward: 'Kileleshwa' },
  'valley arcade': { lat: -1.2910, lng: 36.7660, estate: 'Valley Arcade', subCounty: 'Kilimani', county: 'Nairobi', ward: 'Lavington' },
  'riara road': { lat: -1.2980, lng: 36.7720, estate: 'Riara Road', subCounty: 'Kilimani', county: 'Nairobi', ward: 'Kilimani' },

  // Westlands & Parklands
  'rhapta road': { lat: -1.2676, lng: 36.8050, estate: 'Rhapta Road', subCounty: 'Westlands', county: 'Nairobi', ward: 'Parklands/Highridge' },
  'sarit centre': { lat: -1.2635, lng: 36.8040, estate: 'Sarit Area', subCounty: 'Westlands', county: 'Nairobi', ward: 'Parklands/Highridge' },
  'parklands': { lat: -1.2614, lng: 36.8153, estate: 'Parklands', subCounty: 'Westlands', county: 'Nairobi', ward: 'Parklands/Highridge' },
  'kitisuru': { lat: -1.2372, lng: 36.7725, estate: 'Kitisuru Estate', subCounty: 'Westlands', county: 'Nairobi', ward: 'Kitisuru' },

  // Nakuru Estates
  'milimani': { lat: -0.2785, lng: 36.0720, estate: 'Milimani', subCounty: 'Nakuru Town East', county: 'Nakuru', ward: 'Biashara' },
  'section 58': { lat: -0.2890, lng: 36.0850, estate: 'Section 58', subCounty: 'Nakuru Town East', county: 'Nakuru', ward: 'Biashara' },
  'naka': { lat: -0.2950, lng: 36.0900, estate: 'Naka', subCounty: 'Nakuru Town East', county: 'Nakuru', ward: 'Freehold' },
  'free area': { lat: -0.2850, lng: 36.0950, estate: 'Free Area', subCounty: 'Nakuru Town East', county: 'Nakuru', ward: 'Flamingos' },
  'kiamunyi': { lat: -0.2650, lng: 36.0300, estate: 'Kiamunyi', subCounty: 'Nakuru Town West', county: 'Nakuru', ward: 'Shabab' },
  'london': { lat: -0.2700, lng: 36.0500, estate: 'London', subCounty: 'Nakuru Town West', county: 'Nakuru', ward: 'Shabab' },
  'lanet': { lat: -0.2900, lng: 36.1300, estate: 'Lanet', subCounty: 'Nakuru Town East', county: 'Nakuru', ward: 'Menengai' },

  // Kiambu (Ruaka, Ruiru, Juja, Thika)
  'joyland': { lat: -1.2050, lng: 36.7745, estate: 'Joyland', subCounty: 'Kiambaa', county: 'Kiambu', ward: 'Muchatha' },
  'ruaka town': { lat: -1.2080, lng: 36.7780, estate: 'Ruaka Town', subCounty: 'Kiambaa', county: 'Kiambu', ward: 'Muchatha' },
  'kimbo': { lat: -1.1400, lng: 36.9700, estate: 'Kimbo Phase 1', subCounty: 'Ruiru', county: 'Kiambu', ward: 'Biashara' },
  'kahawa sukari': { lat: -1.1917, lng: 36.9361, estate: 'Kahawa Sukari', subCounty: 'Ruiru', county: 'Kiambu', ward: 'Kahawa Sukari' },
  'kahawa wendani': { lat: -1.2056, lng: 36.9278, estate: 'Kahawa Wendani', subCounty: 'Ruiru', county: 'Kiambu', ward: 'Kahawa Wendani' },
  'membley': { lat: -1.1750, lng: 36.9250, estate: 'Membley Estate', subCounty: 'Ruiru', county: 'Kiambu', ward: 'Biashara' },

  // Machakos & Kajiado
  'community road': { lat: -1.3550, lng: 36.9350, estate: 'Community Road', subCounty: 'Mavoko', county: 'Machakos', ward: 'Syokimau/Mulolongo' },
  'syokimau': { lat: -1.3550, lng: 36.9350, estate: 'Syokimau Estate', subCounty: 'Mavoko', county: 'Machakos', ward: 'Syokimau/Mulolongo' },
  'ongata rongai': { lat: -1.3970, lng: 36.7600, estate: 'Ongata Rongai Town', subCounty: 'Kajiado North', county: 'Kajiado', ward: 'Ongata Rongai' },
  'kitengela': { lat: -1.4780, lng: 36.9600, estate: 'Kitengela Town', subCounty: 'Kajiado East', county: 'Kajiado', ward: 'Kitengela' },

  // Mombasa, Nakuru, Kisumu, Eldoret
  'nyali beach road': { lat: -4.0325, lng: 39.7042, estate: 'Nyali Beach Road', subCounty: 'Nyali', county: 'Mombasa', ward: 'Kongowea' },
  'bamburi': { lat: -3.9850, lng: 39.7250, estate: 'Bamburi Area', subCounty: 'Kisauni', county: 'Mombasa', ward: 'Bamburi' },
  'milimani nakuru': { lat: -0.2750, lng: 36.0650, estate: 'Milimani, Nakuru', subCounty: 'Nakuru Town East', county: 'Nakuru', ward: 'Biashara' },
  'milimani kisumu': { lat: -0.1050, lng: 34.7550, estate: 'Milimani Kisumu', subCounty: 'Kisumu Central', county: 'Kisumu', ward: 'Market Milimani' },
  'elgon view': { lat: 0.4950, lng: 35.2850, estate: 'Elgon View', subCounty: 'Kapseret', county: 'Uasin Gishu', ward: 'Simat/Kapseret' }
};

function normalizeKey(str: string): string {
  return str.toLowerCase().trim().replace(/[-_/\s]+/g, ' ');
}

// In-memory geocoding cache for fast repeated queries
const geocodeCache = new Map<string, GeocodedLocation>();

/**
 * Resolves coordinates and target zoom level based on the Kenyan administrative hierarchy:
 * 1. Ward level (zoom ~14)
 * 2. Sub-County level (zoom ~11)
 * 3. County level (zoom ~8)
 * 4. Fallback to Kenya center (zoom ~6)
 */
export async function geocodeKenyanHierarchy(
  county?: string,
  subCounty?: string,
  ward?: string,
  signal?: AbortSignal
): Promise<GeocodedLocation> {
  const cleanCounty = county?.trim() || '';
  const cleanSub = subCounty?.trim() || '';
  const cleanWard = ward?.trim() || '';

  const cacheKey = `${cleanCounty}::${cleanSub}::${cleanWard}`.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  // 1. If Ward is present, try Ward level resolution
  if (cleanWard) {
    // Check built-in ward database first
    const wardLookupKey = `${normalizeKey(cleanCounty)}:${normalizeKey(cleanSub)}:${normalizeKey(cleanWard)}`;
    if (KENYA_WARD_COORDS[wardLookupKey]) {
      const result: GeocodedLocation = {
        lat: KENYA_WARD_COORDS[wardLookupKey].lat,
        lng: KENYA_WARD_COORDS[wardLookupKey].lng,
        zoom: 14,
        level: 'ward',
        displayName: `${cleanWard}, ${cleanSub || cleanCounty}`
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }

    // Try online OpenStreetMap Nominatim for Ward
    try {
      const queryParts = [cleanWard, cleanSub, cleanCounty, 'Kenya'].filter(Boolean);
      const query = queryParts.join(', ');
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=ke&limit=1`;

      const response = await fetch(url, {
        signal,
        headers: {
          'Accept-Language': 'en'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);

          // Verify inside Kenyan bounding box: lat ~ -4.8 to 5.5, lng ~ 33.8 to 42.0
          if (lat >= -5.0 && lat <= 5.5 && lng >= 33.5 && lng <= 42.5) {
            const result: GeocodedLocation = {
              lat,
              lng,
              zoom: 14,
              level: 'ward',
              displayName: `${cleanWard}, ${cleanSub || cleanCounty}`
            };
            geocodeCache.set(cacheKey, result);
            return result;
          }
        }
      }
    } catch {
      // Ignore network / abort / parse errors and fallback smoothly
    }
  }

  // 2. If Sub-County is present, try Sub-County level resolution
  if (cleanSub) {
    const canonicalSub = resolveSubCountyName(cleanSub, cleanCounty) || cleanSub;
    const subLookupKey = `${normalizeKey(cleanCounty)}:${normalizeKey(canonicalSub)}`;
    const rawSubLookupKey = `${normalizeKey(cleanCounty)}:${normalizeKey(cleanSub)}`;
    
    const matchedCoords = KENYA_SUBCOUNTY_COORDS[subLookupKey] || KENYA_SUBCOUNTY_COORDS[rawSubLookupKey];
    if (matchedCoords) {
      const result: GeocodedLocation = {
        lat: matchedCoords.lat,
        lng: matchedCoords.lng,
        zoom: cleanWard ? 13 : 11,
        level: 'subCounty',
        displayName: `${cleanSub}, ${cleanCounty}`
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }

    // Check by subcounty name alone in case county name variation differs
    for (const [key, coords] of Object.entries(KENYA_SUBCOUNTY_COORDS)) {
      if (key.endsWith(`:${normalizeKey(canonicalSub)}`) || key.endsWith(`:${normalizeKey(cleanSub)}`)) {
        const result: GeocodedLocation = {
          lat: coords.lat,
          lng: coords.lng,
          zoom: cleanWard ? 13 : 11,
          level: 'subCounty',
          displayName: `${cleanSub}, ${cleanCounty}`
        };
        geocodeCache.set(cacheKey, result);
        return result;
      }
    }

    // Try online query for Sub-County
    try {
      const query = `${cleanSub}, ${cleanCounty}, Kenya`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&countrycodes=ke&limit=1`;
      const response = await fetch(url, { signal });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (lat >= -5.0 && lat <= 5.5 && lng >= 33.5 && lng <= 42.5) {
            const result: GeocodedLocation = {
              lat,
              lng,
              zoom: cleanWard ? 13 : 11,
              level: 'subCounty',
              displayName: `${cleanSub}, ${cleanCounty}`
            };
            geocodeCache.set(cacheKey, result);
            return result;
          }
        }
      }
    } catch {
      // Ignore network / abort / parse errors and fallback smoothly
    }
  }

  // 3. If County is present, try County level resolution
  if (cleanCounty) {
    const countyKey = normalizeKey(cleanCounty);
    if (KENYA_COUNTY_COORDS[countyKey]) {
      const result: GeocodedLocation = {
        lat: KENYA_COUNTY_COORDS[countyKey].lat,
        lng: KENYA_COUNTY_COORDS[countyKey].lng,
        zoom: 8,
        level: 'county',
        displayName: `${cleanCounty} County`
      };
      geocodeCache.set(cacheKey, result);
      return result;
    }

    // Check fuzzy county match
    for (const [name, coords] of Object.entries(KENYA_COUNTY_COORDS)) {
      if (name.includes(countyKey) || countyKey.includes(name)) {
        const result: GeocodedLocation = {
          lat: coords.lat,
          lng: coords.lng,
          zoom: 8,
          level: 'county',
          displayName: `${cleanCounty} County`
        };
        geocodeCache.set(cacheKey, result);
        return result;
      }
    }
  }

  // 4. Default Kenya national center
  const defaultResult: GeocodedLocation = {
    lat: -1.286389,
    lng: 36.817223,
    zoom: 7,
    level: 'country',
    displayName: 'Kenya'
  };
  return defaultResult;
}

/**
 * Resolves exact coordinates for a property listing, with graceful area-level fallback
 * if coordinates are missing, 0, or outside Kenya boundaries.
 */
export function resolvePropertyCoordinates(location?: {
  lat?: number;
  lng?: number;
  county?: string;
  subCounty?: string;
  ward?: string;
  estate?: string;
}): { lat: number; lng: number; isFallback: boolean } {
  if (
    typeof location?.lat === 'number' &&
    typeof location?.lng === 'number' &&
    !isNaN(location.lat) &&
    !isNaN(location.lng) &&
    location.lat >= -5.0 &&
    location.lat <= 5.5 &&
    location.lng >= 33.5 &&
    location.lng <= 42.5 &&
    !(location.lat === 0 && location.lng === 0)
  ) {
    return { lat: location.lat, lng: location.lng, isFallback: false };
  }

  const cleanCounty = normalizeKey(location?.county || '');
  const cleanSub = normalizeKey(location?.subCounty || '');
  const cleanWard = normalizeKey(location?.ward || '');

  // 1. Try Ward lookup
  if (cleanWard && cleanSub && cleanCounty) {
    const wardLookupKey = `${cleanCounty}:${cleanSub}:${cleanWard}`;
    if (KENYA_WARD_COORDS[wardLookupKey]) {
      return { ...KENYA_WARD_COORDS[wardLookupKey], isFallback: true };
    }
  }

  // 2. Try Sub-County lookup
  if (cleanSub && cleanCounty) {
    const subLookupKey = `${cleanCounty}:${cleanSub}`;
    if (KENYA_SUBCOUNTY_COORDS[subLookupKey]) {
      return { ...KENYA_SUBCOUNTY_COORDS[subLookupKey], isFallback: true };
    }
  }

  // 3. Try County lookup
  if (cleanCounty && KENYA_COUNTY_COORDS[cleanCounty]) {
    return { ...KENYA_COUNTY_COORDS[cleanCounty], isFallback: true };
  }

  // 4. Default Kenya national center
  return { lat: -1.286389, lng: 36.817223, isFallback: true };
}

/**
 * Calculates geographic distance (Haversine formula) in kilometers between two coordinates
 */
export function calculateDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Resolves accurate coordinates for a Kenyan Ward across built-in dictionaries, property listings, and administrative sub-counties.
 */
export function resolveWardCoordinates(
  countyName: string,
  subCountyName: string,
  wardName: string,
  properties: PropertyListing[] = []
): { lat: number; lng: number } {
  const normCounty = normalizeKey(countyName);
  const normSub = normalizeKey(subCountyName);
  const normWard = normalizeKey(wardName);
  const cleanWard = wardName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // 1. Direct check in KENYA_WARD_COORDS with multiple normalized formats
  const directKey = `${normCounty}:${normSub}:${normWard}`;
  if (KENYA_WARD_COORDS[directKey]) return KENYA_WARD_COORDS[directKey];

  const cleanKey = `${normCounty}:${normSub}:${cleanWard}`;
  if (KENYA_WARD_COORDS[cleanKey]) return KENYA_WARD_COORDS[cleanKey];

  for (const [k, coords] of Object.entries(KENYA_WARD_COORDS)) {
    const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kClean.endsWith(cleanWard) || k.endsWith(`:${normWard}`)) {
      return coords;
    }
  }

  // 2. Check if any property listing in this ward has valid coordinates
  const matchingProp = properties.find((p) => {
    const pWardClean = (p.location.ward || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return pWardClean === cleanWard || pWardClean.includes(cleanWard) || cleanWard.includes(pWardClean);
  });
  if (matchingProp && matchingProp.location.lat && matchingProp.location.lng) {
    return { lat: matchingProp.location.lat, lng: matchingProp.location.lng };
  }

  // 3. Fallback to sub-county coordinates
  const subKey = `${normCounty}:${normSub}`;
  if (KENYA_SUBCOUNTY_COORDS[subKey]) return KENYA_SUBCOUNTY_COORDS[subKey];
  for (const [k, coords] of Object.entries(KENYA_SUBCOUNTY_COORDS)) {
    if (k.endsWith(`:${normSub}`)) return coords;
  }

  // 4. Fallback to county coordinates
  if (KENYA_COUNTY_COORDS[normCounty]) return KENYA_COUNTY_COORDS[normCounty];

  // 5. Default Kenya Center
  return { lat: -1.286389, lng: 36.817223 };
}

/**
 * Resolves accurate coordinates for a Kenyan Estate / Local Area across built-in dictionaries, property listings, and sub-counties.
 */
export function resolveEstateCoordinates(
  countyName: string,
  subCountyName: string,
  estateName: string,
  properties: PropertyListing[] = []
): { lat: number; lng: number } {
  const normEstate = normalizeKey(estateName);
  const cleanEstate = estateName.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (KENYA_ESTATE_COORDS[normEstate]) return KENYA_ESTATE_COORDS[normEstate];
  if (KENYA_ESTATE_COORDS[cleanEstate]) return KENYA_ESTATE_COORDS[cleanEstate];

  for (const [k, coords] of Object.entries(KENYA_ESTATE_COORDS)) {
    const kClean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    const estClean = coords.estate.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kClean === cleanEstate || estClean === cleanEstate) {
      return { lat: coords.lat, lng: coords.lng };
    }
  }

  // Check property listing with this estate
  const matchingProp = properties.find((p) => {
    const pEstClean = (p.location.estate || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return pEstClean === cleanEstate || pEstClean.includes(cleanEstate) || cleanEstate.includes(pEstClean);
  });
  if (matchingProp && matchingProp.location.lat && matchingProp.location.lng) {
    return { lat: matchingProp.location.lat, lng: matchingProp.location.lng };
  }

  // Fallback to subcounty or county
  const normCounty = normalizeKey(countyName);
  const normSub = normalizeKey(subCountyName);
  const subKey = `${normCounty}:${normSub}`;
  if (KENYA_SUBCOUNTY_COORDS[subKey]) return KENYA_SUBCOUNTY_COORDS[subKey];
  if (KENYA_COUNTY_COORDS[normCounty]) return KENYA_COUNTY_COORDS[normCounty];

  return { lat: -1.286389, lng: 36.817223 };
}

/**
 * Searches across all levels of the MakaoHub location hierarchy:
 * 1. County
 * 2. Sub-county
 * 3. Ward
 * 4. Estate / Area
 * And searches individual properties strictly when the actual property name matches the query.
 * Returns structured autocomplete suggestions with precise coordinates & zoom levels.
 */
export function searchKenyanLocationsAndProperties(
  query: string,
  properties: PropertyListing[] = [],
  activeFilters?: {
    propertyType?: string;
    minRent?: number | string;
    maxRent?: number | string;
    amenities?: string[];
  }
): AutocompleteSuggestion[] {
  if (!query || !query.trim()) return [];
  const rawQ = query.trim();
  const q = normalizeKey(rawQ);
  const qClean = rawQ.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!q && !qClean) return [];

  // Filter properties according to MakaoHub seeker visibility:
  // Status === 'Approved', vacancies > 0, and respecting optional active filters
  const visibleProperties = properties.filter((p) => {
    if (p.status !== 'Approved' || p.vacancies <= 0) return false;
    if (activeFilters?.propertyType && p.type.toLowerCase() !== activeFilters.propertyType.toLowerCase()) return false;
    if (activeFilters?.minRent !== undefined && activeFilters.minRent !== '' && p.monthlyRent < Number(activeFilters.minRent)) return false;
    if (activeFilters?.maxRent !== undefined && activeFilters.maxRent !== '' && p.monthlyRent > Number(activeFilters.maxRent)) return false;
    if (activeFilters?.amenities && activeFilters.amenities.length > 0) {
      if (!activeFilters.amenities.every((a) => p.amenities.includes(a))) return false;
    }
    return true;
  });

  const locationResults: (AutocompleteSuggestion & { _score?: number })[] = [];
  const propertyResults: (AutocompleteSuggestion & { _score?: number })[] = [];
  const seenIds = new Set<string>();

  const formatCount = (count: number) => (count === 1 ? '1 listing' : `${count} listings`);

  // Helper counting functions:
  const getCountyCount = (countyName: string) => {
    const cClean = countyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return visibleProperties.filter((p) => p.location.county.toLowerCase().replace(/[^a-z0-9]/g, '') === cClean).length;
  };

  const getSubCountyCount = (subName: string, countyName?: string) => {
    const sClean = subName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cClean = countyName ? countyName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    return visibleProperties.filter((p) => {
      const pSub = (p.location.subCounty || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pCounty = (p.location.county || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchSub = pSub === sClean || pSub.includes(sClean) || sClean.includes(pSub);
      const matchC = !cClean || pCounty === cClean;
      return matchSub && matchC;
    }).length;
  };

  const getWardCount = (wardName: string, subCountyName?: string, countyName?: string) => {
    const wClean = wardName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sClean = subCountyName ? subCountyName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    const cClean = countyName ? countyName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    return visibleProperties.filter((p) => {
      const pWard = (p.location.ward || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pSub = (p.location.subCounty || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pCounty = (p.location.county || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchWard = pWard === wClean || pWard.includes(wClean) || wClean.includes(pWard);
      const matchSub = !sClean || pSub === sClean || pSub.includes(sClean) || sClean.includes(pSub);
      const matchC = !cClean || pCounty === cClean;
      return matchWard && matchSub && matchC;
    }).length;
  };

  const getEstateCount = (estateName: string, subCountyName?: string, countyName?: string) => {
    const eClean = estateName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cClean = countyName ? countyName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    return visibleProperties.filter((p) => {
      const pEstate = (p.location.estate || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pAddr = (p.location.address || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const pName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const pCounty = (p.location.county || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const matchEstate =
        pEstate === eClean ||
        pEstate.includes(eClean) ||
        eClean.includes(pEstate) ||
        pAddr.includes(eClean) ||
        pName.includes(eClean);
      const matchC = !cClean || pCounty === cClean;
      return matchEstate && matchC;
    }).length;
  };

  // 1. MATCH COUNTIES (e.g. "Nakuru" -> "Nakuru — County")
  for (const county of KENYA_LOCATIONS_DATA) {
    const normCounty = normalizeKey(county.name);
    const cleanCounty = county.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const countyMatches =
      normCounty.includes(q) ||
      cleanCounty.includes(qClean) ||
      `${normCounty} county`.includes(q) ||
      `${cleanCounty}county`.includes(qClean);

    if (countyMatches) {
      const coords = KENYA_COUNTY_COORDS[normCounty] || { lat: -1.286389, lng: 36.817223 };
      const id = `county-${cleanCounty}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const count = getCountyCount(county.name);
        const isExact = cleanCounty === qClean || normCounty === q;
        locationResults.push({
          id,
          label: `${county.name} — County`,
          subLabel: formatCount(count),
          category: 'county',
          lat: coords.lat,
          lng: coords.lng,
          zoom: 10,
          county: county.name,
          listingCount: count,
          _score: isExact ? 1000 + count * 5 : 500 + count * 5
        });

        // Also suggest top sub-counties in this county with active listings
        for (const sub of county.subCounties) {
          const subCount = getSubCountyCount(sub.name, county.name);
          if (subCount > 0) {
            const subClean = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const subId = `subcounty-${cleanCounty}-${subClean}`;
            if (!seenIds.has(subId)) {
              seenIds.add(subId);
              const subKey = `${normCounty}:${normalizeKey(sub.name)}`;
              const subCoords = KENYA_SUBCOUNTY_COORDS[subKey] || coords;
              locationResults.push({
                id: subId,
                label: `${sub.name} — Sub-county`,
                subLabel: formatCount(subCount),
                category: 'subCounty',
                lat: subCoords.lat,
                lng: subCoords.lng,
                zoom: 12,
                county: county.name,
                subCounty: sub.name,
                listingCount: subCount,
                _score: 300 + subCount * 5
              });
            }
          }
        }
      }
    }
  }

  // 2. MATCH SUB-COUNTIES (e.g. "Kasarani" -> "Kasarani — Sub-county", "Nakuru Town East" -> "Nakuru Town East — Sub-county")
  for (const county of KENYA_LOCATIONS_DATA) {
    const normCounty = normalizeKey(county.name);
    const cleanCounty = county.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const sub of county.subCounties) {
      const normSub = normalizeKey(sub.name);
      const cleanSub = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const subId = `subcounty-${cleanCounty}-${cleanSub}`;

      const subMatches =
        normSub.includes(q) ||
        cleanSub.includes(qClean) ||
        `${normSub} sub county`.includes(q) ||
        `${normSub} ${normCounty}`.includes(q) ||
        `${cleanSub}${cleanCounty}`.includes(qClean);

      if (subMatches && !seenIds.has(subId)) {
        seenIds.add(subId);
        const subKey = `${normCounty}:${normSub}`;
        const subCoords = KENYA_SUBCOUNTY_COORDS[subKey] || KENYA_COUNTY_COORDS[normCounty] || { lat: -1.286389, lng: 36.817223 };
        const count = getSubCountyCount(sub.name, county.name);
        const isExact = cleanSub === qClean || normSub === q;
        locationResults.push({
          id: subId,
          label: `${sub.name} — Sub-county`,
          subLabel: formatCount(count),
          category: 'subCounty',
          lat: subCoords.lat,
          lng: subCoords.lng,
          zoom: 12,
          county: county.name,
          subCounty: sub.name,
          listingCount: count,
          _score: isExact ? 900 + count * 5 : 400 + count * 5
        });
      }
    }
  }

  // 3. MATCH WARDS (Recursively through all 47 counties -> 290 sub-counties -> 1,450 wards)
  // e.g. "Clay City" -> "Clay City — Ward", "Mwiki" -> "Mwiki — Ward", "Biashara" -> "Biashara — Ward"
  for (const county of KENYA_LOCATIONS_DATA) {
    const normCounty = normalizeKey(county.name);
    const cleanCounty = county.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const sub of county.subCounties) {
      const normSub = normalizeKey(sub.name);
      const cleanSub = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sub.wards && Array.isArray(sub.wards)) {
        for (const ward of sub.wards) {
          const normWard = normalizeKey(ward.name);
          const cleanWard = ward.name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const wardId = `ward-${cleanCounty}-${cleanSub}-${cleanWard}`;

          const wardMatches =
            normWard.includes(q) ||
            cleanWard.includes(qClean) ||
            `${normWard} ward`.includes(q) ||
            `${normWard} ${normSub}`.includes(q) ||
            `${normWard} ${normCounty}`.includes(q) ||
            `${cleanWard}${cleanSub}`.includes(qClean);

          if (wardMatches && !seenIds.has(wardId)) {
            seenIds.add(wardId);
            const wardCoords = resolveWardCoordinates(county.name, sub.name, ward.name, visibleProperties);
            const count = getWardCount(ward.name, sub.name, county.name);
            const isExact = cleanWard === qClean || normWard === q;
            locationResults.push({
              id: wardId,
              label: `${ward.name} — Ward`,
              subLabel: formatCount(count),
              category: 'ward',
              lat: wardCoords.lat,
              lng: wardCoords.lng,
              zoom: 14,
              county: county.name,
              subCounty: sub.name,
              ward: ward.name,
              listingCount: count,
              _score: isExact ? 850 + count * 5 : 350 + count * 5
            });
          }
        }
      }
    }
  }

  // 4. MATCH ESTATES / LOCAL AREAS (e.g. "Seasons" -> "Seasons — Estate", "Mwiki Phase 3" -> "Mwiki Phase 3 — Estate")
  for (const [key, est] of Object.entries(KENYA_ESTATE_COORDS)) {
    const normKey = normalizeKey(key);
    const normEstate = normalizeKey(est.estate);
    const cleanEstate = est.estate.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normSub = normalizeKey(est.subCounty);
    const normCounty = normalizeKey(est.county);
    const estateId = `estate-${est.county.toLowerCase().replace(/[^a-z0-9]/g, '')}-${est.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '')}-${cleanEstate}`;

    const estateMatches =
      normKey.includes(q) ||
      normEstate.includes(q) ||
      cleanEstate.includes(qClean) ||
      cleanKey.includes(qClean) ||
      `${normEstate} estate`.includes(q) ||
      `${normEstate} ${normSub}`.includes(q) ||
      `${normEstate} ${normCounty}`.includes(q);

    if (estateMatches && !seenIds.has(estateId)) {
      seenIds.add(estateId);
      const count = getEstateCount(est.estate, est.subCounty, est.county);
      const isExact = cleanEstate === qClean || normEstate === q || cleanKey === qClean;
      const isArea = est.estate.toLowerCase().includes('area') || key.toLowerCase().includes('area');
      const suffix = isArea ? 'Area' : 'Estate';
      locationResults.push({
        id: estateId,
        label: `${est.estate} — ${suffix}`,
        subLabel: formatCount(count),
        category: 'estate',
        lat: est.lat,
        lng: est.lng,
        zoom: 15,
        county: est.county,
        subCounty: est.subCounty,
        ward: est.ward,
        estate: est.estate,
        listingCount: count,
        _score: isExact ? 800 + count * 5 : 300 + count * 5
      });
    }
  }

  // Also check any property listing estate that may not be in KENYA_ESTATE_COORDS
  for (const p of visibleProperties) {
    if (p.location.estate) {
      const cleanEstate = p.location.estate.toLowerCase().replace(/[^a-z0-9]/g, '');
      const normEstate = normalizeKey(p.location.estate);
      const estateId = `estate-${p.location.county.toLowerCase().replace(/[^a-z0-9]/g, '')}-${p.location.subCounty.toLowerCase().replace(/[^a-z0-9]/g, '')}-${cleanEstate}`;

      if ((normEstate.includes(q) || cleanEstate.includes(qClean)) && !seenIds.has(estateId)) {
        seenIds.add(estateId);
        const coords = resolvePropertyCoordinates(p.location);
        const count = getEstateCount(p.location.estate, p.location.subCounty, p.location.county);
        const isExact = cleanEstate === qClean || normEstate === q;
        const isArea = p.location.estate.toLowerCase().includes('area');
        const suffix = isArea ? 'Area' : 'Estate';
        locationResults.push({
          id: estateId,
          label: `${p.location.estate} — ${suffix}`,
          subLabel: formatCount(count),
          category: 'estate',
          lat: coords.lat,
          lng: coords.lng,
          zoom: 15,
          county: p.location.county,
          subCounty: p.location.subCounty,
          ward: p.location.ward,
          estate: p.location.estate,
          listingCount: count,
          _score: isExact ? 800 + count * 5 : 300 + count * 5
        });
      }
    }
  }

  // 5. MATCH PROPERTIES (STRICTLY by actual property NAME)
  // Individual properties only appear in PROPERTIES when the property's actual NAME matches the search text
  visibleProperties.forEach((p) => {
    const normName = normalizeKey(p.name);
    const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameMatch = normName.includes(q) || cleanName.includes(qClean);
    if (nameMatch) {
      const coords = resolvePropertyCoordinates(p.location);
      const id = `prop-${p.id}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const subOrEstate = p.location.estate || p.location.ward || p.location.subCounty || '';
        const isExact = cleanName === qClean || normName === q;
        propertyResults.push({
          id,
          label: p.name,
          subLabel: subOrEstate ? `${subOrEstate}, ${p.location.county}` : p.location.county,
          category: 'property',
          lat: coords.lat,
          lng: coords.lng,
          zoom: 16,
          county: p.location.county,
          subCounty: p.location.subCounty,
          ward: p.location.ward,
          estate: p.location.estate,
          propertyId: p.id,
          propertyPrice: p.monthlyRent,
          propertyType: p.type,
          _score: isExact ? 1000 : 500
        });
      }
    }
  });

  // Sort locations by _score descending, then listingCount descending
  locationResults.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0));
  propertyResults.sort((a, b) => ((b as any)._score || 0) - ((a as any)._score || 0));

  return [...locationResults.slice(0, 8), ...propertyResults.slice(0, 4)];
}

/**
 * Resolves a freeform search text to the best matching location or property.
 */
export function resolveSearchToLocation(
  query: string,
  properties: PropertyListing[] = []
): AutocompleteSuggestion | null {
  if (!query || !query.trim()) return null;
  const suggestions = searchKenyanLocationsAndProperties(query, properties);
  if (suggestions.length > 0) {
    return suggestions[0];
  }
  return null;
}

