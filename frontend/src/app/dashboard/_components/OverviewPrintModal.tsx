'use client';

import { MONTH_OPTIONS } from '@/lib/constants';
import { printOverviewPDF } from '@/lib/pdf/generateOverviewPDF';
import { PrinterIcon } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { generateDummyMonthData } from './dummy-data';

type PrintModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yearOptions: number[];
  defaultYear: number;
  defaultMonth: number;
  onPrint?: (year: string, month: string) => void;
};

export function OverviewPrintModal({
  open,
  onOpenChange,
  yearOptions,
  defaultYear,
  defaultMonth,
  onPrint,
}: PrintModalProps) {
  const [printYear, setPrintYear] = useState<string>(defaultYear.toString());
  const [printMonth, setPrintMonth] = useState<string>(defaultMonth.toString());
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePrint = async () => {
    try {
      setIsGenerating(true);

      // Generate dummy data for the selected month and year
      const data = generateDummyMonthData(parseInt(printYear), parseInt(printMonth));

      // Call the optional onPrint callback
      onPrint?.(printYear, printMonth);

      // Generate and print the PDF document
      printOverviewPDF(printYear, printMonth, data);

      // Close selection modal
      onOpenChange(false);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error printing:', error);
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Report</DialogTitle>
            <DialogDescription>
              Select the year and month for the report you want to print.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-row gap-8">
            <div>
              <label htmlFor="print-year" className="text-sm font-medium block mb-3">
                Year
              </label>
              <Select value={printYear} onValueChange={setPrintYear}>
                <SelectTrigger id="print-year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="print-month" className="text-sm font-medium block mb-3">
                Month
              </label>
              <Select value={printMonth} onValueChange={setPrintMonth}>
                <SelectTrigger id="print-month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end flex-1 justify-end">
              <Button onClick={handlePrint} disabled={isGenerating}>
                <PrinterIcon className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Print'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

type PrintModalTriggerProps = {
  children?: React.ReactNode;
  className?: string;
};

export function PrintModalTrigger({ children, className }: PrintModalTriggerProps) {
  return (
    <DialogTrigger asChild>
      <Button variant="outline" className={className}>
        {children ?? (
          <>
            <PrinterIcon className="h-4 w-4" />
            Print
          </>
        )}
      </Button>
    </DialogTrigger>
  );
}
