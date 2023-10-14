import { mongooseConnect } from "ecommerce-shared/mongoDB/mongoose";
import { Product } from "ecommerce-shared/models/Product";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);
  try {
    const _id = req.query?.id;
    if (req.method === "GET") {
      if (req.query?.id) {
        res.status(200).json(await Product.findOne({ _id }));
      } else {
        res.status(200).json(await Product.find());
      }
    } else if (req.method === "DELETE") {
      if (req.query?.id) {
        await Product.deleteOne({ _id });
        res.status(200).json({ message: "Product deleted successfully." });
      }
    } else {
      const {
        _id,
        title,
        description,
        category,
        properties,
        featured,
        variantKey,
        variantValues,
      } = req.body;
      const data = {
        title,
        description,
        category: category || null,
        properties: properties || null,
        featured: featured || false,
        variantKey,
        variantValues,
        selectedVariant: variantValues[0],
      };
      if (req.method === "POST") {
        const productDoc = await Product.create(data);
        res.status(200).json(productDoc);
      } else if (req.method === "PUT") {
        await Product.updateOne({ _id }, data);
        res.status(200).end();
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}
