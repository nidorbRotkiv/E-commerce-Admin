import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";
import TrashIcon from "../components/icons/trashIcon";

const swal = withReactContent(Swal);

export default function Brands() {
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadBrands() {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/brands");
      setBrands(res.data);
    } catch (error) {
      swal.fire("Error loading brands: " + error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBrands();
  }, []);

  async function saveBrand(ev) {
    ev.preventDefault();
    try {
      for (const b of brands) {
        if (b.name.toLowerCase() === brand.toLowerCase()) {
          return swal.fire("Brand already exists");
        }
      }
      await axios.post("/api/brands", { name: brand.trim() });
      setBrand("");
    } catch (error) {
      return swal.fire("Error saving brand: " + error);
    }
    loadBrands();
  }

  async function isBrandInUse(brandName) {
    const products = await axios.get("/api/products");
    for (const product of products.data) {
      if (!product.properties) {
        continue;
      }
      for (const property of Object.keys(product.properties)) {
        if (
          property === "brand" &&
          product.properties[property] === brandName
        ) {
          return { isUsed: true, product };
        }
      }
    }
    return false;
  }

  async function deleteBrand(brand) {
    try {
      const { isUsed, product } = await isBrandInUse(brand.name);
      if (isUsed) {
        return swal.fire(
          `brand is in use in "${product.title}" and can therefore not be deleted`
        );
      }
      swal
        .fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
        })
        .then(async (result) => {
          if (result.isConfirmed) {
            await axios.delete(`/api/brands?_id=${brand._id}`);
            loadBrands();
          }
        });
    } catch (error) {
      return swal.fire("Error deleting brand: " + error);
    }
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
      <form onSubmit={saveBrand}>
        <label>Brand name</label>
        <input
          type="text"
          name="name"
          placeholder="Brand..."
          value={brand}
          onChange={(ev) => setBrand(ev.target.value)}
        />
        <div className="flex gap-1">
          <button type="submit" className="btn-primary">
            Save
          </button>
        </div>
      </form>
      {brands.length > 0 && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Brand name</td>
              <td>Delete</td>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand._id}>
                <td>{brand.name}</td>
                <td>
                  <button
                    onClick={() => deleteBrand(brand)}
                    className="btn-primary flex items-center gap-1"
                  >
                    <span>Delete</span>
                    <TrashIcon className="ml-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
