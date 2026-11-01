import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { prisma } from './db';

const isProduction = process.env.NODE_ENV === 'production';
const hasGoogleCreds = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'mednavi-secure-fallback-secret-key-32chars',
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Demo login is strictly disabled in production
    ...(!isProduction
      ? [
          CredentialsProvider({
            id: 'credentials',
            name: 'Demo Login (Development Only)',
            credentials: {
              email: { label: 'Email', type: 'email', placeholder: 'demo@mednavi.jp' },
              name: { label: 'Name', type: 'text', placeholder: 'Demo User' },
            },
            async authorize(credentials) {
              if (process.env.NODE_ENV === 'production') {
                return null;
              }
              const email = credentials?.email?.trim().toLowerCase() || 'demo@mednavi.jp';
              const name = credentials?.name?.trim() || email.split('@')[0] || 'Demo User';

              try {
                const dbUser = await prisma.user.upsert({
                  where: { email },
                  update: { name },
                  create: {
                    email,
                    name,
                    nationality: 'India',
                    city: 'Tokyo',
                    insurance_type: 'National Health Insurance',
                  },
                });

                // Ensure a UserProfile exists
                await prisma.userProfile.upsert({
                  where: { userId: dbUser.id },
                  update: {},
                  create: {
                    userId: dbUser.id,
                    language: 'en',
                    ward: 'Shinjuku',
                    nationality: 'India',
                    insuranceType: 'National Health Insurance',
                    saveHistory: true,
                  },
                }).catch(() => null);

                return {
                  id: dbUser.id,
                  name: dbUser.name || name,
                  email: dbUser.email || email,
                };
              } catch (err) {
                console.warn('Demo authorize fallback:', err);
                return {
                  id: 'demo-user-id',
                  name,
                  email,
                };
              }
            },
          }),
        ]
      : []),

    // Real Google OAuth provider
    ...(hasGoogleCreds
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return true;

      // When signing in with Google (or any OAuth), ensure User record exists in DB
      try {
        const email = user.email.toLowerCase();
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {
            name: user.name || undefined,
          },
          create: {
            email,
            name: user.name || email.split('@')[0],
            nationality: 'Other',
            city: 'Tokyo',
            insurance_type: 'National Health Insurance',
          },
        });

        // Ensure user profile exists
        await prisma.userProfile.upsert({
          where: { userId: dbUser.id },
          update: {},
          create: {
            userId: dbUser.id,
            language: 'en',
            ward: 'Chiyoda',
            saveHistory: true,
          },
        }).catch(() => null);

        // Attach DB id to user object so jwt callback receives it
        user.id = dbUser.id;
      } catch (err) {
        console.warn('signIn DB sync error (continuing with session):', err);
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        const userId = (token.id as string) || (token.sub as string);
        (session.user as any).id = userId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
