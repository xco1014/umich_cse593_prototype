import React, { useEffect, useState } from "react";
import Tesseract from "tesseract.js";
import { Button, CircularProgress, Typography } from "@mui/material";

const PhotoViewer = ({ onNavigateToFormula, photos, setPhotos }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(
    photos.length - 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");

  // Run OCR on the selected photo and store results
  const runOCR = async (photo) => {
    if (photo.ocrResults) return; // Skip if OCR has already been run

    setIsLoading(true);
    setOcrError("");

    try {
      const result = await Tesseract.recognize(photo.url, "eng");

      if (!result || !result.data || !result.data.words) {
        throw new Error("OCR failed to detect any text.");
      }
      const img = new Image();
      img.src = photo.url;
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (img.naturalWidth) {
            resolve();
            clearInterval(interval);
          }
        }, 10);
      });

      console.log("Full OCR Text:", result.data.text);
      console.log(result.data);

      const ocrResults = result.data.blocks
        .filter((block) => {
          // Use regex to filter formulas from the OCR results
          const formulaRegex = /[0-9\s\+\-\*\/\%\^=\(\)]+/g; // Matches entire mathematical expressions, including %
          return block.text.match(formulaRegex);
        })
        .map((block) => ({
          text: correctOCRResult(block.text),
          bbox: {
            x0: (block.bbox.x0 / img.width) * 100,
            y0: (block.bbox.y0 / img.height) * 100,
            x1: (block.bbox.x1 / img.width) * 100,
            y1: (block.bbox.y1 / img.height) * 100,
          }, // Convert to percentage
        }));

      if (ocrResults.length === 0) {
        throw new Error("No formulas detected.");
      }

      // Update the selected photo with OCR results
      setPhotos((prevPhotos) =>
        prevPhotos.map((p) => (p.id === photo.id ? { ...p, ocrResults } : p))
      );
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
      const photosLenght = photos.length;
      const newPhotoUrl = URL.createObjectURL(file);
      const newPhoto = { id: photosLenght, url: newPhotoUrl, ocrResults: null };
      setPhotos((prevPhotos) => [...prevPhotos, newPhoto]);
      setSelectedPhotoIndex(photosLenght);
    }
  };

  // Handles photo selection
  const handlePhotoClick = (index) => {
    setSelectedPhotoIndex(index);
    if (!photos[index].ocrResults) runOCR(photos[index]);
  };

  // Handles navigation to the formula page
  const handleEditFormula = (formula) => {
    if (formula) {
      onNavigateToFormula(formula); // Pass the detected formula to the Formula page
    }
  };

  // Correct OCR Result
  const correctOCRResult = (text) => {
    return text.replace(/%/g, "*").replace("S", "5").replace("?", "2"); // Replace % with *
    // .replace(/[^\d\+\-\*\/\^=\(\)\s]/g, ""); // Remove invalid characters
  };

  useEffect(() => {
    if (!photos[selectedPhotoIndex].ocrResults) {
      runOCR(photos[selectedPhotoIndex]);
    }
  }, [selectedPhotoIndex, photos]);

  const selectedPhoto = photos[selectedPhotoIndex];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        margin: "5px",
      }}
    >
      {/* Photo Viewer */}
      <div style={{ display: "flex", height: "100%" }}>
        {/* Photo Gallery */}
        <div
          style={{
            width: "20%",
            height: "100%",
            borderRight: "1px solid #ddd",
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          {/* File Upload Button */}
          <div
            style={{ margin: "10px 0px", textAlign: "center", width: "100%" }}
          >
            <input
              type="file"
              accept="image/*"
              id="photo-upload"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />
            <label
              htmlFor="photo-upload"
              style={{
                width: "100%",
                display: "block",
                padding: "5px 0px",
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
          {[...photos].reverse().map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              style={{
                width: "100%",
                cursor: "pointer",
                marginBottom: "10px",
                border:
                  selectedPhoto.id === photo.id
                    ? "2px solid #1976d2"
                    : "2px solid transparent",
              }}
              onClick={() => handlePhotoClick(photo.id)}
              alt={`Img ${photo.id}`}
            />
          ))}
        </div>

        {/* Photo Viewer */}
        <div
          style={{
            width: "80%",
            backgroundColor: "#f4f4f4",
          }}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "#f4f4f4",
            }}
          >
            <img
              src={selectedPhoto.url}
              alt="Selected"
              style={{
                width: "100%",
                display: "block",
              }}
            />

            {/* Overlay for OCR results */}
            {selectedPhoto.ocrResults &&
              selectedPhoto.ocrResults.map((result, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    top: `${result.bbox.y0}%`,
                    left: `${result.bbox.x0}%`,
                    width: `${result.bbox.x1 - result.bbox.x0}%`,
                    height: `${result.bbox.y1 - result.bbox.y0}%`,
                    border: "2px solid yellow",
                    backgroundColor: "rgba(255, 255, 0, 0.2)",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "100%",
                      backgroundColor: "#fff",
                      borderRadius: "4px",
                      zIndex: 10,
                      whiteSpace: "nowrap",
                      transform: "translate(-100%)",
                    }}
                    className="popup-button"
                  >
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleEditFormula(result.text)}
                    >
                      Edit Formula
                    </Button>
                  </div>
                </div>
              ))}

            {/* Loading/Error Indicator */}
            <div
              style={{
                top: "50%",
                width: "100%",
                textAlign: "center",
                position: "absolute",
              }}
            >
              {isLoading ? <CircularProgress /> : null}
              {ocrError && (
                <Typography color="error" variant="h3">
                  {ocrError}
                </Typography>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoViewer;
