import { useState, useRef, useContext, useEffect } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import toast from "react-hot-toast";
import "../css/profilepic.css";
import { AuthContext } from "../context/AuthContext";

export const ProfilePicUploader = ({ isOpen, onClose, userId }) => {
  const { uploadProfilePic, refetchUser } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  // Change to pixel-based crop instead of percentage
  const [crop, setCrop] = useState({
    unit: "px",
    width: 200,
    height: 200,
    x: 75,
    y: 75,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef(null);
  const [step, setStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [finalPreviewUrl, setFinalPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };

  const onImageLoaded = (img) => {
    imgRef.current = img;

    // Center the crop in the image - use pixel values
    const size = Math.min(img.width, img.height) * 0.8;
    const x = (img.width - size) / 2;
    const y = (img.height - size) / 2;

    const defaultCrop = {
      unit: "px",
      width: size,
      height: size,
      x: x,
      y: y,
      aspect: 1,
    };

    setCrop(defaultCrop);
    setCompletedCrop(defaultCrop);

    // Generate initial preview
    setTimeout(() => generatePreview(defaultCrop), 100);

    return false;
  };

  const onCropComplete = (crop, percentCrop) => {
    setCompletedCrop(crop);
    if (imgRef.current && crop.width && crop.height) {
      generatePreview(crop);
    }
  };

  const generatePreview = (cropData) => {
    const img = imgRef.current;
    if (!img || !cropData.width || !cropData.height) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const previewSize = 150;
    canvas.width = canvas.height = previewSize;

    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(previewSize / 2, previewSize / 2, previewSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Calculate scale ratio between displayed and natural image
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    // Convert displayed crop to natural image coordinates
    const sourceX = cropData.x * scaleX;
    const sourceY = cropData.y * scaleY;
    const sourceWidth = cropData.width * scaleX;
    const sourceHeight = cropData.height * scaleY;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      previewSize,
      previewSize
    );

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setPreviewUrl(dataUrl);
  };

  const goToPreview = () => {
    if (!completedCrop || !previewUrl) {
      toast.error("Please adjust the crop area first");
      return;
    }
    setFinalPreviewUrl(previewUrl);
    setStep(3);
  };

  const handleImageUpload = async () => {
    if (!completedCrop || !previewUrl) {
      toast.error("Please complete the cropping process first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], "profile-pic.jpg", {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      const result = await uploadProfilePic(userId, file);
      if (result) {
        await refetchUser(userId);
        toast.success("Profile picture updated successfully");
        onClose();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to update profile picture");
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setImage(null);
    setPreviewUrl(null);
    setFinalPreviewUrl(null);
    setCrop({
      unit: "px",
      width: 200,
      height: 200,
      x: 75,
      y: 75,
      aspect: 1,
    });
    setStep(1);
  };

  const backToCrop = () => {
    setStep(2);
  };

  useEffect(() => {
    if (!isOpen) {
      setImage(null);
      setPreviewUrl(null);
      setFinalPreviewUrl(null);
      setStep(1);
      setCrop({
        unit: "px",
        width: 200,
        height: 200,
        x: 75,
        y: 75,
        aspect: 1,
      });
      setCompletedCrop(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="profile-pic-modal-overlay">
      <div className="profile-pic-modal">
        <div className="profile-pic-modal-header">
          <h3>
            {step === 1
              ? "Select Profile Picture"
              : step === 2
              ? "Adjust & Crop Image"
              : "Confirm New Profile Picture"}
          </h3>
          <button onClick={onClose} className="close-button">
            ×
          </button>
        </div>

        <div className="profile-pic-modal-content">
          {step === 1 ? (
            <div className="file-upload-container">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
                <span>Choose an image</span>
              </label>
            </div>
          ) : step === 2 ? (
            <div className="crop-container">
              <div className="crop-instructions">
                <p>Drag to position and resize the image within the circle.</p>
              </div>
              <div className="crop-area">
                {image && (
                  <ReactCrop
                    crop={crop}
                    onChange={(newCrop) => setCrop(newCrop)}
                    onComplete={onCropComplete}
                    aspect={1}
                    circularCrop
                    keepSelection
                    style={{ maxHeight: "350px", margin: "0 auto" }}
                  >
                    <img
                      ref={imgRef}
                      src={image}
                      onLoad={(e) => onImageLoaded(e.currentTarget)}
                      alt="Crop preview"
                      style={{ maxHeight: "350px", width: "auto" }}
                    />
                  </ReactCrop>
                )}
              </div>
              <div className="preview-container">
                <h4>Preview</h4>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="preview-image"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="preview-placeholder"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      backgroundColor: "#f0f0f0",
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="confirm-container">
              <div className="preview-container">
                <h4>Your New Profile Picture</h4>
                {finalPreviewUrl ? (
                  <img
                    src={finalPreviewUrl}
                    alt="Final Preview"
                    className="final-preview-image"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="preview-placeholder"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "50%",
                      backgroundColor: "#f0f0f0",
                    }}
                  />
                )}
                <p>This is how your profile picture will appear.</p>
              </div>
            </div>
          )}
        </div>

        <div className="profile-pic-modal-footer">
          {step === 1 ? (
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          ) : step === 2 ? (
            <>
              <button onClick={resetSelection} className="btn btn-secondary">
                Choose Different Image
              </button>
              <button
                onClick={goToPreview}
                className="btn btn-primary"
                disabled={!previewUrl}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                onClick={backToCrop}
                className="btn btn-secondary"
                disabled={loading}
              >
                Back to Edit
              </button>
              <button
                onClick={handleImageUpload}
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Uploading..." : "Confirm & Upload"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
