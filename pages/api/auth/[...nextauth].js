import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "ecommerce-shared/mongoDB/mongodb";

const adminEmails = process.env.ADMIN_EMAILS.split(",");

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({ session, token, user }) => {
      if (adminEmails.includes(user?.email)) {
        return session;
      } else {
        return null;
      }
    },
  },
};

export default NextAuth(authOptions);

export async function isAdminRequest(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (adminEmails.includes(session?.user?.email)) {
    return true;
  } else {
    res.status(401).json({ error: "not an admin" });
    throw "not an admin";
  }
}
