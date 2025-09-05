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

// Connection and User interfaces removed - unused types
