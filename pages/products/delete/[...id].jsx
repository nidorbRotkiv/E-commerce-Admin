import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { deleteImagesFromDatabase } from "../../../lib/utilityFunctions";
import Layout from "../../../components/Layout";

export default function DeleteProductPage() {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/products?id=${id}`).then((res) => {
      setProduct(res.data);
    });
  }, [id]);

  async function deleteProduct() {
    try {
      const images = product.variantValues
        .map((variant) => variant.images)
        .flat();
      await deleteImagesFromDatabase(images);
    } catch (error) {
      console.error("error deleting images: " + error);
    }
    await axios.delete(`/api/products?id=${id}`);
    router.push("/products");
  }

  return (
    <Layout>
      <h1 className="text-center">
        Do you really want to delete &quot;{product?.title}&quot;?
      </h1>
      <div className="flex gap-2 justify-center">
        <button onClick={deleteProduct} className="btn-red">
          Yes
        </button>
        <button
          className="btn-default"
          onClick={() => router.push("/products")}
        >
          No
        </button>
      </div>
    </Layout>
  );
}
