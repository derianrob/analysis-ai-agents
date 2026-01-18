import { useState } from "react";
import { AnalysisResult, ANALYSIS_TYPES } from "@/types/analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SentimentChart } from "./SentimentChart";
import { KeywordsChart } from "./KeywordsChart";
import { ClassificationChart } from "./ClassificationChart";
import { LengthChart } from "./LengthChart";

interface ResultsViewProps {
  results: AnalysisResult[];
}

export function ResultsView({ results }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState(results[0]?.questionId || '');

  const renderChart = (result: AnalysisResult) => {
    switch (result.analysisCode) {
      case 'ANL-01':
        return <SentimentChart data={result.result} />;
      case 'ANL-02':
        return <KeywordsChart data={result.result} />;
      case 'ANL-03':
        return <ClassificationChart data={result.result} />;
      case 'ANL-04':
        return <LengthChart data={result.result} />;
      default:
        return (
          <div className="p-4 rounded-lg bg-secondary">
            <pre className="text-sm text-muted-foreground overflow-auto">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        );
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 bg-secondary/50 p-1">
        {results.map((result) => {
          const analysisType = ANALYSIS_TYPES[result.analysisCode];
          return (
            <TabsTrigger
              key={result.questionId}
              value={result.questionId}
              className="text-xs sm:text-sm data-[state=active]:bg-card"
            >
              {result.questionId}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {results.map((result) => {
        const analysisType = ANALYSIS_TYPES[result.analysisCode];
        return (
          <TabsContent key={result.questionId} value={result.questionId} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{result.questionText}</CardTitle>
                    <CardDescription className="mt-1">
                      {analysisType?.name || result.analysisCode} • {result.analysisName}
                    </CardDescription>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {result.analysisCode}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {renderChart(result)}
              </CardContent>
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
