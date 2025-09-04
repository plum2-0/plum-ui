import { Session } from "next-auth";
import { PlumSproutLogo } from "@/components/PlumSproutLogo";
import { SignOutButton } from "@/components/SignOutButton";

interface OnboardingHeaderProps {
  session: Pick<Session, "user">;
}

export function OnboardingHeader({ session }: OnboardingHeaderProps) {
  return (
    <header className="p-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-xl"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          <PlumSproutLogo className="w-8 h-8" />
        </div>
        <span className="font-heading text-xl font-bold text-white tracking-wide">
          PlumSprout
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full border-2 border-white/30"
            />
          )}
          <span className="text-white/90 font-body font-medium">
            {session.user?.name}
          </span>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}
