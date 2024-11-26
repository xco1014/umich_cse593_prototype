import React, { useEffect, useState } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";

const NoteViewer = () => {
  const [docUrl, setDocUrl] = useState(
    "https://docs.google.com/document/d/1FrDJsFI-T9OZsxB5XIlLA9tJpLEWxhXMXg9HpuHdOgY/edit?usp=sharing"
  );
  const [suggestionsRaw, setSuggestionsRaw] = useState(
    `[
    { time: 5, text: "Consider rephrasing this sentence for clarity." },
    { time: 10, text: "Would you like to add an example here?" },
    {
      time: 15,
      text: "Ensure consistency in terminology across the document.",
    },
]`
  );
  const [suggestions, setSuggestions] = useState([
    { time: 5, text: "Consider rephrasing this sentence for clarity." },
    { time: 10, text: "Would you like to add an example here?" },
    {
      time: 15,
      text: "Ensure consistency in terminology across the document.",
    },
  ]);
  const [start, setStart] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Track the elapsed time
  const [activeSuggestion, setActiveSuggestion] = useState(null); // Current suggestion
  const [timer, setTimer] = useState(null); // Timer for the suggestion system

  // Update active suggestion based on the current time
  useEffect(() => {
    const suggestion = suggestions.find(
      (suggestion) => suggestion.time === currentTime
    );
    if (suggestion) {
      setActiveSuggestion(suggestion.text);
    }
  }, [currentTime, suggestions]);

  const stopTimer = () => {
    clearInterval(timer);
    setTimer(null);
  };

  const resumeTimer = () => {
    if (!timer) {
      const interval = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 1);
      }, 1000);
      setTimer(interval);
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
      }}
    >
      {/* Google Docs Iframe */}
      <iframe
        src={docUrl}
        title="Google Doc"
        style={{
          width: "100%",
          height: "85%",
          border: "none",
        }}
        allow="clipboard-read; clipboard-write"
      ></iframe>

      {/* AI Text Suggestion Area */}
      <Box
        sx={{
          padding: "10px",
          backgroundColor: "#f4f4f4",
          borderTop: "1px solid #ddd",
          height: "15%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: "5px",
            backgroundColor: "#fff",
            borderRadius: "4px",
            border: "1px solid #ddd",
          }}
        >
          {activeSuggestion ? (
            <Typography>{activeSuggestion}</Typography>
          ) : (
            <Typography color="textSecondary">No suggestions yet...</Typography>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "10px",
          }}
        >
          <Button variant="contained" onClick={stopTimer}>
            Pause Suggestions
          </Button>
          <Button variant="contained" onClick={resumeTimer}>
            Resume Suggestions
          </Button>
        </Box>
      </Box>
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
        label="link to google doc"
        value={docUrl}
        onChange={(e) => setDocUrl(e.target.value)}
      />
      <TextField
        multiline
        rows={10}
        fullWidth
        label="Text Suggestion"
        value={suggestionsRaw}
        onChange={(e) => setSuggestionsRaw(e.target.value)}
      />
      <Button
        variant="contained"
        onClick={() => {
          try {
            setSuggestions(eval(suggestionsRaw));
            setStart(true);
            resumeTimer();
          } catch {
          }
        }}
      >
        Start
      </Button>
    </Box>
  );
};

export default NoteViewer;
