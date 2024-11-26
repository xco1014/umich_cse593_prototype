import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button, TextField } from "@mui/material";
import GoogleAuth from "./GoogleAuth";

const NoteViewer = ({ docUrl, setDocUrl, insertText }) => {
  const [suggestionsRaw, setSuggestionsRaw] = useState(
    JSON.stringify(
      [
        { text: "Consider rephrasing this sentence for clarity." },
        { text: "Would you like to add an example here?" },
        { text: "Ensure consistency in terminology across the document." },
      ],
      null,
      2
    )
  );

  const [suggestions, setSuggestions] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [start, setStart] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(-1);

  // Start suggestions 20 seconds after start
  useEffect(() => {
    if (start) {
      const delay = setTimeout(() => {
        if (suggestions.length > 0) setCurrentSuggestionIndex(0); // Show the first suggestion
      }, 5000); // 5 seconds delay for Google Docs to load
      return () => clearTimeout(delay);
    }
  }, [start, suggestions]);

  const handleAccept = () => {
    const currentSuggestion = suggestions[currentSuggestionIndex];
    if (currentSuggestion) {
      insertText(currentSuggestion.text); // Simulate inserting the suggestion
    }
    moveToNextSuggestion();
  };

  const handleReject = () => {
    moveToNextSuggestion();
  };

  const moveToNextSuggestion = () => {
    if (currentSuggestionIndex < suggestions.length - 1) {
      const delay = Math.random() * 4000 + 1000; // Random delay between 1-5 seconds
      setTimeout(() => {
        setCurrentSuggestionIndex(currentSuggestionIndex + 1);
      }, delay);
      setCurrentSuggestionIndex(-1);
    } else {
      setCurrentSuggestionIndex(-1); // End of suggestions
    }
  };

  return start ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Google Docs Iframe */}
      <iframe
        src={docUrl}
        title="Google Doc"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allow="clipboard-read; clipboard-write"
      ></iframe>

      {/* Floating Suggestion Pane */}
      {currentSuggestionIndex >= 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: "5%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80%",
            backgroundColor: "rgba(85, 85, 85, 0.8)",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          <Typography variant="body1" sx={{
              paddingTop: "10px",
              paddingBottom: "10px",
            }}>
            {suggestions[currentSuggestionIndex].text}
          </Typography>
          <Box
            sx={{
              marginTop: "10px",
              display: "flex",
              gap: "30px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              sx={{ backgroundColor: "white", color: "black", width: "100%" }}
              onClick={handleReject}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "#4285f4", color: "white", width: "100%" }}
              onClick={handleAccept}
            >
              Accept
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  ) : (
    <Box
      sx={{
        margin: "5%",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        height: "90%",
      }}
    >
      <TextField
        fullWidth
        label="Link to Google Doc"
        value={docUrl}
        onChange={(e) => setDocUrl(e.target.value)}
      />
      <TextField
        multiline
        rows={10}
        fullWidth
        label="Text Suggestions (JSON)"
        value={suggestionsRaw}
        onChange={(e) => setSuggestionsRaw(e.target.value)}
      />
      <TextField
        fullWidth
        label="API_KEY"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      {apiKey && <GoogleAuth API_KEY={apiKey} />}
      <Button
        variant="contained"
        onClick={() => {
          try {
            const parsedSuggestions = JSON.parse(suggestionsRaw);
            setSuggestions(parsedSuggestions);
            setStart(true);
          } catch (error) {
            console.error("Invalid JSON input for suggestions:", error);
          }
        }}
      >
        Start
      </Button>
    </Box>
  );
};

NoteViewer.propTypes = {
  docUrl: PropTypes.string.isRequired,
  setDocUrl: PropTypes.func.isRequired,
  insertText: PropTypes.func.isRequired,
};

export default NoteViewer;
