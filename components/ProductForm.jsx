import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "./Spinner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { deleteImagesFromDatabase } from "../lib/utilityFunctions";
import Variants from "./Variants";

const swal = withReactContent(Swal);

export default function ProductForm({ _id, ...existingProduct }) {
  const [product, setProduct] = useState({
    title: existingProduct?.title || "",
    description: existingProduct?.description || "",
    properties: existingProduct?.properties || {},
    category: existingProduct?.category || "",
    variantKey: existingProduct?.variantKey || "",
    variantValues: existingProduct?.variantValues || [],
    featured: existingProduct?.featured || false,
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [hasVariants, setHasVariants] = useState(product.variantKey !== "");
  const {
    title,
    description,
    properties,
    category,
    variantKey,
    variantValues,
    featured,
  } = product;

  useEffect(() => {
    (async () => {
      try {
        const categoriesResponse = await axios.get("/api/categories");
        setCategories(categoriesResponse.data);
        const brandsResponse = await axios.get("/api/brands");
        setBrands(brandsResponse.data);
      } catch (error) {
        swal.fire({
          title: `Error fetching data: ${error}`,
          icon: "warning",
        });
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (variantKey !== "") {
      setHasVariants(true);
    } else {
      setHasVariants(false);
    }
  }, [variantKey]);

  const router = useRouter();

  function checkVariantsExists() {
    if (!hasVariants) {
      return;
    }
    const uniqueValues = new Set();
    for (let i = 0; i < variantValues.length; i++) {
      if (variantValues.length === 0 || variantValues[i].value === "") {
        return swal.fire("Variant values are required");
      }
      if (uniqueValues.has(variantValues[i].value)) {
        return swal.fire("Duplicate variant values found");
      }
      uniqueValues.add(variantValues[i].value);
    }
  }

  async function saveProduct(ev) {
    ev.preventDefault();
    if (title === "") return swal.fire("Title is required");
    checkVariantsExists();
    try {
      await deleteImagesFromDatabase(imagesToDelete);
    } catch (error) {
      swal.fire({
        title: `Error deleting image: ${error}`,
        icon: "warning",
      });
    }
    const data = {
      title: title,
      description: description,
      category: category,
      properties: properties,
      variantKey: variantKey,
      variantValues: variantValues,
      featured: featured,
    };
    if (_id) {
      //update product
      try {
        await axios.put("/api/products", { _id, ...data });
      } catch (error) {
        swal.fire({
          title: `Error updating product: ${error}`,
          icon: "warning",
        });
      }
    } else {
      //create product
      try {
        await axios.post("/api/products", data);
      } catch (error) {
        swal.fire({
          title: `Error creating product: ${error}`,
          icon: "warning",
        });
      }
    }
    router.push("/products");
  }

  // get all properties from category and its parents
  const propertiesToFill = [
    { name: "brand", values: brands.map((b) => b.name) },
  ];
  if (category && categories.length > 0) {
    let CategoryInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...CategoryInfo.properties);
    while (
      CategoryInfo?.parentCategory?._id &&
      CategoryInfo?.parentCategory?._id !== CategoryInfo?._id
    ) {
      const parentCategory = categories.find(
        ({ _id }) => _id === CategoryInfo.parentCategory._id
      );
      propertiesToFill.push(...parentCategory.properties);
      CategoryInfo = parentCategory;
    }
  }

  function changeProperty(name, value) {
    setProduct((prevProduct) => ({
      ...prevProduct,
      properties: {
        ...prevProduct.properties,
        [name]: value,
      },
    }));
  }

  useEffect(() => {
    // set properties to default values
    const newProperties = {
      brand: properties.brand || propertiesToFill[0].values[0],
    };

    propertiesToFill.forEach((property) => {
      if (property.name !== "brand") {
        newProperties[property.name] = property.values[0];
      }
    });

    setProduct((prevProduct) => ({
      ...prevProduct,
      properties: newProperties,
    }));
  }, [category, categories]);

  function handleVariantsChange(variantKey, variantValues) {
    setProduct((prevProduct) => ({
      ...prevProduct,
      variantKey,
      variantValues,
    }));
  }

  async function cancel() {
    const result = await new Promise((resolve, reject) => {
      swal
        .fire({
          title: "Are you sure?",
          text: "This product will not be saved",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, don't save!",
          cancelButtonText: "No, keep it",
        })
        .then((result) => {
          resolve(result);
        });
    });

    if (result.isConfirmed) {
      if (_id) {
        await deleteImagesFromDatabase(newImages);
      } else {
        const variantImages = variantValues.map((variant) =>
          variant.images.map((image) => image)
        );
        await deleteImagesFromDatabase([
          ...imagesToDelete,
          ...variantImages.flat(),
        ]);
      }
      router.push("/products");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        name="title"
        placeholder="product name"
        value={title}
        onChange={(ev) => setProduct({ ...product, title: ev.target.value })}
      />
      <label>Category</label>
      <select
        value={category}
        name=""
        id=""
        onChange={(ev) => setProduct({ ...product, category: ev.target.value })}
      >
        <option value="">No category</option>
        {categories.length > 0 &&
          categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((property, index) => (
          <div key={index}>
            <label>
              {property.name[0].toUpperCase() + property.name.substring(1)}
            </label>
            <div>
              <select
                value={properties[property.name] || ""}
                onChange={(ev) => {
                  changeProperty(property.name, ev.target.value);
                }}
              >
                {property.values.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      <label>Description</label>
      <textarea
        name="description"
        placeholder="description"
        value={description}
        onChange={(ev) =>
          setProduct({ ...product, description: ev.target.value })
        }
      ></textarea>
      <Variants
        onVariantsChange={handleVariantsChange}
        setImagesToDelete={setImagesToDelete}
        setNewImages={setNewImages}
        existingProduct={existingProduct}
      />
      <div className="flex gap-1">
        <button type="submit" className="btn-primary">
          Save
        </button>
        <button onClick={cancel} type="button" className="btn-default">
          Cancel
        </button>
      </div>
    </form>
  );
}
