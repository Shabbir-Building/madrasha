'use client';

import { printIncomePDF } from '@/lib/pdf/generateIncomePDF';
import { cn } from '@/lib/utils';
import { getIncomeReport } from '@/services/analytics';
import { format } from 'date-fns';
import { CalendarIcon, PrinterIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type ExtendedSession = {
  accessToken?: string;
};

type IncomePrintModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultYear: number;
  defaultMonth: number;
  onPrint?: (startDate: Date, endDate: Date) => void;
};

export function IncomePrintModal({
  open,
  onOpenChange,
  defaultYear,
  defaultMonth,
  onPrint,
}: IncomePrintModalProps) {
  const { data: session } = useSession();
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

      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      const data = await getIncomeReport(startDateStr, endDateStr, {
        accessToken: (session as ExtendedSession | null)?.accessToken,
      });

      if (!data || data.length === 0) {
        toast.error('No data found for the selected range.');
        setIsGenerating(false);
        return;
      }

      onPrint?.(startDate, endDate);
      printIncomePDF(startDate, endDate, data);

      onOpenChange(false);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error printing:', error);
      toast.error('Failed to fetch report data. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Print Income Report</DialogTitle>
            <DialogDescription>
              Select the start and end date for the income report you want to print.
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

export function IncomePrintModalTrigger({
  children,
  className,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button variant="outline" className={className} onClick={onClick}>
      {children ?? (
        <>
          <PrinterIcon className="h-4 w-4" />
          Print
        </>
      )}
    </Button>
  );
}
