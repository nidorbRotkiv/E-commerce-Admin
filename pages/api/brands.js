import { mongooseConnect } from "ecommerce-shared/mongoDB/mongoose";
import { Brand } from "ecommerce-shared/models/Brand";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  try {
    await isAdminRequest(req, res);
    await mongooseConnect();

    if (req.method === "POST") {
      const { name } = req.body;
      const brandDoc = await Brand.create({ name });
      res.status(201).json(brandDoc);
    } 
    
    else if (req.method === "GET") {
      const brands = await Brand.find({});
      res.status(200).json(brands);
    } 
    
    else if (req.method === "DELETE") {
      const { _id } = req.query;
      await Brand.deleteOne({ _id });
      res.status(200).json({ message: "Brand deleted successfully." });
    } 
    
    else {
      res.status(405).json({ error: "Method not allowed for this route." });
    }
    
  } catch (error) {
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}
