import React, { useEffect, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const { Configuration, OpenAIApi } = require("openai");

const Chatbox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your AI waiter. How can I assist you today?", sender: "GPT" }
  ]);
  const [fileContents, setFileContents] = useState('');
  const [isUser, setIsUser] = useState(false);
  const [currMessage, setCurrMessage] = useState('');
  const [listeningMode, setListeningMode] = useState(false);
  const [textToSpeechEnabled, setTextToSpeechEnabled] = useState(true);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    fetch('/Menu.txt')
      .then((response) => response.text())
      .then((data) => {
        setFileContents(data);
      });
  }, []);

  useEffect(() => {
    if (isUser) {
      handleGptQuery(currMessage);
    }
  }, [messages]);

  useEffect(() => {
    if (!listening && transcript && listeningMode) {
      handleMessageSend(transcript); // Pass transcript to handleMessageSend
      resetTranscript();
      
    }
  }, [listening]);

  const configuration = new Configuration({
    apiKey: "sk-proj-gLJ1F0n0w7337mA9fjE4T3BlbkFJHfLAyhMsH2oPus7xbk9J",
  });

  const openai = new OpenAIApi(configuration);
  const toggleTextToSpeech = () => {
    setTextToSpeechEnabled(!textToSpeechEnabled);
  };
  const handleGptQuery = async (message) => {
    let gpt_message = "";

    try {
      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a restaurant waiter. You will be provided a set of items and foods, and you have to answer accordingly." },
          { role: "user", content: `${fileContents}\n\n\n\n These are the set of foods and items we are serving. Answer according only to the data which I've provided, and this is my query: ${message}` },
        ],
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 1,
      });
      gpt_message = response.data.choices[0].message.content;
      speak(gpt_message);
    } catch {
      gpt_message = "We don't have the food you've asked for :(";
      speak(gpt_message);
    }
    setMessages([...messages, { text: gpt_message, sender: "GPT" }]);
    setIsUser(false);
  };

  const handleMessageSend = (message) => {
    setMessages([...messages, { text: message, sender: "user" }]);
    setCurrMessage(message);
    setIsUser(true);
  };

  const speak = (text) => {
    if (textToSpeechEnabled) {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);const stopListening = () => {
    setListeningMode(false);
    const transcribedText = transcript || ""; // If there is no transcript, set an empty string
    setCurrMessage(transcribedText);
    SpeechRecognition.stopListening();
    }
  };
  };

  const startListening = () => {
    setListeningMode(true);
    SpeechRecognition.startListening({ continuous: true });
  };

  const stopListening = () => {
    setListeningMode(false);
    const transcribedText = transcript || ""; // If there is no transcript, set an empty string
    handleMessageSend(transcribedText); // Pass transcribed text to handleMessageSend
    resetTranscript(); // Reset the transcript after sending the message

    SpeechRecognition.stopListening();
  };
  

  return (
    <div className="fixed bottom-20 right-5 z-20 bg-white shadow-lg rounded-lg w-96 md:w-1/3 lg:w-1/4 h-96 md:h-2/3 lg:h-3/4 border border-gray-200 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-blue-600 rounded-t-lg">
        <h3 className="text-lg font-semibold text-white">AI Waiter</h3>
        <div>
          <button onClick={toggleTextToSpeech} className="text-white font-bold">{textToSpeechEnabled ? "Disable" : "Enable"} TTS</button>
          <button onClick={onClose} className="text-white font-bold ml-2">X</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`my-2 p-2 rounded-md ${
              message.sender === "user" ? "bg-blue-100 text-right" : "bg-gray-100 text-left"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-200">
        {!listeningMode && (
          <>
            <input
            type="text"
            placeholder="Type your message..."
            value={currMessage}
            onChange={(e) => setCurrMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleMessageSend(currMessage);
              }
            }}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />

            <button
              onClick={startListening}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md"
            >
              Start Speaking
            </button>
          </>
        )}
        {listeningMode && (
          <button
            onClick={stopListening}
            className="mt-2 w-full bg-red-600 text-white py-2 rounded-md"
          >
            Stop Speaking
          </button>
        )}
      </div>
    </div>
  );
};

export default Chatbox;
