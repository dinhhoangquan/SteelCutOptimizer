import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OptimizationResultData } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { exportToExcel } from "@/lib/excelExport";

interface ResultsDisplayProps {
  result: OptimizationResultData;
  language?: 'en' | 'vi';
}

// Translations
const translations = {
  optimizationResults: {
    en: "Optimization Results",
    vi: "Kết quả tối ưu hóa"
  },
  summary: {
    en: "Summary of the steel cutting optimization results",
    vi: "Tóm tắt kết quả tối ưu hóa cắt thép"
  },
  optimizationComplete: {
    en: "Optimization complete! Efficiency:",
    vi: "Tối ưu hóa hoàn tất! Hiệu suất:"
  },
  totalMaterialUsed: {
    en: "Total Material Used",
    vi: "Tổng vật liệu sử dụng"
  },
  totalWaste: {
    en: "Total Waste",
    vi: "Tổng phế liệu"
  },
  efficiency: {
    en: "Efficiency",
    vi: "Hiệu suất"
  },
  exportToExcel: {
    en: "Export to Excel",
    vi: "Xuất ra Excel"
  },
  cuttingPatterns: {
    en: "Cutting Patterns",
    vi: "Mẫu cắt"
  },
  detailedView: {
    en: "Detailed view of the optimal cutting patterns",
    vi: "Xem chi tiết các mẫu cắt tối ưu"
  },
  pattern: {
    en: "Pattern",
    vi: "Mẫu"
  },
  cuttingLayout: {
    en: "Cutting Layout",
    vi: "Bố trí cắt"
  },
  waste: {
    en: "Waste",
    vi: "Phế liệu"
  },
  quantity: {
    en: "Quantity",
    vi: "Số lượng"
  }
};

export default function ResultsDisplay({ result, language = 'en' }: ResultsDisplayProps) {
  const { patterns, summary } = result;
  const { toast } = useToast();
  
  // Format functions
  const formatLength = (mm: number) => `${mm.toLocaleString()} mm`;
  const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`;

  const handleExport = () => {
    try {
      // We need to pass the original steel items data that may be stored elsewhere
      // For now, we'll create a placeholder with pattern lengths
      const items = patterns.flatMap(pattern => 
        pattern.cuttingLayout
          .filter(piece => piece.type !== 'waste')
          .map(piece => ({ length: piece.length, quantity: 1 }))
      );
      
      exportToExcel(items, result);
      toast({
        title: "Export successful",
        description: "Results have been exported to Excel.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="mt-8 space-y-6">
      <Card className="border-primary/20 overflow-hidden">
        <div className="bg-primary h-2"></div>
        <CardHeader>
          <CardTitle className="text-primary">{translations.optimizationResults[language]}</CardTitle>
          <p className="text-sm text-gray-500">
            {translations.summary[language]}
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p className="text-sm text-green-800 font-medium">
              {translations.optimizationComplete[language]} {formatPercentage(summary.efficiency)}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/10">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">{translations.totalMaterialUsed[language]}</p>
                <p className="text-xl font-bold text-primary">{formatLength(summary.totalMaterial)}</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">{translations.totalWaste[language]}</p>
                <p className="text-xl font-bold text-yellow-600">{formatLength(summary.totalWaste)}</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">{translations.efficiency[language]}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={summary.efficiency} className="flex-1 h-2" />
                  <span className="text-lg font-bold text-green-600">{formatPercentage(summary.efficiency)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 flex justify-end border-t">
          <Button
            variant="outline"
            onClick={handleExport}
            className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 border-yellow-600 hover:bg-yellow-50"
          >
            <FileDown className="h-4 w-4" /> {translations.exportToExcel[language]}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="border-primary/20">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-primary">{translations.cuttingPatterns[language]}</CardTitle>
          <p className="text-sm text-gray-500">
            {translations.detailedView[language]}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>{translations.pattern[language]}</TableHead>
                  <TableHead>{translations.cuttingLayout[language]}</TableHead>
                  <TableHead>{translations.waste[language]}</TableHead>
                  <TableHead>{translations.quantity[language]}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patterns.map((pattern, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      Pattern #{index + 1}
                      {pattern.quantity > 1 && (
                        <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                          ×{pattern.quantity}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center h-8 bg-gray-100 rounded-md overflow-hidden">
                        {pattern.cuttingLayout.map((piece, i) => {
                          // Calculate relative width based on length
                          const standardLength = 3000; // Assuming standard bar length
                          const width = Math.max((piece.length / standardLength) * 100, 5);
                          
                          // Determine color based on piece type
                          let bgColor = 'bg-primary';
                          if (piece.type === 'waste') {
                            bgColor = 'bg-yellow-400';
                          } else if (i % 2 === 1) {
                            bgColor = 'bg-primary/80';
                          }
                          
                          return (
                            <div 
                              key={i}
                              className={`h-full ${bgColor} relative border-r border-white`}
                              style={{ width: `${width}%` }}
                              title={`${piece.length}mm ${piece.type === 'waste' ? '(waste)' : ''}`}
                            >
                              {!piece.type && piece.length > 250 && (
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-medium">
                                  {piece.length}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-yellow-600">
                      {formatLength(pattern.waste.amount)} 
                      <span className="text-gray-500">
                        ({formatPercentage(pattern.waste.percentage)})
                      </span>
                    </TableCell>
                    <TableCell>{pattern.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
