import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '@/models/User';
import { mongooseConnect } from '@/lib/mongoose';

async function isLoginEmail(email) {
  mongooseConnect();

  const user = await User.findOne({ email });
  console.log(user);
  return user;
}
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Sign in with Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials == null) return null;
        // login
        const { email, password } = credentials;
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('Invalid credentials');
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }
        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user._id.toString(); // Convert ObjectID to string
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user = { id: token.id, name: token.name, email: token.email };
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);

export async function isLoginRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!(await isLoginEmail(session?.user?.email))) {
    res.status(401);
    res.end();
    throw 'not login';
  }
}
