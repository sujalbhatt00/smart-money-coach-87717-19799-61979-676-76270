import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { expenses, income, investments, isAdvanced } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const totalIncome = income.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
    const totalInvestments = investments.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

    const expensesByCategory = expenses.reduce((acc: any, expense: any) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {});

    const basicPrompt = `As a financial advisor, provide a brief analysis of this financial data:

Income: $${totalIncome.toFixed(2)}
Expenses: $${totalExpenses.toFixed(2)}
Net Balance: $${(totalIncome - totalExpenses - totalInvestments).toFixed(2)}

Provide a short summary (3-4 sentences) with one key recommendation.`;

    const advancedPrompt = `As a financial advisor, analyze the following financial data and provide comprehensive actionable recommendations:

Income: $${totalIncome.toFixed(2)}
Expenses: $${totalExpenses.toFixed(2)} (breakdown: ${JSON.stringify(expensesByCategory)})
Investments: $${totalInvestments.toFixed(2)}
Net Balance: $${(totalIncome - totalExpenses - totalInvestments).toFixed(2)}

Please provide:
1. Detailed assessment of the current financial situation
2. Specific recommendations to reduce expenses
3. Investment optimization suggestions
4. Budget allocation recommendations
5. Tax optimization strategies
6. Long-term financial planning advice
7. Key action items to improve financial health

Provide a comprehensive, detailed analysis.`;

    const prompt = isAdvanced ? advancedPrompt : basicPrompt;

    console.log('Sending request to Lovable AI...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial advisor providing clear, actionable advice to help individuals and small businesses optimize their finances.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your account.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('Received response from AI');
    
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-finances function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
