import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "/public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    multiples: false,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    filter: ({ mimetype }) => {
      return (
        mimetype &&
        ["image/jpeg", "image/png", "application/pdf"].includes(mimetype)
      );
    },
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        message: "File upload failed. Check file type or size.",
      });
    }

    const uploadedFile = files.file;

    if (!uploadedFile) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const fileData = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

    return res.status(200).json({
      message: "File uploaded successfully.",
      fileName: fileData.newFilename,
      originalName: fileData.originalFilename,
      filePath: `/uploads/${fileData.newFilename}`,
    });
  });
}