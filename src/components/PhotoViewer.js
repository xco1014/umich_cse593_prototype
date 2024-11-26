import React, { useState } from "react";
import Tesseract from "tesseract.js";
import { Button, CircularProgress } from "@mui/material";
import photo1 from "../sample/simple.png";
import photo2 from "../sample/simple2.png";
import photo3 from "../sample/simple_processed.png";

const PhotoViewer = ({ onNavigateToFormula }) => {
  const [photos, setPhotos] = useState([
    { id: 1, url: photo1 },
    { id: 2, url: photo2 },
    { id: 3, url: photo3 },
  ]);

  const [selectedPhoto, setSelectedPhoto] = useState(photos[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [formula, setFormula] = useState("");
  const [ocrError, setOcrError] = useState("");

  // Function to run OCR on the selected photo
  const runOCR = async (photo) => {
    setIsLoading(true);
    setFormula("");
    setOcrError("");

    try {
      const result = await Tesseract.recognize(photo.url, "eng", {
        logger: (info) => console.log("OCR Progress:", info),
      });

      if (!result || !result.data || !result.data.text) {
        throw new Error("OCR failed to detect any text.");
      }

      console.log("Full OCR Text:", result.data.text);

      // Use regex to extract all possible formulas
      const formulaRegex = /[0-9\s\+\-\*\/\%\^=\(\)]+/g; // Matches entire mathematical expressions, including %
      const detectedFormulas = result.data.text.match(formulaRegex);

      if (!detectedFormulas || detectedFormulas.length === 0) {
        throw new Error("No formula detected.");
      }

      // Select the longest formula as the most likely candidate
      let longestFormula = detectedFormulas.reduce((a, b) =>
        a.length > b.length ? a : b
      );

      // Post-process the OCR result to fix common errors
      longestFormula = correctOCRResult(longestFormula);

      setFormula(longestFormula.trim()); // Update the button with the corrected formula
    } catch (error) {
      console.error("OCR Error:", error.message || error);
      setOcrError(error.message || "Failed to process the image.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle file uploads
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const newPhotoUrl = URL.createObjectURL(file); // Create a temporary URL for the uploaded photo
      const newPhoto = { id: photos.length + 1, url: newPhotoUrl };
      setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
      setSelectedPhoto(newPhoto); // Automatically select the uploaded photo
      runOCR(newPhoto); // Automatically run OCR on the new photo
    }
  };

  // Handles photo selection
  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    runOCR(photo); // Rerun OCR whenever a new photo is selected
  };

  // Handles navigation to the formula page
  const handleEditFormula = () => {
    if (formula) {
      onNavigateToFormula(formula); // Pass the detected formula to the Formula page
    }
  };

  // Correct OCR Result
  const correctOCRResult = (text) => {
    return text
      .replace(/%/g, "*") // Replace % with *
      .replace(/[^\d\+\-\*\/\^=\(\)\s]/g, ""); // Remove invalid characters
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", margin: "5px" }}>
      {/* Photo Viewer */}
      <div style={{ display: "flex", height: "85%" }}>
        {/* Photo Gallery */}
        <div
          style={{
            width: "20%",
            borderRight: "1px solid #ddd",
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          {photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              style={{
                width: "95%",
                cursor: "pointer",
                marginBottom: "10px",
                border:
                  selectedPhoto.id === photo.id
                    ? "2px solid #1976d2"
                    : "2px solid transparent",
              }}
              onClick={() => handlePhotoClick(photo)}
              alt={`Photo ${photo.id}`}
            />
          ))}

          {/* File Upload Button */}
          <div style={{ marginTop: "10px", textAlign: "center" }}>
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              id="photo-upload"
              style={{ display: "none" }} // Hide the native file input
              onChange={handlePhotoUpload}
            />

            {/* Styled Label for File Input */}
            <label
              htmlFor="photo-upload"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "#fff",
                fontSize: "14px",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Add Photo
            </label>
          </div>
        </div>

        {/* Photo Viewer */}
        <div style={{ width: "80%", position: "relative", backgroundColor: "#f4f4f4" }}>
          <img
            src={selectedPhoto.url}
            alt="Selected Photo"
            style={{ width: "100%", display: "block" }}
          />
        </div>
      </div>

      {/* Edit Formula Button */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Button
            variant="contained"
            style={{
              backgroundColor: "green",
              color: "white",
            }}
            onClick={handleEditFormula}
            disabled={!formula || formula === "No formula detected"}
          >
            {formula ? `Edit Formula: ${formula}` : "No Formula Detected"}
          </Button>
        )}
        {ocrError && (
          <p style={{ color: "red", marginTop: "10px" }}>{ocrError}</p>
        )}
      </div>
    </div>
  );
};

export default PhotoViewer;
