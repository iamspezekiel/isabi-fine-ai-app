
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, BarChart, Lightbulb, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { aiAnalyzeActivity } from '@/ai/flows/activity-analysis-flow';
import type { ActivityAnalysisOutput } from '@/ai/flows/activity-analysis-flow';

const activityHistory = [
  { day: 'Mon', running: 2.5, walking: 1.0, cycling: 0, sleeping: 450 },
  { day: 'Tue', running: 0, walking: 2.0, cycling: 10.5, sleeping: 360 },
  { day: 'Wed', running: 3.0, walking: 1.5, cycling: 0, sleeping: 480 },
  { day: 'Thu', running: 0, walking: 2.5, cycling: 0, sleeping: 420 },
  { day: 'Fri', running: 4.0, walking: 1.0, cycling: 15.0, sleeping: 390 },
  { day: 'Sat', running: 5.0, walking: 3.0, cycling: 0, sleeping: 420 },
  { day: 'Sun', running: 0, walking: 4.0, cycling: 0, sleeping: 540 },
];

const chartConfig = {
  running: { label: 'Running (miles)', color: 'hsl(var(--chart-1))' },
  walking: { label: 'Walking (miles)', color: 'hsl(var(--chart-2))' },
  cycling: { label: 'Cycling (miles)', color: 'hsl(var(--chart-3))' },
  sleeping: { label: 'Sleeping (minutes)', color: 'hsl(var(--chart-5))' },
};


export default function ActivityHistoryPage() {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<ActivityAnalysisOutput | null>(null);
  const { toast } = useToast();

  const handleGetAnalysis = async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);

    try {
      const historyString = JSON.stringify(activityHistory.map(d => ({...d, sleeping: d.sleeping / 60})), null, 2);
      const result = await aiAnalyzeActivity({ history: historyString });
      setAiAnalysis(result);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      toast({
        title: "AI Error",
        description: "Could not get an analysis of your activity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center p-4 border-b bg-background/95 backdrop-blur-sm h-16">
        <div className="w-1/4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/activities" aria-label="Go back to activities">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
        </div>
        <div className="w-1/2 text-center">
            <h1 className="text-xl font-bold text-foreground font-heading truncate">Activity History &amp; Analysis</h1>
        </div>
        <div className="w-1/4" />
      </header>

      <main className="flex-grow container mx-auto p-4 pt-20 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-primary">
                <BarChart className="mr-2 h-5 w-5" />
                Weekly Activity Summary
              </CardTitle>
              <CardDescription>
                Your activity data from the past week. Units are miles for running/walking/cycling and minutes for sleeping.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart
                    data={activityHistory}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    accessibilityLayer
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis />
                    <ChartTooltip 
                        cursor={{fill: 'hsl(var(--muted))'}}
                        content={<ChartTooltipContent />} 
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="running" fill="var(--color-running)" radius={4} />
                    <Bar dataKey="walking" fill="var(--color-walking)" radius={4} />
                    <Bar dataKey="cycling" fill="var(--color-cycling)" radius={4} />
                    <Bar dataKey="sleeping" fill="var(--color-sleeping)" radius={4} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-primary">
                <BrainCircuit className="mr-2 h-5 w-5" />
                AI-Powered Analysis
              </CardTitle>
              <CardDescription>
                Get personalized insights and recommendations on your activity patterns from our AI fitness coach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGetAnalysis} disabled={isAiLoading} className="w-full h-11 text-base">
                {isAiLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Your Data...
                  </>
                ) : (
                  'Get AI Analysis & Recommendations'
                )}
              </Button>

              {aiAnalysis && (
                 <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-0">
                    <Alert className="border-primary/30 bg-primary/5">
                        <BrainCircuit className="h-5 w-5 text-primary" />
                        <AlertTitle className="font-semibold text-primary">Analysis</AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap text-foreground">
                            {aiAnalysis.analysis}
                        </AlertDescription>
                    </Alert>
                    <Alert className="border-green-600/30 bg-green-500/5">
                        <Lightbulb className="h-5 w-5 text-green-600" />
                        <AlertTitle className="font-semibold text-green-700">Recommendations</AlertTitle>
                        <AlertDescription className="whitespace-pre-wrap text-foreground">
                            {aiAnalysis.recommendations}
                        </AlertDescription>
                    </Alert>
                 </div>
              )}

            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
