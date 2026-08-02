export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface LocationOption {
  label: string;
  value: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}
