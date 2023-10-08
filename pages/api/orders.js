import { mongooseConnect } from "ecommerce-shared/mongoDB/mongoose";
import { Order } from "ecommerce-shared/models/Order";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  await isAdminRequest(req, res);
  await mongooseConnect();
  try {
    if (req.method === "GET") {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.status(200).json(orders);
    } 
    
    else if (req.method === "PUT") {
      const order = req.body;
      await Order.updateOne({ _id: order._id }, order);
      res.status(200).end();
    }

  } catch (error) {
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}
