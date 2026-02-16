import { useState, useMemo } from 'react';
import { useListTasks, useCreateTask, useUpdateTask, useDeleteTask } from './taskHooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, Circle, Calendar, Tag, ArrowUpDown, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Task } from '../../backend';
import { Priority } from '../../backend';

export default function TasksPanel() {
  const { data: allTasks, isLoading } = useListTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Filter and sort state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortByDueDate, setSortByDueDate] = useState<'none' | 'asc' | 'desc'>('none');

  const [newTask, setNewTask] = useState({
    id: '',
    title: '',
    description: '',
    priority: Priority.medium,
    dueDate: '',
    tags: '',
  });

  const [editTask, setEditTask] = useState({
    id: '',
    title: '',
    description: '',
    completed: false,
    priority: Priority.medium,
    dueDate: '',
    tags: '',
  });

  // Get all unique tags from tasks
  const allTags = useMemo(() => {
    if (!allTasks) return [];
    const tagSet = new Set<string>();
    allTasks.forEach((task) => {
      task.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allTasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!allTasks) return [];

    let filtered = allTasks;

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((task) => !task.completed);
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter((task) => task.completed);
    }

    // Tag filter
    if (tagFilter) {
      filtered = filtered.filter((task) => task.tags.includes(tagFilter));
    }

    // Sort by due date
    if (sortByDueDate !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        const aDate = a.dueDate ? Number(a.dueDate) : Infinity;
        const bDate = b.dueDate ? Number(b.dueDate) : Infinity;
        return sortByDueDate === 'asc' ? aDate - bDate : bDate - aDate;
      });
    }

    return filtered;
  }, [allTasks, statusFilter, tagFilter, sortByDueDate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.id.trim() || !newTask.title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const dueDate = newTask.dueDate ? BigInt(new Date(newTask.dueDate).getTime() * 1_000_000) : null;
      const tags = newTask.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createTask.mutateAsync({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate,
        tags,
      });
      toast.success('Task created successfully!');
      setIsCreateOpen(false);
      setNewTask({ id: '', title: '', description: '', priority: Priority.medium, dueDate: '', tags: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    const dueDateStr = task.dueDate ? new Date(Number(task.dueDate) / 1_000_000).toISOString().slice(0, 16) : '';
    setEditTask({
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      priority: task.priority,
      dueDate: dueDateStr,
      tags: task.tags.join(', '),
    });
    setIsEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editTask.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const dueDate = editTask.dueDate ? BigInt(new Date(editTask.dueDate).getTime() * 1_000_000) : null;
      const tags = editTask.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await updateTask.mutateAsync({
        id: editTask.id,
        title: editTask.title,
        description: editTask.description,
        completed: editTask.completed,
        priority: editTask.priority,
        dueDate,
        tags,
      });
      toast.success('Task updated successfully!');
      setIsEditOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await deleteTask.mutateAsync(taskId);
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: !task.completed,
        priority: task.priority,
        dueDate: task.dueDate || null,
        tags: task.tags,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update task');
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.high:
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case Priority.medium:
        return 'bg-chart-4/10 text-chart-4 border-chart-4/20';
      case Priority.low:
        return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDueDate = (dueDate?: bigint) => {
    if (!dueDate) return null;
    const date = new Date(Number(dueDate) / 1_000_000);
    const now = new Date();
    const isOverdue = date < now;
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { dateStr, isOverdue };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Tasks</CardTitle>
            <CardDescription>Manage your tasks and track progress</CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a new task to your list</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-id">Task ID *</Label>
                    <Input
                      id="task-id"
                      placeholder="unique-task-id"
                      value={newTask.id}
                      onChange={(e) => setNewTask({ ...newTask, id: e.target.value })}
                      disabled={createTask.isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as Priority })}
                      disabled={createTask.isPending}
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={Priority.low}>Low</SelectItem>
                        <SelectItem value={Priority.medium}>Medium</SelectItem>
                        <SelectItem value={Priority.high}>High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title *</Label>
                  <Input
                    id="task-title"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    disabled={createTask.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    disabled={createTask.isPending}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-due-date">Due Date</Label>
                  <Input
                    id="task-due-date"
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    disabled={createTask.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-tags">Tags (comma-separated)</Label>
                  <Input
                    id="task-tags"
                    placeholder="work, urgent, project-x"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    disabled={createTask.isPending}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createTask.isPending} className="flex-1">
                    {createTask.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Task'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createTask.isPending}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Status:</Label>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Tag:</Label>
              <Select value={tagFilter} onValueChange={setTagFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tags</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tagFilter && (
                <Button variant="ghost" size="sm" onClick={() => setTagFilter('')} className="h-8 w-8 p-0">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Sort:</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sortByDueDate === 'none') setSortByDueDate('asc');
                else if (sortByDueDate === 'asc') setSortByDueDate('desc');
                else setSortByDueDate('none');
              }}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              Due Date
              {sortByDueDate !== 'none' && <ArrowUpDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredTasks && filteredTasks.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24">Priority</TableHead>
                  <TableHead className="w-32">Due Date</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const dueDateInfo = formatDueDate(task.dueDate);
                  return (
                    <TableRow key={task.id}>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleComplete(task)}
                          disabled={updateTask.isPending}
                          className="h-8 w-8 p-0"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-chart-1" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className={`text-sm text-muted-foreground ${task.completed ? 'line-through' : ''}`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {dueDateInfo ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span
                              className={`text-sm ${
                                dueDateInfo.isOverdue && !task.completed ? 'text-destructive font-medium' : 'text-muted-foreground'
                              }`}
                            >
                              {dueDateInfo.dateStr}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.tags.length > 0 ? (
                            task.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(task)} className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                            disabled={deleteTask.isPending}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {allTasks && allTasks.length > 0
                ? 'No tasks match your filters. Try adjusting your search.'
                : 'No tasks yet. Create your first task to get started!'}
            </p>
          </div>
        )}

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>Update task details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select
                  value={editTask.priority}
                  onValueChange={(value) => setEditTask({ ...editTask, priority: value as Priority })}
                  disabled={updateTask.isPending}
                >
                  <SelectTrigger id="edit-task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Priority.low}>Low</SelectItem>
                    <SelectItem value={Priority.medium}>Medium</SelectItem>
                    <SelectItem value={Priority.high}>High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-title">Title *</Label>
                <Input
                  id="edit-task-title"
                  placeholder="Task title"
                  value={editTask.title}
                  onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                  disabled={updateTask.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-description">Description</Label>
                <Textarea
                  id="edit-task-description"
                  placeholder="Task description"
                  value={editTask.description}
                  onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                  disabled={updateTask.isPending}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-due-date">Due Date</Label>
                <Input
                  id="edit-task-due-date"
                  type="datetime-local"
                  value={editTask.dueDate}
                  onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
                  disabled={updateTask.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-task-tags"
                  placeholder="work, urgent, project-x"
                  value={editTask.tags}
                  onChange={(e) => setEditTask({ ...editTask, tags: e.target.value })}
                  disabled={updateTask.isPending}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-task-completed"
                  checked={editTask.completed}
                  onCheckedChange={(checked) => setEditTask({ ...editTask, completed: checked as boolean })}
                  disabled={updateTask.isPending}
                />
                <Label htmlFor="edit-task-completed" className="cursor-pointer">
                  Mark as completed
                </Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={updateTask.isPending} className="flex-1">
                  {updateTask.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Task'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={updateTask.isPending}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
