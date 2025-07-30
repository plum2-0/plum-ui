import { Session } from "next-auth";
import { PlumLogo } from "@/components/PlumLogo";
import { SignOutButton } from "@/components/SignOutButton";

interface OnboardingHeaderProps {
  session: Session;
}

export function OnboardingHeader({ session }: OnboardingHeaderProps) {
  return (
    <header className="p-6 flex justify-between items-center">
      <PlumLogo />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-white">{session.user?.name}</span>
        </div>
        <SignOutButton />
      </div>
    </header>
  );
}