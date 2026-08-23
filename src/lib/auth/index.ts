import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

import { env } from "@/lib/env";
import { isAllowedEmail } from "@/lib/auth/allowlist";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    signIn({ user }) {
      return isAllowedEmail(user.email, env.ADMIN_EMAILS);
    },
  },
});
