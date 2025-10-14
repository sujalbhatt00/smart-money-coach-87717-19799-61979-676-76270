import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Trash2, TrendingUp, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const SavingsGoals = () => {
  const [open, setOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: goals } = useQuery({
    queryKey: ['savings_goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from('savings_goals').insert({
        user_id: user.id,
        title,
        target_amount: parseFloat(targetAmount),
        target_date: targetDate || null,
        category,
        description,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      toast.success("Savings goal created");
      setOpen(false);
      setTitle("");
      setTargetAmount("");
      setTargetDate("");
      setCategory("");
      setDescription("");
    },
    onError: () => {
      toast.error("Failed to create savings goal");
    },
  });

  const updateAmountMutation = useMutation({
    mutationFn: async () => {
      if (!selectedGoalId) return;
      const goal = goals?.find(g => g.id === selectedGoalId);
      if (!goal) return;

      const newAmount = Number(goal.current_amount) + Number(addAmount);
      const isCompleted = newAmount >= Number(goal.target_amount);

      const { error } = await supabase
        .from('savings_goals')
        .update({ 
          current_amount: newAmount,
          is_completed: isCompleted 
        })
        .eq('id', selectedGoalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      toast.success("Progress updated");
      setAddOpen(false);
      setAddAmount("");
      setSelectedGoalId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      toast.success("Savings goal deleted");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const handleAddAmount = (e: React.FormEvent) => {
    e.preventDefault();
    updateAmountMutation.mutate();
  };

  const activeGoals = goals?.filter(g => !g.is_completed) || [];
  const completedGoals = goals?.filter(g => g.is_completed) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Savings Goals</h2>
          <p className="text-muted-foreground">Track your progress towards financial milestones</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Savings Goal</DialogTitle>
              <DialogDescription>Set a new financial target</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Date (Optional)</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Emergency, Vacation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about your goal..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                Create Goal
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Savings</DialogTitle>
            <DialogDescription>Update your progress</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAmount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addAmount">Amount to Add</Label>
              <Input
                id="addAmount"
                type="number"
                step="0.01"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateAmountMutation.isPending}>
              Update Progress
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Goals</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => {
              const percentage = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
              const remaining = Number(goal.target_amount) - Number(goal.current_amount);

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <Target className="h-5 w-5" />
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          {goal.category && (
                            <CardDescription className="mt-1">
                              <Badge variant="secondary">{goal.category}</Badge>
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          ${Number(goal.current_amount).toFixed(2)} / ${Number(goal.target_amount).toFixed(2)}
                        </span>
                      </div>
                      <Progress value={Math.min(percentage, 100)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage.toFixed(1)}% complete</span>
                        <span>${remaining.toFixed(2)} remaining</span>
                      </div>
                    </div>

                    {goal.target_date && (
                      <div className="text-sm text-muted-foreground">
                        Target: {format(new Date(goal.target_date), "MMM dd, yyyy")}
                      </div>
                    )}

                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => {
                        setSelectedGoalId(goal.id);
                        setAddOpen(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Add Money
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Completed Goals
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="border-success">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-success" />
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                    </div>
                    <Badge className="bg-success text-success-foreground">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">
                    ${Number(goal.target_amount).toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {goals?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No savings goals yet. Create your first goal to start saving!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavingsGoals;