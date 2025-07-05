import { DefaultSession } from "next-auth"
import { JWT as DefaultJWT } from "next-auth/jwt"
import type { User, Session, JWT as AppJWT } from "@/types/auth"

declare module "next-auth" {
  interface User extends User {}

  interface Session extends DefaultSession, Session {}
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, AppJWT {}
} 