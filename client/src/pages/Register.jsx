import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name) nextErrors.name = "Name is required";
    if (!formData.email) nextErrors.email = "Email is required";
    if (!formData.password) nextErrors.password = "Password is required";
    if (formData.password && formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      await register(formData);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      // Toast feedback is handled in the auth context.
    }
  };

  return (
    <AuthShell
      heroHeading={
        <>
          Start planning.
          <br />
          <span className="text-luxury-300">Travel</span> like a pro.
        </>
      }
      heroDescription="Create your account and let AI turn travel docs into startup-grade itineraries."
      cardTitle="Create account"
      cardSubtitle="Sign up to launch your AI travel workspace"
      footerText="Already have an account?"
      footerLinkTo="/login"
      footerLinkLabel="Log in"
      mobileHint="Already registered?"
      mobileHintLinkTo="/login"
      mobileHintLinkLabel="Log in"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormInput
          label="Full name"
          name="name"
          type="text"
          placeholder="TripGenie Explorer"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          inputClassName="h-14 rounded-xl bg-slate-950/70 text-lg"
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="you@tripgenie.ai"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          inputClassName="h-14 rounded-xl bg-slate-950/70 text-lg"
        />

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              className="input-field h-14 rounded-xl bg-slate-950/70 pr-12 text-lg"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-luxury-300"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password ? <span className="mt-2 block text-sm text-red-300">{errors.password}</span> : null}
        </label>

        <button type="submit" className="primary-button h-14 rounded-xl text-2xl font-bold" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;
