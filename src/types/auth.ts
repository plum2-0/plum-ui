import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      provider: string;
      brandId?: string | null;
    } & DefaultSession["user"];
  }
}

export interface Connection {
  id: string;
  platform: "reddit" | "discord" | "slack" | "gmail";
  accountId: string;
  username: string;
  displayName: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scopes: string[];
  connectedAt: Date;
  lastRefresh: Date;
  metadata?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: "google" | "github" | "microsoft";
  createdAt: Date;
  lastLogin: Date;
  onboardingComplete: boolean;
  onboardingStep: number;
  subscriptionTier: "free" | "pro" | "enterprise";
  
  // Stripe Integration Fields
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid';
  subscriptionId?: string;
  subscriptionEndDate?: Date;
  
  // Usage Tracking
  scrapeJobsThisMonth: number;
  lastUsageReset: Date;
  lifetimeScrapeJobs: number;
  
  // Tester Access
  hasTesterAccess: boolean;
  testerCode?: string;
  testerAccessExpiry?: Date;
  
  // Payment Metadata
  firstPaymentDate?: Date;
  totalRevenue?: number;
}
