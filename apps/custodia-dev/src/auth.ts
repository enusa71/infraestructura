import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

function rolesDesdeToken(accessToken?: string): string[] {
  if (!accessToken) return [];
  try {
    const [, payload] = accessToken.split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    const realm: string[] = claims.realm_access?.roles ?? [];
    const client: string[] = claims.resource_access?.["custodia-herramientas"]?.roles ?? [];
    return Array.from(new Set([...realm, ...client]));
  } catch {
    return [];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.roles = rolesDesdeToken(account.access_token);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.roles = token.roles ?? [];
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
