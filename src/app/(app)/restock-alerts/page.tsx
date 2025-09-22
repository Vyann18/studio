'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getRestockAlerts } from '@/lib/actions';
import type { RestockAlertsOutput } from '@/ai/flows/restock-alerts';
import { AlertCircle, Bell, Bot, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useUser } from '@/contexts/user-context';
import { useData } from '@/contexts/data-context';


export default function RestockAlertsPage() {
  const { currentUser } = useUser();
  const { inventory } = useData();
  const [alerts, setAlerts] = useState<RestockAlertsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAlerts = async () => {
    setLoading(true);
    setError(null);
    setAlerts(null);
    const result = await getRestockAlerts(inventory);
    if ('error' in result) {
      setError(result.error);
    } else {
      setAlerts(result);
    }
    setLoading(false);
  };

  const canGenerate = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Restock Alerts</h1>
          <p className="text-muted-foreground">
            Use AI to predict when you need to reorder items.
          </p>
        </div>
        { canGenerate && (
            <Button onClick={handleGenerateAlerts} disabled={loading}>
            {loading ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
                </>
            ) : (
                <>
                <Bot className="mr-2 h-4 w-4" />
                Generate Alerts
                </>
            )}
            </Button>
        )}
      </div>

      {error && (
        <Card className="border-destructive">
          <CardHeader className="flex flex-row items-center gap-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <div>
              <CardTitle className="text-destructive">Error</CardTitle>
              <CardDescription className="text-destructive/80">{error}</CardDescription>
            </div>
          </CardHeader>
        </Card>
      )}

      {loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 w-3/4 rounded-md bg-muted" />
                <div className="h-4 w-1/2 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-full rounded-md bg-muted" />
                <div className="mt-2 h-4 w-5/6 rounded-md bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {alerts && (
        <>
          {alerts.alerts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {alerts.alerts.map((alert, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-primary" />
                      {alert.itemName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                      <Calendar className="h-4 w-4"/>
                       Restock by: {format(new Date(alert.predictedRestockDate), 'PPP')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{alert.reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No restock alerts at the moment. All inventory levels are optimal.</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!alerts && !loading && !error && (
         <Card className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Generate Your First Alert</h3>
              <p className="text-muted-foreground mt-1">Click the "Generate Alerts" button to get started.</p>
            </div>
          </Card>
      )}
    </div>
  );
}
