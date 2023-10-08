import Layout from "../components/Layout";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Spinner from "../components/Spinner";
import TrashIcon from "../components/icons/trashIcon";
import PenIcon from "../components/icons/penIcon";
import UploadIcon from "../components/icons/uploadIcon";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Image from "next/image";
import { deleteImagesFromDatabase } from "../lib/utilityFunctions";
import { validFileTypes } from "../lib/constants";

const swal = withReactContent(Swal);

export default function Categories() {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState("");
  const [properties, setProperties] = useState([]);
  const [image, setImage] = useState(null);

  const heic2anyRef = useRef(null);

  useEffect(() => {
    // Done because heic2any is not SSR compatible
    import("heic2any").then((heic2any) => {
      heic2anyRef.current = heic2any.default;
    });
    loadCategories();
  }, []);

  function resetForm() {
    setName("");
    setParentCategory("");
    setProperties([]);
    setImage(null);
    setEditedCategory(null);
  }

  async function loadCategories() {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/categories");
      setCategories(res.data);
    } catch (error) {
      swal.fire("Error loading categories: " + error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    setName(name.trim());
    if (!name) {
      return swal.fire("Category name is required");
    }
    const filteredProperties = properties.filter(
      (p) => p.name.trim() !== "" && p.values.trim() !== ""
    );
    const data = {
      name,
      parentCategory,
      properties: filteredProperties.map((p) => ({
        name: p.name,
        values: p.values.split(","),
      })),
      image,
    };
    try {
      if (editedCategory) {
        //update category
        data._id = editedCategory._id;
        await axios.put("/api/categories", data);
      } else {
        //create category
        for (const c of categories) {
          if (c.name.toLowerCase() === name.toLowerCase()) {
            return swal.fire("A category with this name already exists");
          }
        }
        await axios.post("/api/categories", data);
      }
      resetForm();
      await loadCategories();
    } catch (error) {
      return swal.fire("Error saving category: " + error);
    }
  }

  async function deleteCategory(category) {
    try {
      const products = await axios.get("/api/products");
      for (const product of products.data) {
        if (!product.category) {
          continue;
        }
        if (product.category === category._id) {
          return swal.fire(
            `"${product.title}" uses this category and it can therefore not be deleted.`
          );
        }
      }
    } catch (error) {
      return swal.fire(
        "Error looking for products present in the category: " + error
      );
    }

    swal
      .fire({
        title: `Are you sure you want to delete ${category.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: "#d55",
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`/api/categories?_id=${category._id}`);
            await loadCategories();
          } catch (error) {
            swal.fire({
              title: "Error deleting category",
              icon: "error",
              text: error,
            });
          }
        }
      });
  }

  function addProperty() {
    setProperties((prev) => [...prev, { name: "", values: "" }]);
  }

  function handlePropertyNameChange(index, _, newName) {
    setProperties((prev) => {
      const newProperties = [...prev];
      newProperties[index].name = newName;
      return newProperties;
    });
  }

  function handlePropertyValuesChange(index, _, newValues) {
    setProperties((prev) => {
      const newProperties = [...prev];
      newProperties[index].values = newValues;
      return newProperties;
    });
  }

  function removeProperty(index) {
    setProperties((prev) => {
      const newProperties = [...prev];
      newProperties.splice(index, 1);
      return newProperties;
    });
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parentCategory?._id || "");
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
    setImage(category.image || null);
  }

  async function uploadImages(ev) {
    let file = ev.target?.files[0];
    if (!file) {
      return;
    }
    setIsLoading(true);
    const data = new FormData();
    if (validFileTypes.includes(file.type)) {
      if (file.type === "image/heic") {
        // Convert HEIC to JPEG
        const jpgBlob = await heic2anyRef.current({
          blob: file,
          toType: "image/jpeg",
        });
        file = new File([jpgBlob], file.name, { type: "image/jpeg" });
      }
      data.append("file", file);
    } else {
      swal.fire("Invalid file type: " + file.type);
    }
    if (data.has("file")) {
      const res = await axios.post("/api/uploadImage", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const newImages = res.data.links;
      if (image) {
        await deleteImagesFromDatabase([image]);
      }
      setImage(newImages[0]);
    }
    setIsLoading(false);
  }

  function allProperties() {
    return (
      <div className="mb-2">
        <label className="block">Properties</label>
        <button
          onClick={addProperty}
          type="button"
          className="btn-primary text-md mb-2"
        >
          Add new property
        </button>
        {properties.length > 0 &&
          properties.map((property, index) => (
            <div key={index} className="flex gap-1 mb-2">
              <input
                value={property.name}
                className="mb-0"
                onChange={(ev) =>
                  handlePropertyNameChange(index, property, ev.target.value)
                }
                type="text"
                placeholder="property name (example: color)"
              />
              <input
                onChange={(ev) =>
                  handlePropertyValuesChange(index, property, ev.target.value)
                }
                className="mb-0"
                value={property.values}
                type="text"
                placeholder="values, comma separated"
              />
              <button
                type="button"
                onClick={() => removeProperty(index)}
                className="btn-red"
              >
                Remove
              </button>
            </div>
          ))}
      </div>
    );
  }

  function allCategories() {
    return (
      categories.length > 0 &&
      categories.map((category) => (
        <tr key={category._id}>
          <td>{category.name}</td>
          <td>{category?.parentCategory?.name}</td>
          <td className="flex gap-1">
            <button
              onClick={() => editCategory(category)}
              className="btn-primary mr-1 flex items-center gap-1"
            >
              Edit
              <PenIcon />
            </button>
            <button
              onClick={() => deleteCategory(category)}
              className="btn-primary flex items-center gap-1"
            >
              <span>Delete</span>
              <TrashIcon className="ml-1" />
            </button>
          </td>
        </tr>
      ))
    );
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
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : "Create new category"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={"Category name"}
            value={name}
            onChange={(ev) => setName(ev.target.value)}
          />
          <select
            value={parentCategory}
            onChange={(ev) => setParentCategory(ev.target.value)}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        {allProperties()}
        <div className="flex gap-1">
          <label className="w-24 h-18 text-center flex items-center justify-center flex-col rounded-md bg-white shadow-md border cursor-pointer">
            <UploadIcon />
            Image
            <input type="file" onChange={uploadImages} className="hidden" />
          </label>
          <button type="submit" className="btn-primary py-1">
            Save
          </button>
          <button
            type="button"
            onClick={async () => {
              if (image) {
                await deleteImagesFromDatabase([image]);
              }
              resetForm();
            }}
            className="btn-default"
          >
            Cancel
          </button>
        </div>
      </form>
      <div className="pt-5">
        {" "}
        {image && <Image src={image} width={100} height={100} alt="category" />}
      </div>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td>Parent Category</td>
              <td></td>
            </tr>
          </thead>
          <tbody>{allCategories()}</tbody>
        </table>
      )}
    </Layout>
  );
}
