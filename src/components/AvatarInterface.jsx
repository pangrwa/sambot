import { useEffect, useRef, useState } from "react";
import InteractiveAvatar from "./InteractiveAvatar";
import InteractiveTextInput from "./InteractiveTextInput";
import { Button } from "./ui/button";
import { Configuration, StreamingAvatarApi } from "@heygen/streaming-avatar";
import { useAi } from "@/hooks/useAi";
import { Textarea } from "./ui/textarea";
import { useConversation } from "@/hooks/useConversation";

const HEY_GEN_TRIAL_TOKEN = import.meta.env.VITE_HEY_GEN_TRIAL_TOKEN;
const AVATAR_ID = "Wayne_20240711";

function AvatarInterface() {
  const avatar = useRef(null);
  const mediaStream = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        console.log(avatar.current);
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
        console.log("Session started");
      } catch (error) {
        console.error("Error starting avatar session:", error);
      }
    }
    setIsLoading(false);
  }

  async function handleEndSession() {
    console.log("Ending current session...");
    setIsLoading(true);
    if (!avatar.current) {
      console.log("Avatar API is not initialisedd");
      return;
    }
    if (!data) {
      console.log("No active session");
      avatar.current = undefined;
      return;
    }

    await avatar.current.stopAvatar({
      stopSessionRequest: {
        sessionId: data?.sessionId,
      },
    });
    avatar.current = undefined;
    setData(undefined);
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
        "https:/api.heygen.com/v1/streaming.create_token",
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
        console.log("No active session");
        return;
      }
      console.log(aiResponse);
      await avatar.current
        .speak({
          taskRequest: { text: aiResponse, sessionId: data?.sessionId },
        })
        .catch((e) => {
          console.error("Video unable to generate response: ", e);
        });
    }
    handleSpeak();
  }, [aiResponse]);

  const input = useRef();
  const [content, setContent] = useState("");
  const { generateAIResponse } = useAi();
  const { setConversations } = useConversation();

  function handleInput(event) {
    event.target.style.height = "auto";
    event.target.style.height = `${event.target.scrollHeight}px`;
    if (event.target.style.height > 160) {
      event.target.style.height = "auto";
    }
    setContent(event.target.value);
  }

  function sendMessage() {
    setIsLoading(true);
    setConversations((prevConversation) => [...prevConversation, {
      role: 'user',
      message: content
    }]);
    generateAIResponse(content);
    input.current.value = "";
    input.current.style.height = "auto";
    setContent("");
    setIsLoading(false);
  }

  return (
    <>
      <div className="video-container relative">
        <video
          className={`rounded-lg ${isLoaded ? "loaded" : ""}`}
          ref={mediaStream}
          autoPlay
          playsInline
        />

        <div className="absolute bottom-0 right-0 p-3">
          {stream ? (
            <Button
              onClick={handleEndSession}
              disabled={!isLoaded || isLoading}
            >
              End session
            </Button>
          ) : (
            <Button
              onClick={handleStartSession}
              disabled={isLoaded || isLoading}
            >
              StartSession
            </Button>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center gap-4">
        <Textarea
          placeholder="Message SamBot"
          className="w-full resize-none max-h-40 overflow-y-auto"
          ref={input}
          onInput={handleInput}
          onKeyDown={(e) => {
            if (e.key == 'Enter') {
              if (isLoading || !content.trim()) {
                return; // shouldn't submit an event
              }
              e.preventDefault(); // prevent new line
              sendMessage()
            }
          }}
        ></Textarea>
        <Button onClick={sendMessage} disabled={!stream || isLoading || !content.trim()}>
          Send
        </Button>
      </div>
    </>
  );
}

export default AvatarInterface;
