import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Demo authentication - accept any email with 4+ character password
          // In production, you would verify against your Teachers table in Airtable
          const isValidPassword = credentials.password.length >= 4;
          
          if (!isValidPassword) {
            return null;
          }

          // Create a demo user object
          const user = {
            id: 'demo-user',
            email: credentials.email,
            name: credentials.email.split('@')[0], // Use part before @ as name
            department: 'Computer Science' // Default department
          };

          return user;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.department = token.department as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
};
