'use client';

import type { MonthlyIncomeExpense } from '@/services/analytics/types';
import { TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'A multiple bar chart';

const chartConfig = {
  income: {
    label: 'Income',
    color: 'var(--chart-2)',
  },
  expense: {
    label: 'Expense',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type IncomeExpenseChartBarProps = {
  data: MonthlyIncomeExpense[];
  year?: number;
};

export function IncomeExpenseChartBar({ data, year }: IncomeExpenseChartBarProps) {
  const currentYear = new Date().getFullYear();
  const displayYear = year || currentYear;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income & Expense - Comparison per Month</CardTitle>
        <CardDescription>January - December {displayYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="income" fill="var(--chart-2)" radius={4} />
            <Bar dataKey="expense" fill="var(--chart-1)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Realtime income and expense comparison <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Income and Expense comparison until this month
        </div>
      </CardFooter>
    </Card>
  );
}
