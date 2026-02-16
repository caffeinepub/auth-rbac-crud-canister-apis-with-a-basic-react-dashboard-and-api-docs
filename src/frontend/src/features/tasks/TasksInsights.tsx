import { useMemo } from 'react';
import { useListTasks } from './taskHooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle, ListTodo, AlertCircle } from 'lucide-react';

export default function TasksInsights() {
  const { data: tasks, isLoading } = useListTasks();

  const insights = useMemo(() => {
    if (!tasks) {
      return { total: 0, completed: 0, active: 0, overdue: 0 };
    }

    const now = Date.now() * 1_000_000; // Convert to nanoseconds
    const completed = tasks.filter((task) => task.completed).length;
    const active = tasks.filter((task) => !task.completed).length;
    const overdue = tasks.filter((task) => {
      if (task.completed || !task.dueDate) return false;
      return Number(task.dueDate) < now;
    }).length;

    return {
      total: tasks.length,
      completed,
      active,
      overdue,
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{insights.total}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          <Circle className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-chart-2">{insights.active}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-chart-1">{insights.completed}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">{insights.overdue}</div>
        </CardContent>
      </Card>
    </div>
  );
}
