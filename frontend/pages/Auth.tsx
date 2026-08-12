import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../lib/auth-context";
import { Boxes, Chrome } from "lucide-react";

export default function Auth() {
  const { signIn, signInWithGoogleAuth, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in — use useEffect to avoid navigate-during-render
  useEffect(() => {
    if (user) {
      navigate(user.organizationId ? "/app/overview" : "/app/onboarding", { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      await signInWithGoogleAuth();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    signIn(email, name);
    navigate("/app/onboarding");
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex items-center justify-center p-6 relative">
      {/* Radial overlay to fade grid edges */}
      <div className="absolute inset-0 mask-radial-fade pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-xs">
              <Boxes size={18} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">CoreStudy</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 text-center tracking-tight mb-1">Sign in to CoreStudy</h1>
          <p className="text-xs text-slate-500 text-center mb-6">Enterprise agentic commerce platform for Indonesian merchants</p>

          <div className="space-y-4">
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              variant="outline"
              className="w-full border-slate-200 text-slate-900 bg-white hover:bg-slate-50 gap-3 h-11 font-semibold cursor-pointer shadow-2xs"
            >
              <Chrome size={18} className="text-slate-900" />
              {loading ? "Connecting to Google..." : "Continue with Google"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            {!showEmailForm ? (
              <Button
                variant="ghost"
                onClick={() => setShowEmailForm(true)}
                className="w-full text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Use Email & Password Demo
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-600 text-xs font-medium">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Budi Santoso"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-slate-600 text-xs font-medium">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="budi@tokobudi.id"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10">
                  Continue to Workspace
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 text-center mt-5">
          Protected by Supabase & Google OAuth Security.
        </p>
      </div>
    </div>
  );
}
