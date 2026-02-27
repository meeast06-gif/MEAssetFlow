"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAiSummary } from "@/lib/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Asset } from "@/lib/definitions";

type SummaryResult = {
  summary?: string;
  totalValue?: number;
  distribution?: { type: string; value: number; percentage: number }[];
  error?: string;
};

export default function AiSummary({ assets }: { assets: Asset[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SummaryResult | null>(null);

  const handleGenerateSummary = () => {
    startTransition(async () => {
      const summaryResult = await getAiSummary(assets);
      setResult(summaryResult);
    });
  };
  
  const hasAssets = assets.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>AI Portfolio Insights</CardTitle>
        <CardDescription>
          Get an AI-powered summary of your portfolio's characteristics.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {result?.summary && (
            <div className="prose prose-sm dark:prose-invert text-sm text-foreground">
                <p>{result.summary}</p>
            </div>
        )}
        {result?.error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{result.error}</AlertDescription>
            </Alert>
        )}
        {!result && (
            <div className="text-sm text-muted-foreground">
                Click the button below to generate an AI analysis of your current assets.
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleGenerateSummary} disabled={isPending || !hasAssets} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Summary
            </>
          )}
        </Button>
      </CardFooter>
      {!hasAssets && (
          <p className="text-xs text-muted-foreground text-center pb-4 px-6">
              Please add at least one asset to generate a summary.
          </p>
      )}
    </Card>
  );
}
