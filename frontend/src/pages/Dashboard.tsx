import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { 
  Bot, 
  DollarSign, 
  Users, 
  Calendar, 
  AlertCircle, 
  Send, 
  Loader2,
  ArrowRight
} from 'lucide-react';

interface MetricStats {
  revenue: number;
  leads: number;
  appointments: number;
  aiQueries: number;
}

interface WorkflowStep {
  name: string;
  status: string;
  assignedToAgent: string;
  outputResult?: any;
}

interface ActiveWorkflow {
  id: string;
  input: string;
  status: string;
  currentStep: number;
  steps: WorkflowStep[];
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricStats>({
    revenue: 12450,
    leads: 48,
    appointments: 32,
    aiQueries: 184,
  });

  const [prompt, setPrompt] = useState('');
  const [activeWorkflows, setActiveWorkflows] = useState<ActiveWorkflow[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const socket = getSocket();

  // Load Initial Notifications & Metrics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const notifRes = await api.get('/notifications');
        setNotifications(notifRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      }
    };
    fetchDashboardData();

    // Listen to real-time events from Socket.io
    if (socket) {
      socket.on('notification_received', (newNotif: any) => {
        setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]);
      });

      socket.on('workflow_updated', (wfUpdate: any) => {
        // Dynamically update active workflows list
        setActiveWorkflows((prev) => 
          prev.map((wf) => wf.id === wfUpdate.id ? { ...wf, ...wfUpdate } : wf)
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('notification_received');
        socket.off('workflow_updated');
      }
    };
  }, [socket]);

  // Submit Prompt to AI Agent Workflow Engine
  const handleWorkflowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setWorkflowLoading(true);
    try {
      const response = await api.post('/workflows/initiate', { triggerInput: prompt });
      const { workflowId, status } = response.data.data;

      // Add to local state tracker
      const newWf: ActiveWorkflow = {
        id: workflowId,
        input: prompt,
        status: status || 'initiated',
        currentStep: 0,
        steps: [],
      };
      
      setActiveWorkflows((prev) => [newWf, ...prev]);
      setPrompt('');

      // Polling fallback to check status if websocket connectivity is not fully deployed
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await api.get(`/workflows/${workflowId}`);
          const updatedWf = pollRes.data.data;
          
          setActiveWorkflows((prev) => 
            prev.map((w) => w.id === workflowId 
              ? { 
                  ...w, 
                  status: updatedWf.status, 
                  currentStep: updatedWf.currentStepIndex,
                  steps: updatedWf.steps || [] 
                } 
              : w
            )
          );

          if (updatedWf.status === 'completed' || updatedWf.status === 'failed') {
            clearInterval(pollInterval);
            // Refresh stats on success
            if (updatedWf.status === 'completed') {
              setMetrics((prev) => ({
                ...prev,
                appointments: prev.appointments + 1,
                aiQueries: prev.aiQueries + 3,
              }));
            }
          }
        } catch {
          clearInterval(pollInterval);
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to trigger workflow', err);
    } finally {
      setWorkflowLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Revenue', value: `$${metrics.revenue.toLocaleString()}`, change: '+18.2% vs last month', icon: DollarSign, color: 'text-emerald-400', glow: 'bg-emerald-500/10' },
    { title: 'Active Leads', value: metrics.leads, change: '12 new leads today', icon: Users, color: 'text-brand-400', glow: 'bg-brand-500/10' },
    { title: 'Appointments Scheduled', value: metrics.appointments, change: '4 remaining today', icon: Calendar, color: 'text-purple-400', glow: 'bg-purple-500/10' },
    { title: 'AI Automated Actions', value: metrics.aiQueries, change: '99.4% accuracy rating', icon: Bot, color: 'text-cyan-400', glow: 'bg-cyan-500/10' },
  ];

  return (
    <div className="flex-1 p-8 ml-64 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white font-sans tracking-tight">Command Center</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time business performance analytics and digital employee controls.</p>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-semibold border border-brand-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Core Gateway Connected
          </span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card rounded-2xl p-6 transition-all duration-200 hover:scale-[1.01]">
              <div className="flex justify-between items-start mb-4">
                <span className="text-slate-400 text-sm font-semibold">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.glow} ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{card.value}</h3>
              <p className="text-xs text-slate-500 font-medium">{card.change}</p>
            </div>
          );
        })}
      </div>

      {/* Main split row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Dynamic Copilot Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-500/10 text-brand-400 rounded-lg border border-brand-500/20">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Autonomous Agent Interface</h3>
                <p className="text-slate-500 text-xs">Direct your digital employee to execute complex multi-step workflows.</p>
              </div>
            </div>

            <form onSubmit={handleWorkflowSubmit} className="flex gap-3 mb-6">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Book a consulting appointment for Bob tomorrow morning' or 'Extract receipt details'"
                className="flex-1 px-4 py-3.5 rounded-xl glass-input text-sm"
              />
              <button
                type="submit"
                disabled={workflowLoading || !prompt.trim()}
                className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-sm transition-all duration-150 flex items-center gap-2 hover:scale-[1.02]"
              >
                {workflowLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Dispatch
              </button>
            </form>

            {/* Active agent processes */}
            <div className="flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Autonomous Workflow Stream</h4>
              
              {activeWorkflows.length === 0 ? (
                <div className="border border-dashed border-white/5 rounded-xl p-8 text-center text-slate-500 text-sm">
                  No active workflows executing. Prompt the Copilot to begin.
                </div>
              ) : (
                <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-2">
                  {activeWorkflows.map((wf) => (
                    <div key={wf.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-200 truncate max-w-[70%]">"{wf.input}"</span>
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                          wf.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          wf.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                        }`}>
                          {wf.status}
                        </span>
                      </div>

                      {/* Display individual tasks if populated */}
                      {wf.steps && wf.steps.length > 0 && (
                        <div className="flex flex-col gap-2 pl-4 border-l border-white/10 mt-2">
                          {wf.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <ArrowRight size={10} className="text-brand-400" />
                                {step.assignedToAgent} &rarr; <span className="font-semibold text-slate-300">{step.name}</span>
                              </span>
                              <span className={`font-semibold capitalize ${
                                step.status === 'completed' ? 'text-emerald-400' :
                                step.status === 'failed' ? 'text-red-400' : 'text-slate-500'
                              }`}>{step.status}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Feed Notifications */}
        <div className="flex flex-col gap-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle size={20} className="text-brand-400" />
                <h3 className="text-lg font-bold text-white font-sans">System Notification Alerts</h3>
              </div>

              <div className="flex flex-col gap-4">
                {notifications.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center py-12 border border-dashed border-white/5 rounded-xl">
                    No new notification alerts received.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif._id} className="p-3.5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-150 flex flex-col gap-1">
                      <span className="text-xs font-bold text-brand-400 tracking-wide uppercase">{notif.type}</span>
                      <h4 className="text-sm font-semibold text-slate-200">{notif.title}</h4>
                      <p className="text-xs text-slate-400">{notif.body}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="text-center border-t border-white/5 pt-4 mt-4">
              <span className="text-xs text-slate-500 font-semibold cursor-pointer hover:text-brand-400">
                View All Notification Logs
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
