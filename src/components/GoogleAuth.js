import React, { useEffect } from "react";
import { gapi } from "gapi-script";

const CLIENT_ID = "495406716121-7hdik8h9i8ctv1ate4dsosmnpnmagu20.apps.googleusercontent.com";
const DISCOVERY_DOC = "https://docs.googleapis.com/$discovery/rest?version=v1";
const SCOPES = "https://www.googleapis.com/auth/documents";

const GoogleAuth = (props) => {
  const handleSignIn = () => {
    const start = () => {
      gapi.client.init({
        apiKey: props.API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: [DISCOVERY_DOC],
        scope: SCOPES,
      });
    };

    gapi.load("client:auth2", start);
    gapi.auth2.getAuthInstance().signIn();
  };

  return (
    <button onClick={handleSignIn}>Sign in with Google</button>
  );
};

export default GoogleAuth;
