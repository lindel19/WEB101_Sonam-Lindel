import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import axios from "axios";

export default function Home() {
  const {
    handleSubmit,
    setValue,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serverMessage, setServerMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  //  Validate file
  const validateFile = (file) => {
    if (!file) return "Please select a file.";

    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, PNG, and PDF files are allowed.";
    }

    if (file.size > maxSize) {
      return "File size must be less than 5MB.";
    }

    return true;
  };

  //  Handle file selection
  const handleFileSelection = (file) => {
    const result = validateFile(file);

    if (result !== true) {
      setSelectedFile(null);
      setPreview(null);
      setValue("file", null);
      setError("file", { type: "manual", message: result });
      return;
    }

    clearErrors("file");
    setSelectedFile(file);
    setValue("file", file);

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  //  FIXED drag & drop validation
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const rejectedFile = rejectedFiles[0];
        const errorCode = rejectedFile.errors?.[0]?.code;

        let message = "Invalid file.";

        if (errorCode === "file-too-large") {
          message = "File size must be less than 5MB.";
        } else if (errorCode === "file-invalid-type") {
          message = "Only JPG, PNG, and PDF files are allowed.";
        }

        setSelectedFile(null);
        setPreview(null);
        setValue("file", null);
        setError("file", { type: "manual", message });

        return;
      }

      if (acceptedFiles.length > 0) {
        handleFileSelection(acceptedFiles[0]);
      }
    },
    [setError, setValue]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize,
  });

  // FIXED progress bar visibility
  const onSubmit = async () => {
    if (!selectedFile) {
      setError("file", {
        type: "manual",
        message: "Please choose a file before uploading.",
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setServerMessage("");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post("http://localhost:8000/api/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
  onUploadProgress: (progressEvent) => {
    if (progressEvent.total) {
      const percent = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      setUploadProgress(percent);
    }
  },
});

      setUploadProgress(100);
      setServerMessage(response.data.message);

      // keep progress bar visible for 2 seconds
      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    } catch (error) {
      setServerMessage(
        error.response?.data?.message || "Upload failed. Please try again."
      );

      setTimeout(() => {
        setIsUploading(false);
      }, 2000);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>File Upload Implementation</h1>
        <p style={styles.subtext}>
          Upload JPG, PNG, or PDF files up to 5MB.
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Drag & Drop */}
          <div
            {...getRootProps()}
            style={{
              ...styles.dropzone,
              borderColor: isDragActive ? "#2563eb" : "#cbd5e1",
              backgroundColor: isDragActive ? "#eff6ff" : "#f8fafc",
            }}
          >
            <input {...getInputProps()} />
            <p>
              {isDragActive
                ? "Drop the file here..."
                : "Drag & drop a file here, or click to browse"}
            </p>
          </div>

          {/* Manual upload */}
          <div style={{ marginTop: "12px" }}>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                handleFileSelection(file);
              }}
            />
          </div>

          {/* Error */}
          {errors.file && <p style={styles.error}>{errors.file.message}</p>}

          {/* File info */}
          {selectedFile && (
            <div style={styles.fileBox}>
              <strong>Selected File:</strong> {selectedFile.name}
              <br />
              <strong>Size:</strong>{" "}
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div style={{ marginTop: "16px" }}>
              <p>Image Preview:</p>
              <img
                src={preview}
                alt="Preview"
                style={{ width: "220px", borderRadius: "8px" }}
              />
            </div>
          )}

          <button type="submit" style={styles.button} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload File"}
          </button>
        </form>

        {/* Progress bar stays visible */}
        {(isUploading || uploadProgress > 0) && (
          <div style={styles.progressWrapper}>
            <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        )}

        {/* Message */}
        {serverMessage && <p style={styles.message}>{serverMessage}</p>}
      </div>
    </div>
  );
}

//  Styles
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#e2e8f0",
    padding: "20px",
    fontFamily: "Arial",
  },
  card: {
    width: "100%",
    maxWidth: "550px",
    background: "#fff",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  heading: { fontSize: "28px" },
  subtext: { marginBottom: "20px", color: "#475569" },
  dropzone: {
    border: "2px dashed #cbd5e1",
    borderRadius: "10px",
    padding: "30px",
    textAlign: "center",
    cursor: "pointer",
  },
  error: { color: "red", marginTop: "10px", fontWeight: "bold" },
  fileBox: {
    marginTop: "15px",
    padding: "12px",
    background: "#f1f5f9",
    borderRadius: "8px",
  },
  button: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
  },
  progressWrapper: {
    marginTop: "20px",
    background: "#e5e7eb",
    borderRadius: "8px",
    height: "26px",
  },
  progressBar: {
    height: "100%",
    background: "#22c55e",
    color: "#fff",
    textAlign: "center",
    lineHeight: "26px",
    fontWeight: "bold",
  },
  message: { marginTop: "18px", fontWeight: "bold" },
};