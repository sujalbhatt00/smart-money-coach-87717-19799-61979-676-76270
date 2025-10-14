import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign } from "lucide-react";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Diwali Offer Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 rounded-xl text-center backdrop-blur-sm">
          <div className="text-2xl mb-1">🪔 Diwali Special Offer 🪔</div>
          <p className="text-sm font-semibold">Get 10 Days FREE Premium Access for All Users!</p>
          <p className="text-xs text-muted-foreground mt-1">Valid until October 24, 2025</p>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-primary rounded-2xl p-4 shadow-glow animate-in fade-in zoom-in duration-500">
              <DollarSign className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">FinPro</h1>
          <p className="text-muted-foreground">Smart finance management with AI-powered insights</p>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm rounded-xl shadow-elegant border border-border/50 p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(217 91% 60%)',
                    brandAccent: 'hsl(217 91% 50%)',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'transition-all duration-300',
                input: 'transition-all duration-200',
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
