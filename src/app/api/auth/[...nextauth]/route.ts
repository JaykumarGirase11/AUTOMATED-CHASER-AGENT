import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('SignIn callback called:', user.email);
      if (account?.provider === 'google') {
        try {
          await dbConnect();
          
          // Check if user exists
          let existingUser = await User.findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user with minimal data
            existingUser = await User.create({
              name: user.name || 'User',
              email: user.email,
              emailVerified: true,
              authProvider: 'google',
              googleId: user.id,
            });
            console.log('New Google user created:', user.email);
          } else {
            // Update existing user with Google info
            if (!existingUser.googleId) {
              existingUser.googleId = user.id;
              existingUser.authProvider = 'google';
              existingUser.emailVerified = true;
              await existingUser.save();
              console.log('Existing user linked to Google:', user.email);
            }
          }
          
          console.log('SignIn returning true for:', user.email);
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          // Return true anyway to allow login
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback called, account:', account?.provider);
      if (account?.provider === 'google' && user) {
        token.userId = user.id;
        token.name = user.name;
        token.email = user.email;
        token.provider = 'google';
        
        // Try to get DB user ID
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.userId = dbUser._id.toString();
            console.log('JWT: Found DB user:', dbUser._id.toString());
          }
        } catch (error) {
          console.error('JWT callback DB error:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback called, token:', token.email);
      if (token) {
        session.user.id = token.userId as string;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback:', url, baseUrl);
      // Always redirect to dashboard after login
      if (url.includes('/api/auth') || url === baseUrl || url.includes('/login')) {
        return `${baseUrl}/dashboard`;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? `__Secure-next-auth.session-token`
        : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
