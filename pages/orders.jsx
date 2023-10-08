import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import Spinner from "../components/Spinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const swal = withReactContent(Swal);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeliveredOrders, setShowDeliveredOrders] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [showDeliveredOrders]);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/orders");
      let filteredOrders = res.data;
      if (showDeliveredOrders) {
        filteredOrders = filteredOrders.filter((order) => order.delivered);
      } else {
        filteredOrders = filteredOrders.filter((order) => !order.delivered);
      }
      setOrders(filteredOrders);
    } catch (error) {
      swal.fire("Error loading categories: " + error);
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleDelivered(order) {
    await axios.put("/api/orders", { ...order, delivered: !order.delivered });
    loadOrders();
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1>Orders</h1>
      <div className="space-x-4 mt-4 mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showDeliveredOrders}
            onChange={() => setShowDeliveredOrders(!showDeliveredOrders)}
            className="form-checkbox h-5 w-5"
          />
          <span className="ml-2 text-sm">Show Delivered Orders</span>
        </label>
      </div>
      <table className="basic">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Products</th>
            <th>Delivered</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 &&
            orders.map((order) => (
              <tr key={order._id} className="border">
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>
                  {order.name}
                  <br />
                  {order.email}
                  <br />
                  {order.streetAddress}
                  <br />
                  {order.postalCode}
                  <br />
                  {order.city}
                  <br />
                  {order.country}
                  <br />
                  {order.phoneNumber}
                  <br />
                  {order.idNumber}
                </td>
                <td key={order._id}>
                  {order.line_items.map((l, i) => (
                    <div key={i}>
                      {l.price_data?.product_data.name} x{l.quantity}
                      <br />
                    </div>
                  ))}
                </td>
                <td>
                  <button
                    onClick={() => toggleDelivered(order)}
                    className={`border px-2 ${
                      order.delivered ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {order.delivered ? "YES" : "NO"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
}
