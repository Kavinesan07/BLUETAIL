import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function validate() {
    const next = {};
    if (!form.username.trim()) next.username = "Enter a username.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate("/login", { state: { notice: "Account created. Log in to continue." } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <h2>Create your account</h2>
        <p className="hint">It takes less than a minute.</p>

        {serverError && <div className="error" role="alert">{serverError}</div>}

        <FormField
          id="username"
          name="username"
          label="Username"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          error={errors.username}
        />
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
          autoComplete="new-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button className="primary" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
