export interface Invite {
  brand_id: string;
  status: string;
  expires_at?: FirebaseFirestore.Timestamp | Date | null;
  used_by: string[];
  max_uses: number;
  created_at?: FirebaseFirestore.Timestamp | Date;
  updated_at?: FirebaseFirestore.Timestamp | Date;
}

export interface UserProfile {
  name: string | null;
  image: string | null;
  auth_type: string;
}

export interface InviteAcceptanceResult {
  success: boolean;
  brandId: string;
}

// InviteValidationError removed - unused (InviteError class is used instead)

export class InviteError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'InviteError';
  }
}