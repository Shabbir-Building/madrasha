import { API_URL } from '@/config/api';
import { AdminProfile } from '@/domain/admins';
import type { NextAuthOptions, Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

type BackendAdminProfile = {
  fullname: string;
  phone_number: string;
  role: number;
  access_boys_section: boolean;
  access_girls_section: boolean;
  permissions?: Record<string, boolean>;
};

type BackendLoginResponse = {
  success: boolean;
  message: string;
  data?: {
    token: string;
    admin: BackendAdminProfile;
  };
  timestamp: string;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        phone_number: { label: 'Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(
        credentials: Partial<{ phone_number: string; password: string }> | undefined,
      ) {
        const credSchema = z.object({
          phone_number: z.string(),
          password: z.string(),
        });
        const parsed = credSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const res = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number: parsed.data.phone_number,
            password: parsed.data.password,
          }),
        });
        if (!res.ok) return null;
        const json: BackendLoginResponse = await res.json();
        const data = json?.data;
        if (!data?.token || !data?.admin) return null;
        console.log('NextAuth: authorize - raw admin data:', JSON.stringify(data.admin, null, 2));
        const admin: BackendAdminProfile = data.admin;
        const user: User & (BackendAdminProfile & { token: string }) = {
          id: admin.phone_number,
          name: admin.fullname,
          email: null,
          image: null,
          token: data.token,
          ...admin,
        } as unknown as User & (BackendAdminProfile & { token: string });
        return user;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User | (User & BackendAdminProfile & { token: string });
    }) {
      if (user && 'token' in (user as object)) {
        const u = user as User & BackendAdminProfile & { token: string };
        console.log('NextAuth: jwt callback - user:', JSON.stringify(u, null, 2));

        const adminData: AdminProfile = {
          fullname: u.fullname,
          phone_number: u.phone_number,
          role: u.role,
          permissions: {
            access_boys_section: u.access_boys_section ?? u.permissions?.access_boys_section,
            access_girls_section: u.access_girls_section ?? u.permissions?.access_girls_section,
          },
        };

        console.log(
          'NextAuth: jwt callback - mapped admin profile:',
          JSON.stringify(adminData, null, 2),
        );

        (token as JWT & { accessToken?: string; admin?: AdminProfile }).accessToken = u.token;
        (token as JWT & { accessToken?: string; admin?: AdminProfile }).admin = adminData;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { accessToken?: string; admin?: AdminProfile };
    }) {
      (session as Session & { accessToken?: string; admin?: AdminProfile }).accessToken =
        token.accessToken;
      (session as Session & { accessToken?: string; admin?: AdminProfile }).admin = token.admin;
      return session;
    },
  },
  cookies: {
    // Let NextAuth create a session cookie (expires on browser close)
  },
  pages: {
    signIn: '/login',
  },
};
