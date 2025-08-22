import NextAuth, { DefaultJWT, DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
  }

  interface User {
    accessToken: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    accessToken: string;
  }
}
