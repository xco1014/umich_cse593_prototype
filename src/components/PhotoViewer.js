import React, { useState } from "react";
import { Button } from "@mui/material";
import photo1 from "../sample/photo1.png"

const PhotoViewer = ({ onNavigateToFormula }) => {
  // Mock photo data
  const photos = [
    {
      id: 1,
      url: photo1,
      formulas: [
        { id: 1, x: 10, y: 30, width: 10, height: 40, content: "x^2 + y^2 = z^2" },
        { id: 2, x: 20, y: 10, width: 20, height: 50, content: "E = mc^2" },
      ],
    },
    {
      id: 2,
      url:photo1,
      formulas: [
        { id: 3, x: 10, y: 5, width: 10, height: 6, content: "F = ma" },
      ],
    },
    {
      id: 3,
      url: photo1,
      formulas: [],
    },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState(photos[0]);

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleEditFormula = (formulaContent) => {
    onNavigateToFormula(formulaContent); // Pass formula content to Formula tab
  };

  return (
    <div style={{ display: "flex", height: "100%", margin: "5px" }}>
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
              border: selectedPhoto.id === photo.id ? "2px solid #1976d2" : "2px solid transparent",
            }}
            onClick={() => handlePhotoClick(photo)}
          />
        ))}
      </div>

      {/* Photo Viewer with Formula Overlays */}
      <div style={{ width: "80%", position: "relative", backgroundColor: "#f4f4f4" }}>
        <img
          src={selectedPhoto.url}
          alt="Selected Photo"
          style={{ width: "100%", display: "block" }}
        />

        {selectedPhoto.formulas.map((formula) => (
          <div
            key={formula.id}
            style={{
              position: "absolute",
              top: `${formula.y}%`,
              left: `${formula.x}%`,
              width: `${formula.width}%`,
              height: `${formula.height}%`,
              backgroundColor: "rgba(255, 255, 0, 0.4)",
              border: "1px solid #cccc00",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: `100%`,
                left: 0,
                backgroundColor: "#fff",
                borderRadius: "4px",
                zIndex: 10,
                whiteSpace: "nowrap",
              }}
              className="popup-button"
            >
              <Button
                size="small"
                variant="contained"
                onClick={() => handleEditFormula(formula.content)}
              >
                Edit Formula
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoViewer;
