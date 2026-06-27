import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useSignUp } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import hero from "@/assets/hero-saree.jpg";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — Kamadhenu Silks" }] }),
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { mutate: signUp, isPending } = useSignUp();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !confirmPassword || !fullName || !phone || !address) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    signUp(
      {
        email,
        password,
        metadata: {
          full_name: fullName,
          phone,
          address,
        },
      },
      {
        onSuccess: () => {
          setSuccess("Account created! Check your email to confirm.");
          setTimeout(() => {
            navigate({ to: "/login" });
          }, 2000);
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Sign up failed");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-ivory">
      <SiteHeader />
      <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-0 px-0 py-0">
        <div className="relative hidden lg:block">
          <img src={hero} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-royal/70 via-royal/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 text-royal-foreground">
            <p className="text-[11px] uppercase tracking-[0.3em] text-gradient-gold">Kamadhenu Silks</p>
            <h2 className="mt-2 font-display text-3xl">Join the circle.</h2>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-16 lg:py-24">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl text-royal">Create account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Join Kamadhenu and explore our collection.</p>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <Field
                label="Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Field
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Field
                label="Address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, City, State, Zip"
                required
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Field
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-royal py-3.5 text-sm font-semibold uppercase tracking-widest text-royal-foreground hover:bg-maroon transition-colors disabled:opacity-50"
              >
                {isPending ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already a member?{" "}
              <Link to="/login" className="font-semibold text-royal hover:text-maroon">
                Sign in
              </Link>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-royal">← Back home</Link>
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function Field({ label, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="mt-1.5 w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-gold"
      />
    </label>
  );
}
