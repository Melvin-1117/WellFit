import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./Admin.css";

function AdminProductForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "men",
    image: "",
    description: "",
    stock: "50",
    sizes: ["S", "M", "L", "XL"],
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchProductDetails = async () => {
        try {
          const res = await fetch(`${API_URL}/api/products/${id}`);
          const data = await res.json();

          if (data.success && data.product) {
            const p = data.product;
            setFormData({
              name: p.name || "",
              price: p.price ? String(p.price) : "",
              category: p.category || "men",
              image: p.image || p.image_url || "",
              description: p.description || "",
              stock: p.stock !== undefined ? String(p.stock) : "50",
              sizes: p.sizes && Array.isArray(p.sizes) ? p.sizes : ["S", "M", "L", "XL"],
            });
          } else {
            setErrorMsg("Product not found");
          }
        } catch (err) {
          console.error("Fetch product error:", err);
          setErrorMsg("Failed to load product details");
        } finally {
          setFetching(false);
        }
      };

      fetchProductDetails();
    }
  }, [id, isEditMode, API_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      if (exists) {
        return { ...prev, sizes: prev.sizes.filter((s) => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };

  // Image upload handler (converts file to base64 and sends to backend)
  const handleImageUpload = async (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMsg("Please upload a JPG, PNG, or WebP image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Image file must be smaller than 5MB.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMsg("Session expired. Please log in again.");
        return;
      }

      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;

        const res = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            imageData: base64Data,
            fileName: file.name,
          }),
        });

        const data = await res.json();

        if (data.success && data.imageUrl) {
          setFormData((prev) => ({ ...prev, image: data.imageUrl }));
        } else {
          setErrorMsg(data.message || "Image upload failed.");
        }

        setUploading(false);
      };

      reader.onerror = () => {
        setErrorMsg("Failed to read file.");
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg("Server error uploading image.");
      setUploading(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name || !formData.price || !formData.category) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrorMsg("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category.toLowerCase(),
        image: formData.image || "/products/men/item1.jpg",
        image_url: formData.image || "/products/men/item1.jpg",
        description: formData.description,
        sizes: formData.sizes,
        stock: Number(formData.stock) || 50,
      };

      const url = isEditMode
        ? `${API_URL}/api/products/${id}`
        : `${API_URL}/api/products`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        navigate("/admin");
      } else {
        setErrorMsg(data.message || "Failed to save product.");
      }
    } catch (err) {
      console.error("Save product error:", err);
      setErrorMsg("Server error saving product.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="admin-page" style={{ textAlign: "center", padding: "80px", color: "#5483B3" }}>
        Loading product details...
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ maxWidth: "700px" }}>
        <div className="admin-title-area">
          <p className="admin-label">ADMINISTRATION</p>
          <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
        </div>

        <Link to="/admin" className="btn-admin-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="admin-form-container">
        {errorMsg && (
          <div className="admin-toast error" style={{ marginBottom: "20px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Vintage Leather Jacket"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (₹) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="2999"
                min="0"
                step="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#fafafa",
                }}
              >
                <option value="men">Men's Apparel</option>
                <option value="women">Women's Apparel</option>
                <option value="kids">Kids Collection</option>
              </select>
            </div>
          </div>

          {/* Image Upload Dropzone + URL Input */}
          <div className="form-group">
            <label>Product Image</label>

            <div
              className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />

              {uploading ? (
                <div className="upload-status">
                  <span className="upload-spinner">⏳</span>
                  <p>Uploading image...</p>
                </div>
              ) : (
                <div className="upload-content">
                  <span className="upload-icon">📁</span>
                  <p><strong>Drop an image here</strong> or click to browse</p>
                  <span className="upload-hint">JPG, PNG, WebP · Max 5MB</span>
                </div>
              )}
            </div>

            <div className="upload-divider">
              <span>OR</span>
            </div>

            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="Paste image URL: /products/men/item1.jpg or https://..."
            />

            {formData.image && (
              <div className="image-preview-box">
                <img
                  src={
                    formData.image.startsWith("/uploads")
                      ? `${API_URL}${formData.image}`
                      : formData.image
                  }
                  alt="Preview"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/120x140?text=Invalid+URL";
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the fabric, fit, and style details..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Available Sizes</label>
            <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
              {["S", "M", "L", "XL"].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => handleSizeToggle(sz)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: formData.sizes.includes(sz) ? "2px solid #052659" : "1px solid #d1d5db",
                    background: formData.sizes.includes(sz) ? "#052659" : "#ffffff",
                    color: formData.sizes.includes(sz) ? "#ffffff" : "#374151",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
            />
          </div>

          <button
            type="submit"
            className="btn-submit"
            style={{ marginTop: "12px" }}
            disabled={loading || uploading}
          >
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Product"
              : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminProductForm;
