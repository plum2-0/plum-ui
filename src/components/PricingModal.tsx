"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check } from "lucide-react";
import { ReactNode } from "react";
import Link from "next/link";

type PricingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <PricingCard onClose={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function PricingDialogTrigger({ children }: { children: ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <PricingCard />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PricingCard({ onClose }: { onClose?: () => void }) {
  const plumFeatures = [
    "8 Keywords",
    "100 Reddit Scrape Jobs",
    "24 months data retention",
    "Unlimited Leads",
    "Unlimited Seats",
  ];
  const octolensFeatures = [
    "20,000 mentions",
    "10 keywords",
    "24-months data retention",
    "Unlimited seats",
    "Webhooks",
    "AI relevance scoring & replies",
  ];
  const ogtoolsFeatures = [
    "Everything in Starter",
    "30 Reddit keywords",
    "15 Blogs/month",
    "Track 3 keywords on ChatGPT",
    "Unlimited LinkedIn/Reddit posts",
    "3 Personas / Seats",
  ];

  return (
    <div className="relative w-full max-w-5xl">
      <div className="glass-card rounded-3xl p-6 sm:p-8 text-white">
        <Dialog.Title className="text-xl font-extrabold mb-4">
          Compare: PlumSprout vs OGTools vs Octolens
        </Dialog.Title>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PlanCard
            name="PlumSprout Pro"
            price="$50"
            features={plumFeatures}
            className="border-white/20 bg-white/10 shadow-2xl"
          />
          <PlanCard
            name="OGTools"
            price="$250"
            features={ogtoolsFeatures}
            className="border-red-400/40 bg-red-500/10"
          />
          <PlanCard
            name="Octolens"
            price="$149"
            features={octolensFeatures}
            className="border-red-400/40 bg-red-500/10"
          />
        </div>

        <div className="text-white/50 text-[10px] mt-3">
          Based on public pricing (Feb 2025). For reference only.
        </div>

        <Link
          href="/auth/signin"
          className="mt-8 w-full inline-block text-center px-6 py-3 rounded-xl font-heading font-semibold text-lg tracking-wide text-white transition-all duration-300 hover:scale-[1.02] glass-button"
          onClick={onClose}
        >
          Get Started
        </Link>

        <Dialog.Close
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </Dialog.Close>
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  className,
}: {
  name: string;
  price: string;
  features: string[];
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${className ?? "border-white/10 bg-white/5"}`}>
      <div className="text-white/90 font-semibold">{name}</div>
      <div className="text-3xl font-extrabold mt-1">{price}</div>
      <div className="text-white/60 text-xs mb-3">per month</div>
      <ul className="space-y-2 text-white/85">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <span className="text-sm">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
} 