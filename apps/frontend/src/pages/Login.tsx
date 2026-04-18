import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await login (loginName, password);
    } catch (err) {
      setError("Invalid login credentials");
      setLoginName("");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}
      <div className="mb-4">
        <label htmlFor="loginName" className="block text-gray-700 mb-2">Username or Email</label>
        <input
          placeholder="username / example@example.com"
          type="text"
          id="loginName"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
        <input
          placeholder="********"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 px-4 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 focus:outline-none focus:ring ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
      <button 
        type="button"
        className="w-full py-2 px-4 bg-gray-500 text-white font-bold rounded hover:bg-gray-600 focus:outline-none focus:ring"
        onClick={() => navigate("/register")}
      >
        Don't have an account? Register
      </button>
    </form>
  );
};

export default Login;
