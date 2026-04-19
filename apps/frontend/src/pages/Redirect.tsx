import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import { useEffect } from "react";

const Redirect = () => {
  const { shortId } = useParams();
  const valid = shortId && /^[A-Za-z0-9_-]{6}$/.test(shortId);
  if (!valid) return <NotFound />;

  useEffect(() => {
    window.location.replace(`${import.meta.env.VITE_API_BASE_URL}/urls/${shortId}`);
  }, [shortId]);


  return (
    <div className="flex min-h-screen items-center justify-center text-muted">
      Redirecting...
    </div>
  );

};

export default Redirect;
