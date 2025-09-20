
export type Coordinates = {
  lat: number;
  lng: number;
};

// export type FacilityType =
//   | 'Hospital'
//   | 'Clinic'
//   | 'Pharmacy'
//   | 'Diagnostic Center'
//   | 'Dental Clinic'
//   | 'Optical Center'
//   | 'Gym'
//   | 'Spa'
//   | 'Specialist Center'
//   | 'Physiotherapy Clinic';
export const facilityTypes = [
  'Hospital',
  'Clinic',
  'Pharmacy',
  'Diagnostic Center',
  'Dental Clinic',
  'Optical Center',
  'Gym',
  'Spa',
  'Specialist Center',
  'Physiotherapy Clinic',
] as const;

export type FacilityType = typeof facilityTypes[number];

export type Facility = {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  type: FacilityType;
  services: string[];
  phone?: string;
  openingHours?: string;
  imageUrl?: string;
  dataAiHint?: string;
};

export interface NewsArticle {
  id: string;
  title: string;
  summary: string; // Plain text, truncated, for card preview
  contentForDialog: string; // Potentially HTML-rich, untruncated, for dialog view
  href: string;
  source: string;
  date: string; // Formatted date string for display
  pubTimestamp?: number; // Timestamp for sorting
  category: 'Local' | 'Foreign';
  imageUrl?: string;
  dataAiHint?: string;
}
