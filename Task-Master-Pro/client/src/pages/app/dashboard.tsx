import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Plus, Check, Search, Calendar as CalendarIcon, Clock, BarChart3, AlertCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useListTasks, 
  useGetStatsSummary, 
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  getListTasksQueryKey,
  getGetStatsSummaryQueryKey,
  Task,
  TaskPriority,
  TaskStatus,
  TaskPriorityFilter,
  TaskStatusFilter
} from "@/api";

import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Map priorities to colors
const priorityColors = {
  low: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  medium: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  high: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: tasks = [] } = useListTasks({ search: search || undefined, status: statusFilter !== "all" ? statusFilter : undefined });
  const { data: stats } = useGetStatsSummary();

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    updateTask.mutate({ id: task.id, data: { status: newStatus } }, { onSuccess: invalidateAll });
  };

  const handleDelete = (id: number) => {
    deleteTask.mutate({ id }, { onSuccess: invalidateAll });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
        
        {/* Header & Stats */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
            <div>
              <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground mb-2">Your Dashboard</h1>
              <p className="text-muted-foreground text-sm">Clarity comes from focus. Here is where you stand today.</p>
            </div>
            <CreateTaskDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={invalidateAll} />
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total Tasks" value={stats.total} icon={<BarChart3 className="w-4 h-4 text-muted-foreground" />} />
              <StatCard title="Pending" value={stats.pending} icon={<Clock className="w-4 h-4 text-amber-500" />} />
              <StatCard title="Completed" value={stats.completed} icon={<Check className="w-4 h-4 text-green-500" />} />
              <StatCard title="Overdue" value={stats.overdue} icon={<AlertCircle className="w-4 h-4 text-destructive" />} />
            </div>
          )}
        </section>

        <div>
          {/* Main Task List */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatusFilter)} className="w-full sm:w-auto">
                <TabsList className="bg-card border border-border/50 shadow-sm p-1">
                  <TabsTrigger value="all" className="rounded-sm">All</TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-sm">Pending</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-sm">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tasks..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-10 bg-card border-border/60 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {tasks.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center py-16 border border-dashed border-border rounded-xl bg-card/50"
                  >
                    <p className="text-muted-foreground">No tasks found. A clear mind.</p>
                  </motion.div>
                ) : (
                  tasks.map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={task.id}
                    >
                      <Card className={`group border-border/60 shadow-sm hover:shadow-md transition-all duration-200 ${task.status === 'completed' ? 'opacity-60 bg-muted/30' : 'bg-card'}`}>
                        <CardContent className="p-4 flex items-start gap-4">
                          <button 
                            onClick={() => handleToggleStatus(task)}
                            className={`mt-1 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                              ${task.status === 'completed' ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary'}
                            `}
                          >
                            {task.status === 'completed' && <Check className="w-3 h-3 text-primary-foreground" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium text-foreground truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Badge variant="outline" className={`text-xs font-normal px-2 py-0 h-5 ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </Badge>
                              {task.dueDate && (
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <CalendarIcon className="w-3 h-3 mr-1" />
                                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-opacity"
                          >
                            Delete
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="border-border/60 shadow-sm bg-card">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-serif text-foreground">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center border border-border/50">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function CreateTaskDialog({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (o: boolean) => void, onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  
  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate({
      data: {
        title,
        description: description || null,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      }
    }, {
      onSuccess: () => {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate("");
        onOpenChange(false);
        onSuccess();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-5 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
          <Plus className="w-4 h-4 mr-1" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-medium">Create a new task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground/80">Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done?"
              className="bg-card"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc" className="text-foreground/80">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea 
              id="desc" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links, or notes..."
              className="resize-none h-20 bg-card"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground/80">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-foreground/80">Due Date <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Input 
                id="dueDate" 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-card"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={createTask.isPending || !title.trim()} className="w-full sm:w-auto font-medium shadow-sm">
              {createTask.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Save Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
