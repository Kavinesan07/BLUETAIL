import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const notice = location.state?.notice;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function validate() {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <h2>Log in</h2>
        <p className="hint">Enter your email and password to open your tasks.</p>

        {notice && <div className="success" role="status">{notice}</div>}
        {serverError && <div className="error" role="alert">{serverError}</div>}

        <FormField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormField
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
