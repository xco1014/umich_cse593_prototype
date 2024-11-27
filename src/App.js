// App.js
import React, { useState, useRef } from "react";
import { Box, Tabs, Tab, Button, TextField, IconButton } from "@mui/material";
import { SplitPane } from "react-multi-split-pane";
import { gapi } from "gapi-script";
import "./App.css";
import PdfViewer from "./components/PdfViewer";
import PhotoViewer from "./components/PhotoViewer";
import NoteViewer from "./components/NoteViewer";
import photo1 from "./sample/newSample1.png";
import photo2 from "./sample/newSample2.png";
import photo3 from "./sample/newSample3.png";

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [formula, setFormula] = useState("");
  const [docUrl, setDocUrl] = useState(
    "https://docs.google.com/document/d/1FrDJsFI-T9OZsxB5XIlLA9tJpLEWxhXMXg9HpuHdOgY/edit?usp=sharing"
  );
  const [photos, setPhotos] = useState([
    { id: 0, url: photo1, ocrResults: null },
    { id: 1, url: photo2, ocrResults: null },
    { id: 2, url: photo3, ocrResults: null },
  ]);

  const ref = useRef(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleInsertCharacter = (character) => {
    let cursorPosition = ref.current.selectionStart;
    let textBeforeCursorPosition = formula.substring(0, cursorPosition);
    let textAfterCursorPosition = formula.substring(
      cursorPosition,
      formula.length
    );
    setFormula(
      (prev) => textBeforeCursorPosition + character + textAfterCursorPosition
    );
    setTimeout(() => {
      ref.current.focus();
      ref.current.selectionStart = cursorPosition + 1;
    }, 0);
  };

  const handleJumpToFormula = (formulaContent) => {
    setFormula(formulaContent); // Populate the formula editor
    setSelectedTab(2); // Index of "Formula" tab
  };

  const insertText = (text) => {
    gapi.client.docs.documents
      .batchUpdate({
        documentId: docUrl.split("/")[5],
        requests: [
          {
            insertText: {
              endOfSegmentLocation: {},
              text: `\n${text}`,
            },
          },
        ],
      })
      .then((response) => {
        console.log("Text inserted:", response);
      })
      .catch((err) => {
        console.error("Error inserting text:", err);
      });
  };

  return (
    <SplitPane
      split="vertical"
      defaultSizes={[40, 60]}
      style={{ height: "100vh" }}
    >
      {/* Left Pane */}
      <SplitPane split="horizontal" defaultSizes={[60, 40]}>
        {/* Top Left: PDF Slides */}
        <Box
          sx={{
            height: "100%",
            width: "100%",
            padding: 0,
            backgroundColor: "#f5f5f5",
          }}
        >
          <PdfViewer />
        </Box>
        {/* Bottom Left: Tools */}
        <Box
          sx={{
            height: "100%",
            width: "100%",
            padding: "0",
            backgroundColor: "#eeeeee",
          }}
        >
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="fullWidth"
          >
            <Tab label="Browser" />
            <Tab label="Photo" />
            <Tab label="Formula" />
            <Tab label="Zoom" />
          </Tabs>
          {selectedTab === 0 && (
            <Box
              sx={{
                height: "calc(100% - 48px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <iframe
                src="https://en.wikipedia.org/wiki/Main_Page"
                title="Embedded Browser"
                style={{ width: "100%", height: "100%", border: "none" }}
              ></iframe>
            </Box>
          )}
          {selectedTab === 1 && (
            <Box sx={{ height: "calc(100% - 48px)" }}>
              <PhotoViewer
                onNavigateToFormula={handleJumpToFormula}
                photos={photos}
                setPhotos={setPhotos}
              />
            </Box>
          )}
          {selectedTab === 2 && (
            <Box sx={{ height: "calc(100% - 48px)", padding: "5px" }}>
              {/* Formula Tools */}
              <Box
                sx={{
                  margin: 2,
                  justifyContent: "space-between",
                  display: "flex",
                }}
              >
                <Box>
                  {["α", "β", "γ", "∫", "∑", "^"].map((char) => (
                    <IconButton
                      key={char}
                      onClick={() => handleInsertCharacter(char)}
                      variant="outlined"
                    >
                      {char}
                    </IconButton>
                  ))}
                </Box>
                <Button onClick={() => insertText(formula)} variant="contained">
                  Insert Formula
                </Button>
              </Box>
              {/* Formula Editor */}
              <TextField
                multiline
                rows={2}
                fullWidth
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Edit your formula here..."
                inputRef={ref}
                InputProps={{ style: { fontSize: 30 } }}
                inputProps={{ style: { textAlign: "center" } }}
              />
            </Box>
          )}
          {selectedTab === 3 && (
            <Box>
              <p>Zoom tools placeholder</p>
            </Box>
          )}
        </Box>
      </SplitPane>

      {/* Right Pane: Google Doc */}
      <Box sx={{ height: "100%", width: "100%", backgroundColor: "#ffffff" }}>
        <NoteViewer
          insertText={insertText}
          docUrl={docUrl}
          setDocUrl={setDocUrl}
        />
      </Box>
    </SplitPane>
  );
}

export default App;
