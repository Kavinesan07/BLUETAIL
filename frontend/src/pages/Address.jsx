import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { addressService } from "../services/addressservice";

export default function Address() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.username || "",
    email: user?.email || "",
    street: "",
    city: "",
    state: "",
    pin_code: "",
    phone_number: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    let { name, value } = e.target;
    // pin code and phone accept digits only
    if (name === "pin_code" || name === "phone_number") {
      value = value.replace(/\D/g, "");
    }
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validate() {
    const next = {};
    if (form.name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (!form.street.trim()) next.street = "Enter your street address.";
    if (!form.city.trim()) next.city = "Enter your city.";
    if (!form.state.trim()) next.state = "Enter your state.";
    if (!/^\d{6}$/.test(form.pin_code)) next.pin_code = "PIN code must be exactly 6 digits.";
    if (!/^\d{10,15}$/.test(form.phone_number)) next.phone_number = "Phone must be 10 to 15 digits.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    // Only the fields the backend expects (AddressCreate)
    const payload = {
      user_id: user.id,
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pin_code: form.pin_code,
      phone_number: form.phone_number,
    };

    setLoading(true);
    try {
      const saved = await addressService.create(payload);
      const addressId = saved?.id ?? saved?.address?.id; // the id the backend gave to this address
      if (addressId == null) {
        throw new Error("The server did not return the saved address ID. Restart the backend and try again.");
      }

      // go to the Payment page and carry the address with us
     navigate("/orders", {
  state: {
    checkout: true,
    address: {
      id: addressId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone_number: form.phone_number,
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pin_code: form.pin_code,
    },
  },
});
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Navbar />
      <main className="content">
        <form className="form wide-form" onSubmit={handleSubmit} noValidate>
          <h1>Delivery address</h1>
          <p className="hint">Where should we send your order?</p>

          {serverError && <div className="error" role="alert">{serverError}</div>}

          <div className="row-2">
            <FormField id="name" name="name" label="Full name" autoComplete="name"
              value={form.name} onChange={handleChange} error={errors.name} />
            <FormField id="email" name="email" type="email" label="Email" autoComplete="email"
              value={form.email} onChange={handleChange} error={errors.email} />
          </div>

          <FormField id="street" name="street" label="Street address" autoComplete="street-address"
            maxLength={200} value={form.street} onChange={handleChange} error={errors.street} />

          <div className="row-2">
            <FormField id="city" name="city" label="City" autoComplete="address-level2"
              maxLength={100} value={form.city} onChange={handleChange} error={errors.city} />
            <FormField id="state" name="state" label="State" autoComplete="address-level1"
              maxLength={100} value={form.state} onChange={handleChange} error={errors.state} />
          </div>

          <div className="row-2">
            <FormField id="pin_code" name="pin_code" label="PIN code" inputMode="numeric"
              maxLength={6} value={form.pin_code} onChange={handleChange} error={errors.pin_code} />
            <FormField id="phone_number" name="phone_number" label="Phone number" type="tel"
              inputMode="numeric" maxLength={15} autoComplete="tel"
              value={form.phone_number} onChange={handleChange} error={errors.phone_number} />
          </div>

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save address"}
          </button>
        </form>
      </main>
    </div>
  );
}