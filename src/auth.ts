import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      authorization: {
        params: {
          scope: `openid profile email api://${process.env.AZURE_MICROSOFT_ENTRA_APP_ID}/${process.env.AZURE_MICROSOFT_ENTRA_APP_SCOPE}`,
          // scope: `openid profile User.Read email api://${process.env.AZURE_MICROSOFT_ENTRA_APP_ID}/${process.env.AZURE_MICROSOFT_ENTRA_APP_SCOPE}`,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = await account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = await token.accessToken;

      // const profilePicture = await fetch(`https://graph.microsoft.com/v1.0/me/photos/64x64/$value`, {
      //   headers: {
      //     Authorization: `Bearer ${token.accessToken}`,
      //   },
      // });

      // if (profilePicture.ok) {
      //   const pictureBuffer = await profilePicture.arrayBuffer();
      //   const pictureBase64 = Buffer.from(pictureBuffer).toString('base64');
      //   session.user.image = `data:image/jpeg;base64, ${pictureBase64}`;
      // }

      return session;
    },
  },
});
