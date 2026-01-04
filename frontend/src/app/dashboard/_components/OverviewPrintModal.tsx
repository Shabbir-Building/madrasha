'use client';

import { printOverviewPDF } from '@/lib/pdf/generateOverviewPDF';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PrinterIcon } from 'lucide-react';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { generateDummyRangeData } from './dummy-data';

type PrintModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yearOptions: number[];
  defaultYear: number;
  defaultMonth: number;
  onPrint?: (startDate: Date, endDate: Date) => void;
};

export function OverviewPrintModal({
  open,
  onOpenChange,
  defaultYear,
  defaultMonth,
  onPrint,
}: PrintModalProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(defaultYear, defaultMonth - 1, 1),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(defaultYear, defaultMonth, 0));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartPopoverOpen, setIsStartPopoverOpen] = useState(false);
  const [isEndPopoverOpen, setIsEndPopoverOpen] = useState(false);

  const handlePrint = async () => {
    if (!startDate || !endDate) return;

    try {
      setIsGenerating(true);

      // Generate dummy data for the selected date range
      const data = generateDummyRangeData(startDate, endDate);

      // Call the optional onPrint callback
      onPrint?.(startDate, endDate);

      // Generate and print the PDF document
      printOverviewPDF(startDate, endDate, data);

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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Print Report</DialogTitle>
            <DialogDescription>
              Select the start and end date for the report you want to print.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover open={isStartPopoverOpen} onOpenChange={setIsStartPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !startDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setIsStartPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover open={isEndPopoverOpen} onOpenChange={setIsEndPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !endDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setIsEndPopoverOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handlePrint} disabled={isGenerating || !startDate || !endDate}>
              <PrinterIcon className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Print'}
            </Button>
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
