'use client';

import type { MonthlyDonations } from '@/services/analytics/types';
import { TrendingUp } from 'lucide-react';
import { CartesianGrid, Line, LineChart, LineProps, Tooltip, XAxis } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

export const description = 'A linear line chart showing total per month';

const chartConfig = {
  total: { label: 'Total', color: 'var(--chart-1)' },
} satisfies ChartConfig;

type DonationLineChartProps = {
  data: MonthlyDonations[];
  year?: number;
};

export function DonationLineChart({ data, year }: DonationLineChartProps) {
  const currentYear = new Date().getFullYear();
  const displayYear = year || currentYear;

  const totalChartData = data.map((item) => ({
    ...item,
    total: item.membership + item.sadaqah + item.zakat + item.others,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donations - Total per Month</CardTitle>
        <CardDescription>January - December {displayYear}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <LineChart accessibilityLayer data={totalChartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <Tooltip
              cursor={{ stroke: 'transparent' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                const chartData = payload[0]?.payload;
                if (!chartData) return null;

                const tooltipPayload = [
                  { name: 'Sadaqah', value: chartData.sadaqah },
                  { name: 'Zakat', value: chartData.zakat },
                  { name: 'Membership', value: chartData.membership },
                  { name: 'Others', value: chartData.others },
                  { name: 'Total', value: chartData.total },
                ] as LineProps['data'][];

                return (
                  <ChartTooltipContent
                    active={active}
                    payload={tooltipPayload}
                    label={label}
                    hideIndicator
                  />
                );
              }}
            />
            <Line
              dataKey="total"
              type="linear"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Realtime donation per month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing donations from each category with totals
        </div>
      </CardFooter>
    </Card>
  );
}
