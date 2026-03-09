import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account }: any) {
            if (account?.provider === 'google') {
                try {
                    // Register/login user in our backend
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/google`,
                        {
                            email: user.email,
                            name: user.name,
                            googleId: account.providerAccountId
                        }
                    );
                    // Store our backend tokens
                    user.backendToken = response.data.accessToken;
                    user.refreshToken = response.data.refreshToken;
                    user.role = response.data.user.role;
                    user.backendId = response.data.user.id;
                    return true;
                } catch (error) {
                    console.error('Backend sync error:', error);
                    return true; // Still allow login even if backend sync fails
                }
            }
            return true;
        },
        async jwt({ token, user }: any) {
            if (user) {
                token.backendToken = user.backendToken;
                token.refreshToken = user.refreshToken;
                token.role = user.role;
                token.backendId = user.backendId;
            }
            return token;
        },
        async session({ session, token }: any) {
            session.backendToken = token.backendToken;
            session.refreshToken = token.refreshToken;
            session.role = token.role;
            session.backendId = token.backendId;
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_development_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };