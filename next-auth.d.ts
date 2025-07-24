import { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"
import type { User, Session, JWT as AppJWT } from "@/types/auth"

declare module "next-auth" {
  // Extend Session so that session.user always has an id: string
  interface Session extends DefaultSession {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      account_id?: string;
      organization_id?: string;
      role?: string;
      response_email?: string;
      login_count?: number;
      provider?: string;
      authType?: string;
      // add other custom fields if needed
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, AppJWT {}
} 