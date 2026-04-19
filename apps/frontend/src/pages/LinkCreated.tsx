import { Navigate, useLocation } from "react-router-dom";
import { useState } from "react";



const LinkCreated = () => {

  const location = useLocation();
  const state = location.state as {
    shortId: string;
    shortUrl: string;
    originalUrl: string;
} | null;

if (!state) {
    return <Navigate to="/shorten" replace />;
  }

  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(state.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL", err);
    }
  };


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Link Created!</h1>
      <p className="mb-2">
        Your shortened URL is:{" "}
        <a href={state.shortUrl} className="text-blue-500" target="_blank" rel="noopener noreferrer">
          {state.shortUrl}
        </a>
      </p>
      <button
        onClick={copy}
        className={`px-4 py-2 rounded ${copied ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
      >
        {copied ? "Copied!" : "Copy to Clipboard"}
      </button>
    </div>
  );
};

export default LinkCreated;
