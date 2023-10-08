import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ReactSortable } from "react-sortablejs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { validFileTypes } from "../lib/constants";
import Spinner from "./Spinner";
import UploadIcon from "./icons/uploadIcon";

const swal = withReactContent(Swal);

export default function ImageUploader({
  selectedVariant,
  setVariantValues,
  variantValues,
  setImagesToDelete,
  setNewImages,
}) {
  const [isUploading, setIsUploading] = useState(false);
  let images = selectedVariant.images || [];
  const heic2anyRef = useRef(null);

  useEffect(() => {
    // Done because heic2any is not SSR compatible
    import("heic2any").then((heic2any) => {
      heic2anyRef.current = heic2any.default;
    });
  }, []);

  function updateImagesOrder(images, selectedVariant) {
    setVariantValues(
      variantValues.map((v) => {
        if (v.value === selectedVariant.value) {
          return { ...v, images };
        }
        return v;
      })
    );
  }

  async function uploadImages(ev, selectedVariant) {
    const files = ev.target?.files;
    if (!files?.length > 0) {
      return;
    }
    setIsUploading(true);
    const data = new FormData();
    for (let file of files) {
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
    }
    if (data.has("file")) {
      const res = await axios.post("/api/uploadImage", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const newImages = res.data.links;
      setNewImages((prevNewImages) => [...prevNewImages, ...newImages]);
      setVariantValues(
        variantValues.map((v) => {
          if (v.value === selectedVariant.value) {
            return { ...v, images: [...v.images, ...newImages] };
          }
          return v;
        })
      );
    }
    setIsUploading(false);
  }

  async function deleteImage(link, selectedVariant) {
    try {
      const result = await new Promise((resolve, reject) => {
        swal
          .fire({
            title: "Are you sure?",
            text: "This image will be deleted",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, keep it",
          })
          .then((result) => {
            resolve(result);
          });
      });
      if (result.isConfirmed) {
        setImagesToDelete((prevImageFilesToDelete) => [
          ...prevImageFilesToDelete,
          link,
        ]);
        setVariantValues(
          variantValues.map((v) => {
            if (v.value === selectedVariant.value) {
              return {
                ...v,
                images: v.images.filter((image) => image !== link),
              };
            }
            return v;
          })
        );
      }
    } catch (error) {
      swal.fire({
        title: `Error deleting image: ${error}`,
        icon: "warning",
      });
    }
  }
  return (
    <>
      <label>Images</label>
      <div className="mb-2 flex flex-wrap">
        <ReactSortable
          className="flex flex-wrap gap-1"
          list={images}
          setList={(newImages) => updateImagesOrder(newImages, selectedVariant)}
        >
          {images.length > 0 &&
            images.map((link) => (
              <button
                onClick={(ev) => {
                  ev.preventDefault();
                  deleteImage(link, selectedVariant);
                }}
                className="h-24 bg-white p-2 rounded-md border border-gray-200 shadow-md relative"
                key={link}
              >
                <img
                  className="rounded-lg w-full h-full object-cover transition-opacity duration-300"
                  src={link}
                  alt="image"
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-30 rounded-lg"></div>
              </button>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 text-center flex items-center justify-center flex-col rounded-md bg-white shadow-md border cursor-pointer">
          <UploadIcon />
          Upload
          <input
            type="file"
            onChange={(ev) => uploadImages(ev, selectedVariant)}
            className="hidden"
          />
        </label>
      </div>
    </>
  );
}
