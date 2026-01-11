export interface Lead {
  id: string;
  name: string;
  address: string;
  rating: number;
  user_ratings_total: number;
  business_status: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  website?: string | null;
  types: string[];
  place_id: string;
  suggested_solution?: string;
  suggestion_reason?: string;
  email_draft_subject?: string;
  email_draft_body?: string;
}

export interface SearchState {
  data: Lead[];
  error?: string | null;
  lastUpdated?: number;
}

export type CategoryOption = 'restaurant' | 'cafe' | 'bakery' | 'hair_care' | 'clothing_store' | 'gym';