import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isAdmin = roles?.some((r) => r.role === "admin");

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("You don't have admin access.");
        return;
      }

      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } catch (err: any) {
      toast.error(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <img src={logo} alt="Mital Soni Makeover & Studio" className="w-16 h-16 rounded-full mx-auto object-cover" />
          <h1 className="text-3xl font-display font-bold gold-text">
            Admin Login
          </h1>
          <p className="text-muted-foreground text-sm">
            Mital Soni Makeover & Studio — Gallery Management
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-8 rounded-3xl bg-card border border-border space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nstudio10.com"
              className="bg-secondary border-border focus:border-primary rounded-xl h-12"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-secondary border-border focus:border-primary rounded-xl h-12"
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient text-primary-foreground font-body font-semibold py-6 rounded-full hover:opacity-90 transition-opacity"
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;