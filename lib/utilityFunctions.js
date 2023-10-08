import axios from "axios";

export async function deleteImagesFromDatabase(links) {
  const uniqueLinks = [...new Set(links)];
  uniqueLinks.forEach(async (link) => {
    const filename = link.substring(link.lastIndexOf("/") + 1);
    await axios.delete(`/api/deleteImage?filename=${filename}`);
  });
}
