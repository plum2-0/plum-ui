import { Timestamp } from "firebase/firestore";

export interface TesterCode {
  code: string;
  description: string;
  isActive: boolean;
  maxRedemptions: number;
  currentRedemptions: number;
  validFrom: Timestamp;
  validUntil?: Timestamp;
  accessDurationDays: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  redemptions: Array<{
    userId: string;
    redeemedAt: Timestamp;
    userEmail: string;
  }>;
}

export interface SubscriptionLimits {
  FREE_TIER_LIMIT: 0;
  PRO_TIER_LIMIT: 100;
}

export const SUBSCRIPTION_LIMITS: SubscriptionLimits = {
  FREE_TIER_LIMIT: 0,  // No free jobs - must have a paying member in brand
  PRO_TIER_LIMIT: 100,
};

export interface SubscriptionStatus {
  hasAccess: boolean;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid' | 'none';
  remainingJobs: number;
  monthlyLimit: number;
  hasTesterAccess: boolean;
}

export interface CheckoutSessionData {
  sessionId: string;
  url: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  features: string[];
  scrapeJobsLimit: number;
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    features: [
      'No scrape jobs',
      'View-only access',
      'Requires paid team member'
    ],
    scrapeJobsLimit: 0,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 50,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    features: [
      '100 scrape jobs per month',
      'Full access to all features',
      'Priority email support',
      'Export capabilities',
      'Priority processing'
    ],
    scrapeJobsLimit: 100,
  }
};