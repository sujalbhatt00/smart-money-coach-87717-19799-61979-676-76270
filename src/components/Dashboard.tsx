import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";

const Dashboard = () => {
  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await supabase.from('expenses').select('*');
      return data || [];
    },
  });

  const { data: income } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const { data } = await supabase.from('income').select('*');
      return data || [];
    },
  });

  const { data: investments } = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data } = await supabase.from('investments').select('*');
      return data || [];
    },
  });

  const totalIncome = income?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalExpenses = expenses?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalInvestments = investments?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const netBalance = totalIncome - totalExpenses - totalInvestments;

  const overviewData = [
    { name: 'Income', value: totalIncome, color: 'hsl(var(--success))' },
    { name: 'Expenses', value: totalExpenses, color: 'hsl(var(--destructive))' },
    { name: 'Investments', value: totalInvestments, color: 'hsl(var(--primary))' },
  ].filter(item => item.value > 0);

  // Spending by Category
  const categoryData = expenses?.reduce((acc: any, expense: any) => {
    const existing = acc.find((item: any) => item.name === expense.category);
    if (existing) {
      existing.value += Number(expense.amount);
    } else {
      acc.push({ 
        name: expense.category || 'Other', 
        value: Number(expense.amount),
        color: `hsl(${Math.random() * 360} 70% 60%)`
      });
    }
    return acc;
  }, []) || [];

  // Income vs Expenses comparison
  const comparisonData = [{
    name: 'This Month',
    Income: totalIncome,
    Expenses: totalExpenses,
  }];

  // Investment Portfolio by type
  const investmentData = investments?.reduce((acc: any, investment: any) => {
    const existing = acc.find((item: any) => item.name === investment.type);
    if (existing) {
      existing.value += Number(investment.amount);
    } else {
      acc.push({ 
        name: investment.type || 'Other', 
        value: Number(investment.amount),
        color: `hsl(${Math.random() * 360} 70% 60%)`
      });
    }
    return acc;
  }, []) || [];

  // 6-Month Financial Trend (mock data - in production, this would come from historical data)
  const trendData = [
    { month: 'May 2025', income: 0, expenses: 0, investments: 0 },
    { month: 'Jun 2025', income: 0, expenses: 0, investments: 0 },
    { month: 'Jul 2025', income: 0, expenses: 0, investments: 0 },
    { month: 'Aug 2025', income: 0, expenses: 0, investments: 0 },
    { month: 'Sep 2025', income: 0, expenses: 0, investments: 0 },
    { month: 'Oct 2025', income: totalIncome, expenses: totalExpenses, investments: totalInvestments },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-glow hover:shadow-large transition-all duration-300 border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-success drop-shadow-[0_0_8px_hsl(var(--success)/0.8)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success glow-success">₹{totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly earnings</p>
          </CardContent>
        </Card>

        <Card className="shadow-glow hover:shadow-large transition-all duration-300 border-destructive/20 bg-gradient-to-br from-card to-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-5 w-5 text-destructive drop-shadow-[0_0_8px_hsl(var(--destructive)/0.8)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive glow-destructive">₹{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Monthly spending</p>
          </CardContent>
        </Card>

        <Card className="shadow-glow hover:shadow-large transition-all duration-300 border-primary/20 bg-gradient-to-br from-card to-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
            <PiggyBank className="h-5 w-5 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary glow-text">₹{totalInvestments.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total invested</p>
          </CardContent>
        </Card>

        <Card className="shadow-glow hover:shadow-large transition-all duration-300 border-accent/20 bg-gradient-to-br from-card to-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <DollarSign className={`h-5 w-5 ${netBalance >= 0 ? 'text-success' : 'text-destructive'} drop-shadow-[0_0_8px_currentColor]`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${netBalance >= 0 ? 'text-success glow-success' : 'text-destructive glow-destructive'}`}>
              ₹{netBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">After expenses & investments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categoryData.length > 0 && (
          <Card className="shadow-medium hover:shadow-glow transition-all duration-300 border-primary/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="glow-text">Spending by Category</CardTitle>
              <p className="text-sm text-muted-foreground">Your expense distribution</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {comparisonData.length > 0 && (
          <Card className="shadow-medium hover:shadow-glow transition-all duration-300 border-primary/10 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="glow-text">Income vs Expenses</CardTitle>
              <p className="text-sm text-muted-foreground">Current month comparison</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    formatter={(value) => `₹${Number(value).toFixed(2)}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Income" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expenses" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {investmentData.length > 0 && (
        <Card className="shadow-medium hover:shadow-glow transition-all duration-300 border-primary/10 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="glow-text">Investment Portfolio</CardTitle>
            <p className="text-sm text-muted-foreground">Your investment allocation</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={investmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ₹${value.toFixed(2)} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {investmentData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-medium hover:shadow-glow transition-all duration-300 border-primary/10 bg-gradient-to-br from-card to-card/50">
        <CardHeader>
          <CardTitle className="glow-text">6-Month Financial Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Track your financial health over time</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                formatter={(value) => `₹${Number(value).toFixed(2)}`}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--success))', r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--destructive))', r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="investments" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
