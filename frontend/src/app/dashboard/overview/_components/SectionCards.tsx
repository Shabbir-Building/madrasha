import type { Branch } from '@/domain/branches/enums';
import { getOverviewStats } from '@/services/analytics';
import { TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type SectionCardsProps = {
  accessToken?: string;
  branch?: Branch;
};

export async function SectionCards({ accessToken, branch }: SectionCardsProps) {
  const stats = await getOverviewStats({
    accessToken,
    ...(branch != null ? { query: { branch: String(branch) } } : {}),
  });

  if (!stats) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderPercentageBadge = () => {
    return (
      <Badge variant="outline">
        <TrendingUp />
        +0%
      </Badge>
    );
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ৳ {formatCurrency(stats.totalIncome)}
          </CardTitle>
          <CardAction>{renderPercentageBadge()}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total income for this year <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Realtime income calculation</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Donations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ৳ {formatCurrency(stats.totalDonations)}
          </CardTitle>
          <CardAction>{renderPercentageBadge()}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total donations for this year <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Realtime donations calculation</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Expense</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ৳ {formatCurrency(stats.totalExpense)}
          </CardTitle>
          <CardAction>{renderPercentageBadge()}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total expense for this year <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Realtime expense calculation</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ৳ {formatCurrency(stats.currentBalance)}
          </CardTitle>
          <CardAction>{renderPercentageBadge()}</CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Total balance for this year <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Realtime total balance calculation</div>
        </CardFooter>
      </Card>
    </div>
  );
}
