'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import GlassPanel from '@/components/ui/GlassPanel';

export default function SubscriptionSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard/leads');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <GlassPanel className="max-w-md w-full p-8" variant="medium">
        <div className="text-center">
          {/* Success icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/30 rounded-full">
              <Check className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Success message */}
          <h1 className="text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Welcome to Pro!
            </span>
          </h1>

          <p className="text-gray-300 mb-8">
            Your subscription is now active. You have access to all Pro features including 100 scrape jobs per month.
          </p>

          {/* Features list */}
          <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
            <div className="flex items-center text-gray-300">
              <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              <span>100 scrape jobs per month</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              <span>Full access to all features</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              <span>Priority email support</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
              <span>Export capabilities</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard/leads')}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200"
            >
              Continue to Dashboard
            </button>
            
            <p className="text-sm text-gray-400">
              Redirecting in 5 seconds...
            </p>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}