import { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (mode === "login") {
      const res = auth.login(username.trim(), password);
      if (!res.success) return setError(res.message);
      navigate("/");
    } else {
      if (!password) return setError("Password cannot be empty");
      if (password !== confirmPassword) return setError("Passwords do not match");

      const res = auth.register(username.trim(), password);
      if (!res.success) return setError(res.message);
      setConfirmPassword("");
      navigate("/");
    }
  };

  return (
    <div className="d-flex justify-content-center p-4">
      <Card className="p-4" style={{ width: 400, background: "var(--color-secondary)" }}>
        <Card.Body>
          <h3 className="text-center" style={{ color: "var(--color-text-on-light)" }}>
            {mode === "login" ? "Log In" : "Create Account"}
          </h3>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-2">
              <Form.Label style={{ color: "var(--color-text-on-light)" }}>Username</Form.Label>
              <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label style={{ color: "var(--color-text-on-light)" }}>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Form.Group>

            {mode === "register" && (
              <Form.Group className="mb-2">
                <Form.Label style={{ color: "var(--color-text-on-light)" }}>Confirm Password</Form.Label>
                <Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </Form.Group>
            )}

            {error && <div className="mb-2" style={{ color: "var(--color-danger)" }}>{error}</div>}

            <Button type="submit" className="w-100">{mode === "login" ? "Log In" : "Register"}</Button>
          </Form>

          <div className="mt-3 text-center">
            {mode === "login" ? (
              <>
                <span style={{ color: "var(--color-text-on-light)" }}>Don't have an account? </span>
                <Button variant="link" onClick={() => { setMode("register"); setError(""); setConfirmPassword(""); setPassword(""); }}>Create one</Button>
              </>
            ) : (
              <>
                <span style={{ color: "var(--color-text-on-light)" }}>Already have an account? </span>
                <Button variant="link" onClick={() => { setMode("login"); setError(""); setConfirmPassword(""); setPassword(""); }}>Log in</Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}