import { mongooseConnect } from "ecommerce-shared/mongoDB/mongoose";
import { Category } from "ecommerce-shared/models/Category";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handleRequest(req, res) {
  try {
    await isAdminRequest(req, res);
    await mongooseConnect();

    if (req.method === "POST") {
      const { name, parentCategory, properties, image } = req.body;
      const categoryDoc = await Category.create({
        name,
        parentCategory: parentCategory || null,
        properties: properties || null,
        image: image || null,
      });
      res.status(200).json(categoryDoc);
    }

    else if (req.method === "PUT") {
      const {
        _id,
        name: updatedName,
        parentCategory: updatedParentCategory,
        properties: updatedProperties,
        image: updatedImage,
      } = req.body;
      const updatedFields = {
        name: updatedName,
        parentCategory: updatedParentCategory || null,
        properties: updatedProperties || null,
        image: updatedImage || null,
      };
      const updatedCategory = await Category.updateOne({ _id }, updatedFields);
      res.status(200).json(updatedCategory);
    }

    else if (req.method === "GET") {
      const categories = await Category.find().populate("parentCategory");
      res.status(200).json(categories);
    }

    else if (req.method === "DELETE") {
      const { _id: deleteId } = req.query;
      await Category.deleteOne({ _id: deleteId });
      res.status(200).json({ message: "Category deleted successfully." });

    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }

  } catch (error) {
    res.status(500).json({ error: "An unexpected error occurred." });
  }
}
