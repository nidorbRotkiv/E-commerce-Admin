import Link from "next/link";
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import PenIcon from "../components/icons/penIcon";
import TrashIcon from "../components/icons/trashIcon";
import Spinner from "../components/Spinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const swal = withReactContent(Swal);

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const alertError = (message, error) => {
    swal.fire(message + ": " + error);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/products");
      const sortedProducts = res.data.sort((a, b) => {
        return a.title.localeCompare(b.title);
      });
      setProducts(sortedProducts);
    } catch (error) {
      alertError("Error loading products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await axios.put("/api/products", {
        ...product,
        featured: !product.featured,
      });
      loadProducts();
    } catch (error) {
      alertError("Error updating product", error);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

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
      <Link className="btn-primary" href={"/products/new"}>
        Add new product
      </Link>
      <table className="basic mt-4">
        <thead>
          <tr>
            <td>Product name</td>
            <td>Edit / Delete</td>
            <td>Featured</td>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>{product.title}</td>
              <td>
                <Link href={`/products/edit/${product._id}`}>
                  <PenIcon />
                </Link>
                <Link href={`/products/delete/${product._id}`}>
                  <TrashIcon />
                </Link>
              </td>
              <td>
                <input
                  className="h-4 w-4 ml-6"
                  type="checkbox"
                  checked={product.featured}
                  onChange={() => toggleFeatured(product)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
