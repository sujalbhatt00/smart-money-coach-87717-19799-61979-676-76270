import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, DollarSign, Crown, TrendingUp, Wallet, PiggyBank, Bell, Target, Download, History, Repeat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Dashboard from "@/components/Dashboard";
import AddExpense from "@/components/AddExpense";
import AddIncome from "@/components/AddIncome";
import AddInvestment from "@/components/AddInvestment";
import AIAnalysis from "@/components/AIAnalysis";
import Subscription from "@/components/Subscription";
import Notifications from "@/components/Notifications";
import ExpenseHistory from "@/components/ExpenseHistory";
import BudgetTracker from "@/components/BudgetTracker";
import RecurringExpenses from "@/components/RecurringExpenses";
import BillReminders from "@/components/BillReminders";
import SavingsGoals from "@/components/SavingsGoals";
import ExportData from "@/components/ExportData";
import { SubscriptionProvider, useSubscription } from "@/contexts/SubscriptionContext";
import { useQuery } from "@tanstack/react-query";

const IndexContent = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { subscribed } = useSubscription();

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await supabase.from('expenses').select('*');
      return data || [];
    },
    enabled: !!user,
  });

  const { data: income } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const { data } = await supabase.from('income').select('*');
      return data || [];
    },
    enabled: !!user,
  });

  const { data: investments } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data } = await supabase.from('investments').select('*');
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary rounded-xl p-2 shadow-glow">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  FinPro
                </h1>
                <p className="text-xs text-muted-foreground">Advanced Finance Management</p>
              </div>
              {subscribed && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-primary border-0">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full justify-start bg-card/50 backdrop-blur-sm p-1">
              <TabsTrigger value="dashboard" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="income" className="gap-2">
                <Wallet className="h-4 w-4" />
                Income
              </TabsTrigger>
              <TabsTrigger value="expenses" className="gap-2">
                <DollarSign className="h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="budgets" className="gap-2">
                <PiggyBank className="h-4 w-4" />
                Budgets
              </TabsTrigger>
              <TabsTrigger value="recurring" className="gap-2">
                <Repeat className="h-4 w-4" />
                Recurring
              </TabsTrigger>
              <TabsTrigger value="bills" className="gap-2">
                <Bell className="h-4 w-4" />
                Bills
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-2">
                <Target className="h-4 w-4" />
                Goals
              </TabsTrigger>
              <TabsTrigger value="investments" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Investments
                <span className="text-xs text-amber-500">Free until Oct 24!</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                AI Analysis
              </TabsTrigger>
              <TabsTrigger value="export" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2">
                <Crown className="h-4 w-4" />
                Premium
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="history">
            <ExpenseHistory />
          </TabsContent>

          <TabsContent value="income">
            <div className="max-w-2xl mx-auto">
              <AddIncome />
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="max-w-2xl mx-auto">
              <AddExpense />
            </div>
          </TabsContent>

          <TabsContent value="budgets">
            <BudgetTracker />
          </TabsContent>

          <TabsContent value="recurring">
            <RecurringExpenses />
          </TabsContent>

          <TabsContent value="bills">
            <BillReminders />
          </TabsContent>

          <TabsContent value="goals">
            <SavingsGoals />
          </TabsContent>

          <TabsContent value="investments">
            <div className="max-w-2xl mx-auto">
              <AddInvestment />
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <div className="max-w-2xl mx-auto">
              <AIAnalysis 
                expenses={expenses || []} 
                income={income || []} 
                investments={investments || []} 
              />
            </div>
          </TabsContent>

          <TabsContent value="export">
            <ExportData />
          </TabsContent>

          <TabsContent value="subscription">
            <Subscription />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <SubscriptionProvider user={user}>
      <IndexContent />
    </SubscriptionProvider>
  );
};

export default Index;
