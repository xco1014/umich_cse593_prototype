import React, { useState } from "react";

const PdfViewer = () => {
  const [pdfUrl, setPdfUrl] = useState("");

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file); // Create a URL for the uploaded file
      setPdfUrl(fileUrl);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* PDF Upload */}
      {!pdfUrl && (
      <div style={{ padding: "10px", backgroundColor: "#f4f4f4" }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePdfUpload}
        />
      </div>)}

      {/* PDF Viewer */}
      <div style={{ flex: 1, border: "1px solid #ddd", marginTop: "10px" }}>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <p style={{ textAlign: "center", marginTop: "20px" }}>
            Upload a PDF to view it here.
          </p>
        )}
      </div>
    </div>
  );
};

export default PdfViewer;
