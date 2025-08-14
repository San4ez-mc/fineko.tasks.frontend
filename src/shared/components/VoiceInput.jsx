import React, { useState, useRef } from "react";
import { FiMic, FiStopCircle } from "react-icons/fi";
import api from "../../services/api";
import "./VoiceInput.css";

/**
 * Кнопка для запису голосу і надсилання аудіо на бекенд.
 * @param {string} endpoint - URL ендпоінту, куди надсилати FormData з аудіо
 * @param {function} onResult - викликається з розпізнаним JSON після відповіді бекенду
 */
export default function VoiceInput({ endpoint, onResult }) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const toggleRecord = async () => {
    if (!recording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          chunksRef.current = [];
          const form = new FormData();
          form.append("file", blob, "voice.webm");
          try {
            const res = await api.post(endpoint, form, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            onResult && onResult(res.data || {});
          } catch (err) {
            console.error("Voice upload failed", err);
          }
        };
        recorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Mic init failed", err);
      }
    } else {
      mediaRef.current && mediaRef.current.stop();
      setRecording(false);
    }
  };

  return (
    <button
      type="button"
      className={`voice-btn ${recording ? "recording" : ""}`}
      onClick={toggleRecord}
      title={recording ? "Зупинити" : "Надиктувати"}
    >
      {recording ? <FiStopCircle /> : <FiMic />}
    </button>
  );
}

