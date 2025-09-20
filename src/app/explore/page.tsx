import { allFacilities } from '@/lib/data';
import ExplorePageClient from './explore-page-client';
import type { Facility } from '@/lib/types';

export default function ExplorePage() {
  const facilities: Facility[] = allFacilities;
  // In a real app, this data could be fetched from a database
  // const facilities = await fetchFacilities();
  return <ExplorePageClient facilities={facilities} />;
}
