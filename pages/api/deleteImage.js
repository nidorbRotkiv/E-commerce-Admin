import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const bucketName = "ecommerce-next-js";

export default async function handle(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();
  try {
    const { filename } = req.query;

    const client = new S3Client({
      region: "eu-north-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: filename,
      })
    );

    return res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ error: "An unexpected error occurred." });
  }
}
