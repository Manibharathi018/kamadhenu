import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { useSignIn } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { useAdmin } from "@/lib/admin-context";
import hero from "@/assets/hero-saree.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Kamadhenu Silks" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isAdmin, login: adminLogin } = useAdmin();
  const { mutate: signIn, isPending } = useSignIn();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/dashboard" });
    }
    if (isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [user, loading, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Check admin credentials first
    if (adminLogin(email, password)) {
      navigate({ to: "/admin" });
      return;
    }

    // Otherwise, proceed with user login
    signIn(
      { email, password },
      {
        onSuccess: () => {
          navigate({ to: "/dashboard" });
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : "Sign in failed");
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
            <h2 className="mt-2 font-display text-3xl">Step into a legacy of silk.</h2>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-16 lg:py-24">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl text-royal">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your saree journey.</p>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <Field
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Field
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex justify-end text-xs">
                <a href="#" className="text-muted-foreground hover:text-royal">Forgot password?</a>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-full bg-royal py-3.5 text-sm font-semibold uppercase tracking-widest text-royal-foreground hover:bg-maroon transition-colors disabled:opacity-50"
              >
                {isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-royal hover:text-maroon">
                Create an account
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
