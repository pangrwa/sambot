import { Configuration, StreamingAvatarApi } from "@heygen/streaming-avatar";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useAi } from "../hooks/useAi";

const HEY_GEN_TRIAL_TOKEN = import.meta.env.VITE_HEY_GEN_TRIAL_TOKEN;
const AVATAR_ID = "Wayne_20240711";

function InteractiveAvatar() {
  const avatar = useRef(null);
  const mediaStream = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false)
  const [stream, setStream] = useState();
  const [debug, setDebug] = useState();
  const [data, setData] = useState();
  const { aiResponse } = useAi(); 

  async function handleStartSession() {
    setIsLoading(true);
    await updateToken(); 
    if (!avatar.current) {
      console.log("Avatar is not initialised");
    } else {
      try {
        console.log(avatar.current)
        const res = await avatar.current.createStartAvatar(
          {
            newSessionRequest: {
              quality: "medium",
              avatarName: AVATAR_ID,
              // voice: { voiceId: VOICE_ID },
            },
          },
          setDebug
        );
        setData(res);
        setStream(avatar.current.mediaStream); // invoke useEffect to load video
        setIsLoaded(true);
        console.log("Session started")
      } catch (error) {
        console.error("Error starting avatar session:", error);
      }
    }
    setIsLoading(false);
  }

  async function handleEndSession() {
    console.log("Ending current session...")
    setIsLoading(true);
    if (!avatar.current) {
      console.log("Avatar API is not initialisedd");
      return;
    }
    if (!data) {
      console.log("No active session")
      avatar.current = undefined
      return;
    }

    await avatar.current.stopAvatar({
      stopSessionRequest: {
        sessionId: data?.sessionId,
      },
    });
    avatar.current = undefined
    setData(undefined)
    setIsLoaded(false);
    setStream(undefined);
    setIsLoading(false);
  }

  async function updateToken() {
    const sessionResponse = await fetchSessionToken();
    if (!sessionResponse.ok) {
        console.log("Unable to retrieve session token");
    } 
    const sessionToken = await sessionResponse.text();
    avatar.current = new StreamingAvatarApi(
        new Configuration({ accessToken: sessionToken })
    );
  }

  async function fetchSessionToken() {
    try {
      if (!HEY_GEN_TRIAL_TOKEN) {
        throw new Error("API key is missing from .env");
      }

      const res = await fetch(
        "https://api.heygen.com/v1/streaming.create_token",
        {
          method: "POST",
          headers: {
            "x-api-key": HEY_GEN_TRIAL_TOKEN,
          },
        }
      );

      const data = await res.json();

      return new Response(data.data.token, {
        status: 200,
      });
    } catch (error) {
      console.error("Error retrieving access token: ", error);

      return new Response("Failed to retrieve access token", {
        status: 500,
      });
    }
  }

  // On initial mount of component
  useEffect(() => {
    async function init() {
      console.log("Initialising streaming session...");
      const sessionResponse = await fetchSessionToken();
      const sessionToken = await sessionResponse.text();
      avatar.current = new StreamingAvatarApi(
        new Configuration({
          accessToken: sessionToken,
          jitterBuffer: 200,
        })
      );
    }
    init();
    // handleStartSession()
    // handle cleanup session afterwards
    return () => handleEndSession();
  }, []);

  // upon a new video session
  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current.play();
      };
    }
  }, [mediaStream, stream]);

  // new message from AI
  useEffect(() => {
    async function handleSpeak() {
        if (!avatar.current) {
            console.log("Avatar API is not initialised");
            return;
        }
        if (!data) {
          console.log("No active session")
          return;
        }
        console.log(aiResponse)
        await avatar.current.speak({
            taskRequest: { text: aiResponse, sessionId: data?.sessionId}
        }).catch((e) => {
            console.error("Video unable to generate response: ", e)
        });
    }
    handleSpeak()
  }, [aiResponse])

  return (
    <>
      <div className="video-container">
        <video
          className={`rounded-lg ${isLoaded ?  "loaded" : ""}`}
          ref={mediaStream}
          autoPlay
          playsInline
        />
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:hover:bg-blue-500"
        onClick={handleStartSession}
        disabled={isLoaded || isLoading}
      >
        Start Session
      </button>
      <button
        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:hover:bg-blue-500`}
        onClick={handleEndSession}
        disabled={!isLoaded || isLoading}
      >
        End Session
      </button>
    </>
  );
}

export default InteractiveAvatar;
