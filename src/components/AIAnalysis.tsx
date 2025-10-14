import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Crown } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIAnalysisProps {
  expenses: any[];
  income: any[];
  investments: any[];
}

const AIAnalysis = ({ expenses, income, investments }: AIAnalysisProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const { toast } = useToast();
  const { subscribed } = useSubscription();

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-finances', {
        body: { 
          expenses, 
          income, 
          investments,
          isAdvanced: subscribed 
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      toast({ title: "Analysis complete!" });
    },
    onError: (error: any) => {
      console.error('Analysis error:', error);
      if (error.message?.includes('429')) {
        toast({ 
          title: "Rate limit exceeded", 
          description: "Please try again in a few moments.",
          variant: "destructive" 
        });
      } else if (error.message?.includes('402')) {
        toast({ 
          title: "Credits needed", 
          description: "Please add credits to continue using AI features.",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Analysis failed", 
          description: "Please try again later.",
          variant: "destructive" 
        });
      }
    },
  });

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Financial Analysis
        </CardTitle>
        <CardDescription>
          Get AI-powered financial insights. {!subscribed && "Upgrade to Premium for advanced analysis."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!subscribed && (
          <Alert>
            <Crown className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              You're using basic AI analysis. Upgrade to Premium for more detailed and advanced analysis.
            </AlertDescription>
          </Alert>
        )}
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending || (!expenses?.length && !income?.length && !investments?.length)}
          className="w-full bg-gradient-primary"
        >
          {analyzeMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {analyzeMutation.isPending ? "Analyzing..." : subscribed ? "Get Advanced AI Analysis" : "Get Basic AI Analysis"}
        </Button>

        {analysis && (
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">AI Recommendations:</h3>
            <div className="text-sm whitespace-pre-wrap">{analysis}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysis;
