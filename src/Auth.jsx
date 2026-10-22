
import { useState } from "react";
import { supabase } from "./supabase";
import "./Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (!data.session) {
          setMessage(
            "Account created! Check your email to confirm your account before logging in."
          );
        } else {
          setMessage("Account created successfully!");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">W</div>
          <p>WINTER ARC</p>
        </div>

        <p className="auth-eyebrow">YOUR 90-DAY TRANSFORMATION</p>

        <h1>{isLogin ? "Welcome back." : "Start your journey."}</h1>

        <p className="auth-description">
          {isLogin
            ? "Sign in and keep building the person you want to become."
            : "Create your account and take control of your next 90 days."}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder="At least 6 characters"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "New to Winter ARC?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </p>

        <p className="auth-footer">
          CONSISTENCY OVER MOTIVATION
        </p>
      </section>
    </main>
  );
}
