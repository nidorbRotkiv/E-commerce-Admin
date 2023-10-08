import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import StoreIcon from "./icons/storeIcon";
import OrdersIcon from "./icons/ordersIcon";
import ProductsIcon from "./icons/productsIcon";
import SettingsIcon from "./icons/settingsIcon";
import HomeIcon from "./icons/homeIcon";
import CategoriesIcon from "./icons/categoriesIcon";
import LogoutIcon from "./icons/logoutIcon";
import TagIcon from "./icons/tagIcon";

export default function Nav({ show }) {
  const inactiveLink = "flex gap-1 p-1";
  const activeLink = inactiveLink + " bg-pink-300 text-black rounded-lg";
  const router = useRouter();
  const pathName = router.pathname;
  return (
    <aside
      className={
        (show ? "left-0" : "-left-full") +
        " border-r-2 text-gray-500 p-4 fixed bg-pink-50 w-full h-full md:static md:w-auto transition-all"
      }
    >
      <Link href={"/"} className="flex gap-1 mb-4 mr-4">
        <StoreIcon />
        <span className="">EcommerceAdmin</span>
      </Link>
      <nav className="flex flex-col gap-2">
        <Link
          href={"/"}
          className={pathName === "/" ? activeLink : inactiveLink}
        >
          <HomeIcon />
          Dashboard
        </Link>
        <Link
          href={"/products"}
          className={pathName.includes("/products") ? activeLink : inactiveLink}
        >
          <ProductsIcon />
          Products
        </Link>
        <Link
          href={"/categories"}
          className={
            pathName.includes("/categories") ? activeLink : inactiveLink
          }
        >
          <CategoriesIcon />
          Categories
        </Link>
        <Link
          href={"/orders"}
          className={pathName.includes("/orders") ? activeLink : inactiveLink}
        >
          <OrdersIcon />
          Orders
        </Link>
        <Link
          href={"/brands"}
          className={pathName.includes("/brands") ? activeLink : inactiveLink}
        >
          <TagIcon />
          Brands
        </Link>
        <Link
          href={"/settings"}
          className={pathName.includes("/settings") ? activeLink : inactiveLink}
        >
          <SettingsIcon />
          Settings
        </Link>
        <button
          onClick={async () => {
            await router.push("/");
            await signOut();
          }}
          className={inactiveLink}
        >
          <LogoutIcon />
          Log out
        </button>
      </nav>
    </aside>
  );
}
