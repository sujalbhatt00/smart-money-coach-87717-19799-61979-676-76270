import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, Loader2 } from "lucide-react";

const Subscription = () => {
  const { subscribed, subscriptionEnd, loading, checkSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) {
        throw error;
      }

      if (data?.url) {
        window.open(data.url, "_blank");
        
        // Check subscription after a delay to allow payment processing
        setTimeout(() => {
          checkSubscription();
        }, 5000);
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to start checkout process. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const features = {
    free: [
      "View dashboard",
      "Add expenses (limited)",
      "Add income (limited)",
      "Basic AI analysis",
    ],
    premium: [
      "Unlimited expenses tracking",
      "Unlimited income tracking",
      "Unlimited investments tracking",
      "Advanced AI analysis",
      "Priority support",
      "Twilio notifications",
    ],
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-muted-foreground">
          Choose the plan that fits your financial management needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className={!subscribed ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Free</span>
              {!subscribed && <Badge>Current Plan</Badge>}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">$0</span>/month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={subscribed ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium
              </span>
              {subscribed && <Badge>Current Plan</Badge>}
            </CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold">₹1</span>/month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {subscribed ? (
              <div className="space-y-2">
                <Button className="w-full" disabled>
                  <Crown className="mr-2 h-4 w-4" />
                  Active
                </Button>
                {subscriptionEnd && (
                  <p className="text-sm text-muted-foreground text-center">
                    Renews on {new Date(subscriptionEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <Button 
                className="w-full" 
                onClick={handleSubscribe}
                disabled={isProcessing || loading}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Premium
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={checkSubscription}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            "Refresh Status"
          )}
        </Button>
      </div>
    </div>
  );
};

export default Subscription;
