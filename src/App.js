// App.js
import React, { useState, useRef } from "react";
import { Box, Tabs, Tab, Button, TextField, IconButton } from "@mui/material";
import { SplitPane } from "react-multi-split-pane";
import { gapi } from "gapi-script";
import "./App.css";
import PdfViewer from "./components/PdfViewer";
import PhotoViewer from "./components/PhotoViewer";
import NoteViewer from "./components/NoteViewer";

function App() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [formula, setFormula] = useState("");
  const [docUrl, setDocUrl] = useState(
    "https://docs.google.com/document/d/1FrDJsFI-T9OZsxB5XIlLA9tJpLEWxhXMXg9HpuHdOgY/edit?usp=sharing"
  );
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

  const handleCopyToClipboard = () => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(formula, "text/plain");

    const pasteEvent = new ClipboardEvent("paste", {
      bubbles: true,
      cancelable: true,
      clipboardData: dataTransfer,
    });
    ref.current.focus();
    ref.current.dispatchEvent(pasteEvent);

    navigator.clipboard.writeText(formula);
  };

  const insertText = (text) => {
    gapi.client.docs.documents
      .batchUpdate({
        documentId: docUrl.split("/")[5],
        requests: [
          {
            insertText: {
              endOfSegmentLocation: {},
              text: `${text}\n`,
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
            padding: 2,
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
            padding: 2,
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
            <Box>
              <p>Browser tools placeholder</p>
            </Box>
          )}
          {selectedTab === 1 && (
            <Box>
              <PhotoViewer onNavigateToFormula={handleJumpToFormula} />
            </Box>
          )}
          {selectedTab === 2 && (
            <Box>
              {/* Formula Tools */}
              <Box
                sx={{
                  margin: 2,
                  justifyContent: "space-between",
                  display: "flex",
                }}
              >
                <Box>
                  {["α", "β", "γ", "∫", "∑"].map((char) => (
                    <IconButton
                      key={char}
                      onClick={() => handleInsertCharacter(char)}
                      variant="outlined"
                    >
                      {char}
                    </IconButton>
                  ))}
                </Box>
                <Button
                  onClick={() => insertText(formula)}
                  variant="contained"
                >
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
