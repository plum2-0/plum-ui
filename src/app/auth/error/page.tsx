import { Suspense } from "react";
import AuthErrorContent from "./auth-error-content";

export default function AuthError() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}