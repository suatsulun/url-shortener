import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailTest, setEmailTest] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTest, setPasswordTest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();


  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const isValidUsername = username.trim() !== "";
    if (!isValidUsername) {
      setError("Username cannot be empty.");
      return;
    }
    const isValidUsernameFormat = /^[a-zA-Z0-9_]+$/.test(username);
    if (!isValidUsernameFormat) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }
    const isValidUsernameLength = username.length >= 3 && username.length <= 20;
    if (!isValidUsernameLength) {
      setError("Username must be between 3 and 20 characters long.");
      return;
    }
    const isEmailMatch = email === emailTest;
    if (!isEmailMatch) {
      setError("Email and confirmation email do not match.");
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail) {
    setError("Please enter a valid email address.");
    return;
    }
    const isPasswordMatch = password === passwordTest;
    if (!isPasswordMatch) {
      setError("Password and confirmation password do not match.");
      return;
    }
    const isValidPasswordFormat = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(
      password,
    );
    if (!isValidPasswordFormat) {
      setError("Password must contain at least one letter and one number.");
      return;
    }
    const isValidPassword = password.length >= 6;
    if (!isValidPassword) {
      setError("Password must be at least 6 characters long.");
      return;
    }


    try {
        setIsSubmitting(true);
      await register(username, email, password);
      navigate ("/dashboard");
    } catch (err:any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };



  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <div>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="emailTest">Confirm Email:</label>
        <input
          type="email"
          id="emailTest"
          value={emailTest}
          onChange={(e) => setEmailTest(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="passwordTest">Confirm Password:</label>
        <input
          type="password"
          id="passwordTest"
          value={passwordTest}
          onChange={(e) => setPasswordTest(e.target.value)}
        />
      </div>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </button>
      <Link to="/login">Already have an account? Login</Link>
    </form>
  );
};

export default Register;
