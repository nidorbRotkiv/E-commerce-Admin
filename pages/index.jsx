import Layout from "../components/Layout";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [orders, setOrders] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    if(!session) return;
    axios.get("/api/orders").then((res) => {
      setOrders(res.data);
    });
  }, [session]);

  const filteredOrders = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return orders.filter((order) => new Date(order.createdAt) >= date);
  }

  const getRevenue = (days) => {
    return filteredOrders(days).reduce((total, order) => {
      return (
        total +
        order.line_items.reduce(
          (subtotal, item) =>
            subtotal + item.price_data.unit_amount * item.quantity, 0) / 100);
    }, 0);
  };

  return (
    <Layout>
      <div className="text-primary flex flex justify-between">
        <h2>
          Hello, <b>{session?.user?.name ?? session?.user?.email}!</b>
        </h2>
        <div className="flex bg-gray-300 text-black gap-1 rounded-lg overflow-hidden">
          <Image
            className="w-8 h-8"
            src={session?.user?.image}
            width={0}
            height={0}
            sizes="100vw"
            alt="profile picture"
          ></Image>
          <span className="py-1 px-2">
            {session?.user?.name ?? session?.user?.email}
          </span>
        </div>
      </div>
      <table className="w-full border-collapse mt-5">
      <thead>
        <tr>
          <th className="border p-2">Period</th>
          <th className="border p-2">Orders</th>
          <th className="border p-2">Revenue</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border p-2">Year</td>
          <td className="border p-2">{filteredOrders(365).length}</td>
          <td className="border p-2">S/ {getRevenue(365)}</td>
        </tr>
        <tr>
          <td className="border p-2">30 days</td>
          <td className="border p-2">{filteredOrders(30).length}</td>
          <td className="border p-2">S/ {getRevenue(30)}</td>
        </tr>
        <tr>
          <td className="border p-2">7 days</td>
          <td className="border p-2">{filteredOrders(7).length}</td>
          <td className="border p-2">S/ {getRevenue(7)}</td>
        </tr>
      </tbody>
    </table>
    </Layout>
  );
}
