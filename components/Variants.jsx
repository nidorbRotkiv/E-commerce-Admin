import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Images from "./Images";
import TrashIcon from "./icons/trashIcon";

const swal = withReactContent(Swal);

export default function Variants({
  onVariantsChange,
  setImagesToDelete,
  existingProduct,
  setNewImages,
}) {
  const [variantKey, setVariantKey] = useState(
    existingProduct?.variantKey || ""
  );
  const [variantValues, setVariantValues] = useState(
    existingProduct?.variantValues || [
      { value: "", images: [], price: 1, stock: 0 },
    ]
  );

  useEffect(() => {
    if (variantValues.length === 0) {
      setVariantKey("");
    }
    onVariantsChange(variantKey, variantValues);
  }, [variantValues, variantKey]);

  const addVariant = (ev) => {
    ev.preventDefault();
    const hasEmptyVariant = variantValues.some((v) => v.value === "");
    if (hasEmptyVariant) {
      swal.fire("Please fill the empty variant");
      return;
    }
    setVariantValues([
      ...variantValues,
      { value: "", images: [], price: 1, stock: 0 },
    ]);
  };

  const deleteVariant = (ev, index) => {
    ev.preventDefault();
    const newVariants = [...variantValues];
    const imagesToDeleteFromVariant = newVariants[index]?.images || [];
    setImagesToDelete((prev) => [...prev, ...imagesToDeleteFromVariant]);
    newVariants.splice(index, 1);
    setVariantValues(newVariants);
  };

  return (
    <>
      <label className="block">
        Variants of... (color, size, etc.) (Optional)
      </label>
      <input
        value={variantKey}
        onChange={(ev) => {
          setVariantKey(ev.target.value);
        }}
        type="text"
        placeholder="Variants of..."
      />
      {variantValues.map((variant, index) => (
        <div key={index} className="mb-2">
          <label className="block">
            {"Variant " + (index + 1) + " (Optional)"}
          </label>
          <div className="flex gap-1">
            <input
              value={variant.value}
              onChange={(ev) => {
                if (variantKey === "") {
                  swal.fire("Please fill the variants of field");
                  return;
                }
                const newVariants = [...variantValues];
                newVariants[index].value = ev.target.value;
                setVariantValues(newVariants);
              }}
              type="text"
              placeholder="Value (example: red, 42, etc.)"
            />
            {index > 0 && (
              <button
                onClick={(ev) => deleteVariant(ev, index)}
                className="btn-red h-12"
              >
                <TrashIcon />
              </button>
            )}
          </div>
          <Images
            selectedVariant={variant}
            setVariantValues={setVariantValues}
            variantValues={variantValues}
            setImagesToDelete={setImagesToDelete}
            setNewImages={setNewImages}
          />
          <label>Price (in PEN)</label>
          <input
            type="number"
            name="price"
            placeholder="price"
            value={variant.price}
            onChange={(ev) => {
              const newVariants = [...variantValues];
              const newPrice = parseInt(ev.target.value);
              if (isNaN(newPrice)) {
                newVariants[index].price = 1;
              } else {
                newVariants[index].price = Math.max(1, newPrice);
              }
              setVariantValues(newVariants);
            }}
          />
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            placeholder="stock"
            value={variant.stock}
            onChange={(ev) => {
              const newVariants = [...variantValues];
              const newStock = parseInt(ev.target.value);
              if (isNaN(newStock)) {
                newVariants[index].stock = 0;
              } else {
                newVariants[index].stock = Math.max(0, newStock);
              }
              setVariantValues(newVariants);
            }}
          />
        </div>
      ))}
      <button onClick={addVariant} className="btn-primary mb-3">
        Add new variant (Optional)
      </button>
    </>
  );
}
