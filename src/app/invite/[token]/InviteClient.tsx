"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function InviteClient({ token }: { token: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<any>(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/invites/${token}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load invite");
        }
        const data = await res.json();
        setInvite(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load invite");
      } finally {
        setLoading(false);
      }
    };
    fetchInvite();
  }, [token]);

  const acceptInvite = async () => {
    try {
      const res = await fetch(`/api/invites/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to accept invite");
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Failed to accept invite");
    }
  };

  // Auto-accept invite when user becomes authenticated
  useEffect(() => {
    if (status === "authenticated" && invite && !error) {
      acceptInvite();
    }
  }, [status, invite, error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        Loading invite...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg text-white max-w-lg text-center">
          <div className="text-red-300 mb-2">{error}</div>
          <button
            className="mt-2 px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
            onClick={() => router.replace("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const requiresAuth = status !== "authenticated";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg text-white max-w-xl w-full">
        <h1 className="text-2xl font-semibold mb-2">
          Join {invite?.brandName || "this brand"}
        </h1>
        <p className="text-purple-200 mb-6">
          You have been invited to collaborate. Accepting will link your account
          to this brand.
        </p>
        {/* No restricted email messaging */}
        {requiresAuth ? (
          <a
            href={`/api/auth/signin?callbackUrl=${encodeURIComponent(
              `/invite/${token}`
            )}`}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 inline-block"
          >
            Sign in to Accept
          </a>
        ) : (
          <button
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700"
            onClick={acceptInvite}
          >
            Accept Invite
          </button>
        )}
      </div>
    </div>
  );
}
