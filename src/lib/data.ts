
// import type { Facility } from './types';
// import lagosFacilitiesData from './data/LagosFacilities.json';
// import crossRiverFacilitiesData from './data/CrossRiverFacilities.json';
// import akwaIbomFacilitiesData from './data/AkwaIbomFacilities.json';
// import riversFacilitiesData from './data/RiversFacilities.json';

// export const allFacilities: Facility[] = [
//   ...lagosFacilitiesData, 
//   ...crossRiverFacilitiesData, 
//   ...akwaIbomFacilitiesData,
//   ...riversFacilitiesData
// ];
import type { Facility } from './types';
import lagosFacilitiesData from './data/LagosFacilities.json';
import crossRiverFacilitiesData from './data/CrossRiverFacilities.json';
import akwaIbomFacilitiesData from './data/AkwaIbomFacilities.json';
import riversFacilitiesData from './data/RiversFacilities.json';

export const allFacilities: Facility[] = [
  ...(lagosFacilitiesData as Facility[]),
  ...(crossRiverFacilitiesData as Facility[]),
  ...(akwaIbomFacilitiesData as Facility[]),
  ...(riversFacilitiesData as Facility[])
];
