import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import Nav from "./Nav";
import HamburgerIcon from "./icons/hamburgerIcon";
import StoreIcon from "./icons/storeIcon";

export default function Layout({ children }) {
  const { data: session } = useSession();
  const [showNav, setShowNav] = useState(false);
  if (!session) {
    return (
      <div className="bg-pink-400 w-screen h-screen flex items-center">
        <div className="text-center w-full">
          <button
            onClick={() => signIn("google")}
            className="bg-white p-2 rounded-lg px-4"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }
  // if logged in
  return (
    <div className="bg-pink-50 min-h-screen">
      <div className="block md:hidden flex items-center p-5">
        <button
          onClick={() => {
            setShowNav(!showNav);
          }}
        >
          <HamburgerIcon />
        </button>
        <div className="flex grow justify-center mr-6">
          <Link href={"/"} className="flex gap-1">
            <StoreIcon />
            <span className="">EcommerceAdmin</span>
          </Link>
        </div>
      </div>
      <div className="flex">
        <Nav show={showNav} />
        <div className="flex-grow p-4">{children}</div>
      </div>
    </div>
  );
}
