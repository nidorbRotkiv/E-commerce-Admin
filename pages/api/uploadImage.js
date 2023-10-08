import multiparty from "multiparty";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import mime from "mime-types";
import { v4 as uuidv4 } from "uuid";
import { isAdminRequest } from "./auth/[...nextauth]";

const bucketName = "ecommerce-next-js";

export default async function handle(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    await isAdminRequest(req, res);
    const form = new multiparty.Form();
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const client = new S3Client({
      region: "eu-north-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
    const links = [];
    for (const file of files.file) {
      const extension = file.originalFilename.split(".").pop();
      const newFileName = `${uuidv4()}.${extension}`;
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: newFileName,
          Body: fs.readFileSync(file.path),
          ACL: "public-read",
          ContentType: mime.lookup(file.path),
        })
      );
      const link = `https://${bucketName}.s3.amazonaws.com/${newFileName}`;
      links.push(link);
    }
    return res.status(200).json({ links });
  } catch (error) {
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
