import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.email) nextErrors.email = "Email is required";
    if (!formData.password) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      await login(formData);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      // Toast feedback is handled in the auth context.
    }
  };

  return (
    <AuthShell
      heroHeading={
        <>
          Plan smarter.
          <br />
          <span className="text-luxury-300">Travel</span> better.
        </>
      }
      heroDescription="Upload your travel docs and let AI craft the perfect itinerary for you."
      cardTitle="Welcome back"
      cardSubtitle="Log in to continue your journey"
      footerText="Don&apos;t have an account?"
      footerLinkTo="/register"
      footerLinkLabel="Create one"
      mobileHint="Need an account?"
      mobileHintLinkTo="/register"
      mobileHintLinkLabel="Register"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
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
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
};

export default Login;
