export interface AutocompleteLocation {
  label: string;
  estate: string;
  subCounty: string;
  county: string;
  type: string;
}

export const MOCK_AUTOCOMPLETE_LOCATIONS: AutocompleteLocation[] = [
  { label: 'Kasarani, Nairobi', estate: 'Seasons', subCounty: 'Kasarani', county: 'Nairobi', type: 'Sub-County' },
  { label: 'Seasons, Kasarani', estate: 'Seasons', subCounty: 'Kasarani', county: 'Nairobi', type: 'Estate' },
  { label: 'Mwiki, Kasarani', estate: 'Mwiki Phase 3', subCounty: 'Kasarani', county: 'Nairobi', type: 'Estate' },
  { label: 'Clay City, Kasarani', estate: 'Clay Works', subCounty: 'Kasarani', county: 'Nairobi', type: 'Ward' },
  { label: 'Hunters, Kasarani', estate: 'Hunters', subCounty: 'Kasarani', county: 'Nairobi', type: 'Estate' },
  { label: 'Roysambu, Nairobi', estate: 'TRM Drive', subCounty: 'Roysambu', county: 'Nairobi', type: 'Sub-County' },
  { label: 'TRM Drive, Roysambu', estate: 'TRM Drive', subCounty: 'Roysambu', county: 'Nairobi', type: 'Estate' },
  { label: 'Mirema Drive, Roysambu', estate: 'Mirema Drive', subCounty: 'Roysambu', county: 'Nairobi', type: 'Estate' },
  { label: 'Zimmerman, Nairobi', estate: 'Base Area', subCounty: 'Roysambu', county: 'Nairobi', type: 'Estate' },
  { label: 'Kilimani, Nairobi', estate: 'Dennis Pritt Road', subCounty: 'Kilimani', county: 'Nairobi', type: 'Sub-County' },
  { label: 'Kileleshwa, Nairobi', estate: 'Oloitokitok Road', subCounty: 'Kilimani', county: 'Nairobi', type: 'Ward' },
  { label: 'Westlands, Nairobi', estate: 'Rhapta Road', subCounty: 'Westlands', county: 'Nairobi', type: 'Sub-County' },
  { label: 'Ruaka, Kiambu', estate: 'Joyland', subCounty: 'Kiambaa (Ruaka)', county: 'Kiambu', type: 'Sub-County' },
  { label: 'Ruiru, Kiambu', estate: 'Kimbo Phase 1', subCounty: 'Ruiru', county: 'Kiambu', type: 'Sub-County' },
  { label: 'Syokimau, Machakos', estate: 'Community Road', subCounty: 'Mavoko', county: 'Machakos', type: 'Estate' },
  { label: 'Ongata Rongai, Kajiado/Langata', estate: 'Ongata Rongai Town', subCounty: 'Langata', county: 'Nairobi', type: 'Estate' },
  { label: 'Nakuru Town, Nakuru', estate: 'Milimani, Nakuru', subCounty: 'Nakuru Town East', county: 'Nakuru', type: 'County' },
  { label: 'Nyali, Mombasa', estate: 'Nyali Beach Road', subCounty: 'Nyali', county: 'Mombasa', type: 'Sub-County' },
  { label: 'Kisumu City, Kisumu', estate: 'Milimani Kisumu', subCounty: 'Kisumu Central', county: 'Kisumu', type: 'County' },
  { label: 'Elgon View, Eldoret', estate: 'Elgon View', subCounty: 'Kapseret', county: 'Uasin Gishu', type: 'Estate' }
];
