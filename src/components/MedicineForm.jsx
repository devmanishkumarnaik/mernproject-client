import React, { useEffect, useState } from "react";
import { createMedicine, updateMedicine, uploadImage } from "../api.js";

export default function MedicineForm({ onCreated, onUpdated, initial }) {
  const [name, setName] = useState("");
  const [benefits, setBenefits] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setBenefits(initial.benefits || "");
      setPrice(String(initial.price ?? ""));
      setAvailable(!!initial.available);
      setImageUrl(initial.imageUrl || "");
      setPreview(initial.imageUrl || "");
      setFile(null);
      setSuccess("");
    } else {
      setName("");
      setBenefits("");
      setPrice("");
      setAvailable(true);
      setImageUrl("");
      setPreview("");
      setFile(null);
      setSuccess("");
    }
  }, [initial]);

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      validateAndSetFile(droppedFile);
    }
  }

  function validateAndSetFile(selectedFile) {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("Image must be 2MB or smaller");
      return;
    }
    setError("");
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!benefits.trim()) {
      setError("Description is required");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Valid price is required");
      return;
    }
    if (!file && !imageUrl) {
      setError("Image is required");
      return;
    }
    if (file && file.size > 2 * 1024 * 1024) {
      setError("Image must be 2MB or smaller");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedImageUrl = imageUrl; // Start with existing image URL
      
      if (file) {
        setUploadProgress(30);
        const up = await uploadImage(file);
        uploadedImageUrl = up.url;
        setUploadProgress(80);
      }

      if (initial && initial._id) {
        const body = { name: name.trim(), benefits: benefits.trim(), price: Number(price), available };
        if (uploadedImageUrl) {
          body.imageUrl = uploadedImageUrl;
        }
        await updateMedicine(initial._id, body);
        setSuccess("Product updated successfully!");
        if (onUpdated) onUpdated();
      } else {
        if (!uploadedImageUrl) {
          setError("Image upload failed");
          return;
        }
        await createMedicine({ name: name.trim(), benefits: benefits.trim(), price: Number(price), imageUrl: uploadedImageUrl, available });
        setSuccess("Product added successfully!");
        setName("");
        setBenefits("");
        setPrice("");
        setFile(null);
        setPreview("");
        setAvailable(true);
        setUploadProgress(0);
        if (onCreated) onCreated();
      }
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <form onSubmit={onSubmit} className="medicine-form">
      {/* Image Upload Section */}
      <div className="form-group">
        <label className="form-label">Product Image *</label>
        <div
          className={`image-upload-zone ${dragOver ? "drag-over" : ""} ${preview ? "has-preview" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !preview && document.getElementById("file-input").click()}
        >
          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button type="button" className="change-image-btn" onClick={(e) => {
                e.stopPropagation();
                document.getElementById("file-input").click();
              }}>
                Change Image
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <div className="upload-icon">📸</div>
            <div className="upload-text">
              <div className="upload-title">Drop image here or click to upload</div>
              <div className="upload-subtitle">PNG, JPG, WEBP up to 2MB</div>
            </div>
          </div>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          required
        />
        </div>
      </div>

      {/* Form Fields */}
      <div className="form-group">
        <label className="form-label">Product Name *</label>
        <input
          className="input form-input"
          placeholder="e.g., Laptop, Book, Furniture"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          className="textarea form-textarea"
          placeholder="Describe the product details and features..."
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
          rows={4}
          required
        />
        <div className="char-count">{benefits.length}/500</div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Price (₹) *</label>
          <input
            className="input form-input"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
              className="checkbox"
            />
            <span className="checkbox-text">Available</span>
          </label>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        className="btn form-submit-btn"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Saving..." : initial ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}