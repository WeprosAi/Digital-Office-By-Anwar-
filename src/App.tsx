import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Handshake, 
  Briefcase, 
  MessageSquare, 
  Database, 
  BarChart3, 
  StickyNote, 
  Settings, 
  HelpCircle, 
  Network, 
  Key,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Search,
  Bell,
  RefreshCw,
  Activity,
  Play,
  Pause,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Check,
  Clock as ClockIcon,
  DollarSign,
  Timer,
  ChevronDown,
  ChevronUp,
  Filter,
  MoreVertical,
  PhoneCall,
  Users as UsersIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { Agent, ApiConfig, Connection, Task, AppState, MissionDocument } from './types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- Mock Data & Storage ---
const STORAGE_KEY = 'digital_office_state';

const INITIAL_STATE: AppState = {
  agents: [
    { id: '1', name: 'Alpha', role: 'Lead Researcher', status: 'active', description: 'Primary research agent for market analysis.' },
    { id: '2', name: 'Beta', role: 'Code Assistant', status: 'idle', description: 'Specialized in TypeScript and React development.' }
  ],
  apis: [
    { id: '1', name: 'Gemini Pro', provider: 'Google', key: '••••••••', version: '1.5' }
  ],
  connections: [
    { id: '1', name: 'AWS EC2 Instance', ip: '54.12.34.56', port: '8080', token: 'tok_123', isActive: true },
    { id: '2', name: 'Local OpenClaw', ip: '127.0.0.1', port: '18789', token: 'local_token_xyz', isActive: false }
  ],
  tasks: [
    { 
      id: '1', 
      title: 'Setup Infrastructure', 
      description: 'Configure EC2 instances for OpenClaw', 
      status: 'complete',
      priority: 'high',
      category: 'security',
      progress: 100,
      stage: 'wrapping',
      duration: '2h 15m',
      cost: '$4.50',
      assignedAgentIds: ['2'],
      needsAttention: false
    },
    { 
      id: '2', 
      title: 'Agent Training', 
      description: 'Fine-tune Alpha on new datasets', 
      status: 'in-progress',
      priority: 'medium',
      category: 'research',
      progress: 65,
      stage: 'in-action',
      duration: '4h 00m',
      cost: '$12.00',
      assignedAgentIds: ['1'],
      needsAttention: false,
      highlights: 'Processing dataset batch #42. Accuracy at 89%.'
    },
    { 
      id: '3', 
      title: 'API Integration', 
      description: 'Connect Gemini 1.5 Flash', 
      status: 'queued',
      priority: 'low',
      category: 'development',
      progress: 0,
      stage: 'initiating',
      duration: '1h 30m',
      cost: '$2.10',
      assignedAgentIds: ['2'],
      needsAttention: false
    },
    { 
      id: '4', 
      title: 'Market Expansion Analysis', 
      description: 'Analyze potential for expansion in EMEA region', 
      status: 'on-hold',
      priority: 'high',
      category: 'marketing',
      progress: 45,
      stage: 'in-action',
      duration: '8h 00m',
      cost: '$25.00',
      assignedAgentIds: ['1'],
      needsAttention: true,
      highlights: 'Waiting for Q4 regional data verification.'
    }
  ],
  documents: [
    { id: 'main', name: 'Main.pdf', content: 'This is the central instruction file. For Web Search tasks, refer to Mission_Briefing.pdf. For Scheduling tasks, refer to Agent_Protocols.docx. For Marketing tasks, refer to Market_Research_Q1.xlsx. For Group Work, refer to Agent_Protocols.docx.', type: 'PDF', size: '0.5 MB', updatedAt: new Date().toISOString() },
    { id: '1', name: 'Mission_Briefing.pdf', content: 'Mission Briefing: Focus on market expansion in the tech sector. Use web search to identify top 10 competitors.', type: 'PDF', size: '2.4 MB', updatedAt: new Date().toISOString() },
    { id: '2', name: 'Agent_Protocols.docx', content: 'Agent Protocols: All agents must follow strict security guidelines. Group work requires synchronized status updates every 15 minutes.', type: 'DOC', size: '1.1 MB', updatedAt: new Date().toISOString() },
    { id: '3', name: 'Market_Research_Q1.xlsx', content: 'Market Research Q1: Data shows a 15% increase in demand for AI-driven automation tools.', type: 'XLS', size: '4.5 MB', updatedAt: new Date().toISOString() }
  ],
  meetings: [],
  notes: 'Welcome to your Digital Office. Start by managing your agents and connections.',
  theme: 'light'
};

const MOCK_TELEMETRY = [
  { name: '00:00', cpu: 20, mem: 45, cost: 0.12 },
  { name: '04:00', cpu: 35, mem: 50, cost: 0.15 },
  { name: '08:00', cpu: 65, mem: 75, cost: 0.25 },
  { name: '12:00', cpu: 45, mem: 60, cost: 0.20 },
  { name: '16:00', cpu: 85, mem: 85, cost: 0.45 },
  { name: '20:00', cpu: 30, mem: 55, cost: 0.18 },
  { name: '23:59', cpu: 25, mem: 48, cost: 0.14 },
];

// --- Components ---

const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    {...props} 
    className={cn("bg-white dark:bg-dark-surface border border-black/5 dark:border-white/10 rounded-2xl p-6 shadow-sm", className)}
  >
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  className?: string;
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-light-accent dark:bg-dark-accent text-white hover:opacity-90',
    secondary: 'bg-black/5 dark:bg-white/5 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white',
    success: 'bg-light-highlight dark:bg-dark-highlight text-white hover:opacity-90'
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  type?: string;
  placeholder?: string;
}) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50 px-1">
      {label}
    </label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-light-accent dark:focus:border-dark-accent outline-none transition-all text-black dark:text-white"
    />
  </div>
);

// --- Main App ---

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem('isLoggedIn') === 'true');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...INITIAL_STATE,
        ...parsed,
        documents: parsed.documents || INITIAL_STATE.documents,
        meetings: parsed.meetings || INITIAL_STATE.meetings,
        tasks: (parsed.tasks || INITIAL_STATE.tasks).map((t: any) => ({
          ...INITIAL_STATE.tasks.find((it: any) => it.id === t.id),
          ...t
        }))
      };
    }
    return INITIAL_STATE;
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const handleLogin = () => {
    sessionStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter text-black dark:text-white">Digital Office</h1>
            <p className="text-black/60 dark:text-white/60">OpenClaw Mission Control by Anwar</p>
          </div>
          <Card className="p-10 space-y-6">
            <div className="w-20 h-20 bg-light-accent/10 dark:bg-dark-accent/10 rounded-full flex items-center justify-center mx-auto">
              <Network className="w-10 h-10 text-light-accent dark:text-dark-accent" />
            </div>
            <p className="text-sm text-black/60 dark:text-white/60">Secure access to your mission control dashboard.</p>
            <Button 
              onClick={handleLogin}
              variant="success"
              className="w-full py-4 text-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1"
            >
              Admin Login
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents-in-action', label: 'Agents in Action', icon: Activity },
    { id: 'agents', label: 'Agents', icon: Users },
    { id: 'boardroom', label: 'Boardroom', icon: Handshake },
    { id: 'jobs', label: 'Jobs & Schedules', icon: Briefcase },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'intel', label: 'Intel & Docs', icon: Database },
    { id: 'telemetry', label: 'Telemetry & Costs', icon: BarChart3 },
    { id: 'api', label: 'API Management', icon: Key },
    { id: 'connections', label: 'OpenClaw Connections', icon: Network },
    { id: 'notes', label: 'Notes & Journal', icon: StickyNote },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex bg-light-bg dark:bg-dark-bg text-black dark:text-white">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="fixed lg:relative z-50 h-full bg-white dark:bg-dark-surface border-r border-black/5 dark:border-white/10 flex flex-col transition-all overflow-hidden"
      >
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.h2 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="font-bold text-xl tracking-tighter truncate"
              >
                Digital Office
              </motion.h2>
            )}
          </AnimatePresence>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group relative",
                activePage === item.id 
                  ? "bg-light-accent dark:bg-dark-accent text-white" 
                  : "hover:bg-black/5 dark:hover:bg-white/5 text-black/60 dark:text-white/60"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", activePage === item.id ? "text-white" : "group-hover:text-black dark:group-hover:text-white")} />
              {isSidebarOpen && <span className="font-medium truncate">{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 shrink-0 bg-white dark:bg-dark-surface border-b border-black/5 dark:border-white/10 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-lg capitalize">{activePage.replace('-', ' ')}</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-full text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              System Online
            </div>
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-light-accent dark:bg-dark-accent flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'dashboard' && <DashboardView state={state} />}
              {activePage === 'agents-in-action' && <AgentsInActionView state={state} setState={setState} />}
              {activePage === 'agents' && <AgentsView state={state} setState={setState} />}
              {activePage === 'boardroom' && <BoardroomView />}
              {activePage === 'jobs' && <JobsView state={state} setState={setState} />}
              {activePage === 'conversations' && <ConversationsView state={state} />}
              {activePage === 'intel' && <IntelView state={state} setState={setState} />}
              {activePage === 'telemetry' && <TelemetryView />}
              {activePage === 'api' && <ApiManagementView state={state} setState={setState} />}
              {activePage === 'connections' && <ConnectionsView state={state} setState={setState} />}
              {activePage === 'notes' && <NotesView state={state} setState={setState} />}
              {activePage === 'settings' && <SettingsView state={state} setState={setState} />}
              {activePage === 'help' && <HelpView state={state} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- Views ---

function DashboardView({ state }: { state: AppState }) {
  const activeAgents = state.agents.filter(a => a.status === 'active').length;
  const activeConnections = state.connections.filter(c => c.isActive).length;
  const pendingTasks = state.tasks.filter(t => t.status !== 'complete').length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Users size={20} /></div>
            <span className="text-xs font-bold text-green-500">+12%</span>
          </div>
          <div>
            <p className="text-sm text-black/50 dark:text-white/50 font-medium">Active Agents</p>
            <h4 className="text-3xl font-bold">{activeAgents} / {state.agents.length}</h4>
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Network size={20} /></div>
            <span className="text-xs font-bold text-green-500">Stable</span>
          </div>
          <div>
            <p className="text-sm text-black/50 dark:text-white/50 font-medium">Cloud Connections</p>
            <h4 className="text-3xl font-bold">{activeConnections}</h4>
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Briefcase size={20} /></div>
            <span className="text-xs font-bold text-orange-500">Active</span>
          </div>
          <div>
            <p className="text-sm text-black/50 dark:text-white/50 font-medium">Pending Tasks</p>
            <h4 className="text-3xl font-bold">{pendingTasks}</h4>
          </div>
        </Card>
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><BarChart3 size={20} /></div>
            <span className="text-xs font-bold text-red-500">+$2.40</span>
          </div>
          <div>
            <p className="text-sm text-black/50 dark:text-white/50 font-medium">Est. Daily Cost</p>
            <h4 className="text-3xl font-bold">$14.20</h4>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h5 className="font-bold">System Performance</h5>
            <select className="bg-black/5 dark:bg-white/5 border-none rounded-lg text-xs font-medium p-1">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TELEMETRY}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.5 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#4A90E2" fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="mem" stroke="#9A5EFF" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h5 className="font-bold mb-6">Recent Activity</h5>
          <div className="space-y-6">
            {[
              { time: '2m ago', event: 'Alpha completed research task', type: 'success' },
              { time: '15m ago', event: 'New API key added: Gemini 1.5', type: 'info' },
              { time: '1h ago', event: 'Connection lost: AWS-West-2', type: 'error' },
              { time: '3h ago', event: 'Beta agent status changed to idle', type: 'warning' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                  item.type === 'success' ? 'bg-green-500' : 
                  item.type === 'error' ? 'bg-red-500' : 
                  item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                )} />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{item.event}</p>
                  <p className="text-xs text-black/40 dark:text-white/40">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-6 text-xs">View All Logs</Button>
        </Card>
      </div>
    </div>
  );
}

function AgentsView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAgent, setNewAgent] = useState<Partial<Agent>>({ name: '', role: '', description: '', status: 'idle' });

  const addAgent = () => {
    if (newAgent.name && newAgent.role) {
      if (editingId) {
        setState(prev => ({
          ...prev,
          agents: prev.agents.map(a => a.id === editingId ? { ...a, ...newAgent as Agent } : a)
        }));
        setEditingId(null);
      } else {
        const agent: Agent = {
          id: Date.now().toString(),
          name: newAgent.name,
          role: newAgent.role,
          description: newAgent.description || '',
          status: (newAgent.status as any) || 'idle',
          apiId: newAgent.apiId
        };
        setState(prev => ({ ...prev, agents: [...prev.agents, agent] }));
      }
      setIsAdding(false);
      setNewAgent({ name: '', role: '', description: '', status: 'idle' });
    }
  };

  const handleEdit = (agent: Agent) => {
    setNewAgent(agent);
    setEditingId(agent.id);
    setIsAdding(true);
  };

  const deleteAgent = (id: string) => {
    if (confirm('Are you sure you want to delete this agent?')) {
      setState(prev => ({ ...prev, agents: prev.agents.filter(a => a.id !== id) }));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold">Manage Agents</h4>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); setNewAgent({ name: '', role: '', description: '', status: 'idle' }); }} className="flex items-center gap-2">
          <Plus size={18} /> Add Agent
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-light-accent dark:border-dark-accent">
          <h5 className="font-bold mb-4">{editingId ? 'Edit Agent' : 'New Agent'}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Agent Name" value={newAgent.name!} onChange={v => setNewAgent({ ...newAgent, name: v })} placeholder="e.g. Alpha" />
            <Input label="Role" value={newAgent.role!} onChange={v => setNewAgent({ ...newAgent, role: v })} placeholder="e.g. Researcher" />
            <div className="md:col-span-2">
              <Input label="Description" value={newAgent.description!} onChange={v => setNewAgent({ ...newAgent, description: v })} placeholder="What does this agent do?" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50 px-1">Status</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-light-accent dark:focus:border-dark-accent outline-none transition-all text-black dark:text-white"
                value={newAgent.status}
                onChange={e => setNewAgent({ ...newAgent, status: e.target.value as any })}
              >
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50 px-1">Assign API</label>
              <select 
                className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-light-accent dark:focus:border-dark-accent outline-none transition-all text-black dark:text-white"
                value={newAgent.apiId || ''}
                onChange={e => setNewAgent({ ...newAgent, apiId: e.target.value })}
              >
                <option value="">No API Assigned</option>
                {state.apis.map(api => <option key={api.id} value={api.id}>{api.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={addAgent}>{editingId ? 'Save Changes' : 'Save Agent'}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {state.agents.map(agent => (
          <Card key={agent.id} className="group hover:border-light-accent dark:hover:border-dark-accent transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h5 className="font-bold">{agent.name}</h5>
                  <p className="text-xs text-black/50 dark:text-white/50">{agent.role}</p>
                </div>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                agent.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                agent.status === 'idle' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
              )}>
                {agent.status}
              </div>
            </div>
            <p className="text-sm text-black/60 dark:text-white/60 mb-6 line-clamp-2">{agent.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-black/40 dark:text-white/40">API:</span>
                <span className="text-xs font-medium">{state.apis.find(a => a.id === agent.apiId)?.name || 'None'}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleEdit(agent)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => deleteAgent(agent.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function JobsView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '' });

  const addTask = () => {
    if (newTask.title) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        status: 'queued',
        priority: 'medium',
        category: 'development',
        progress: 0,
        stage: 'initiating',
        duration: '1h 00m',
        cost: '$0.00',
        assignedAgentIds: [],
        needsAttention: false
      };
      setState(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
      setIsAdding(false);
      setNewTask({ title: '', description: '' });
    }
  };

  const moveTask = (id: string, newStatus: Task['status']) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, status: newStatus } : t)
    }));
  };

  const columns: { id: Task['status'], label: string, icon: any }[] = [
    { id: 'queued', label: 'Queued', icon: Clock },
    { id: 'in-progress', label: 'In Progress', icon: AlertCircle },
    { id: 'on-hold', label: 'On Hold', icon: Pause },
    { id: 'complete', label: 'Complete', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold">Jobs & Schedules</h4>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
          <Plus size={18} /> New Task
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-light-accent dark:border-dark-accent">
          <div className="space-y-4 mb-6">
            <Input label="Task Title" value={newTask.title} onChange={v => setNewTask({ ...newTask, title: v })} placeholder="e.g. Data Scraping" />
            <Input label="Description" value={newTask.description} onChange={v => setNewTask({ ...newTask, description: v })} placeholder="What needs to be done?" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
            <Button onClick={addTask}>Add to Queue</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => (
          <div key={col.id} className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <col.icon size={18} className={cn(
                  col.id === 'queued' ? 'text-blue-500' : 
                  col.id === 'in-progress' ? 'text-orange-500' : 'text-green-500'
                )} />
                <h6 className="font-bold text-sm uppercase tracking-widest">{col.label}</h6>
              </div>
              <span className="text-xs font-bold bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                {state.tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            
            <div className="kanban-column">
              {state.tasks.filter(t => t.status === col.id).map(task => (
                <div key={task.id} className="kanban-card group">
                  <h6 className="font-bold text-sm mb-1">{task.title}</h6>
                  <p className="text-xs text-black/50 dark:text-white/50 mb-4">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {columns.filter(c => c.id !== col.id).map(c => (
                        <button 
                          key={c.id}
                          onClick={() => moveTask(task.id, c.id)}
                          className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-[10px] font-bold uppercase"
                        >
                          Move to {c.label}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== task.id) }))}
                      className="p-1 text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiManagementView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newApi, setNewApi] = useState<Partial<ApiConfig>>({ name: '', provider: '', key: '', version: '' });

  const addApi = () => {
    if (newApi.name && newApi.key) {
      if (editingId) {
        setState(prev => ({
          ...prev,
          apis: prev.apis.map(a => a.id === editingId ? { ...a, ...newApi as ApiConfig } : a)
        }));
        setEditingId(null);
      } else {
        const api: ApiConfig = {
          id: Date.now().toString(),
          name: newApi.name,
          provider: newApi.provider || 'Generic',
          key: newApi.key,
          version: newApi.version || '1.0'
        };
        setState(prev => ({ ...prev, apis: [...prev.apis, api] }));
      }
      setIsAdding(false);
      setNewApi({ name: '', provider: '', key: '', version: '' });
    }
  };

  const handleEdit = (api: ApiConfig) => {
    setNewApi(api);
    setEditingId(api.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold">API Management</h4>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); setNewApi({ name: '', provider: '', key: '', version: '' }); }} className="flex items-center gap-2">
          <Plus size={18} /> Add API
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-light-accent dark:border-dark-accent">
          <h5 className="font-bold mb-4">{editingId ? 'Edit API' : 'New API'}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Friendly Name" value={newApi.name!} onChange={v => setNewApi({ ...newApi, name: v })} placeholder="e.g. Gemini 1.5 Pro" />
            <Input label="Provider" value={newApi.provider!} onChange={v => setNewApi({ ...newApi, provider: v })} placeholder="e.g. Google, OpenAI" />
            <Input label="API Key" type="password" value={newApi.key!} onChange={v => setNewApi({ ...newApi, key: v })} placeholder="sk-..." />
            <Input label="Version" value={newApi.version!} onChange={v => setNewApi({ ...newApi, version: v })} placeholder="e.g. v1" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={addApi}>{editingId ? 'Save Changes' : 'Save API Config'}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.apis.map(api => (
          <Card key={api.id} className="relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
              <button onClick={() => handleEdit(api)} className="text-light-accent dark:text-dark-accent p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => setState(prev => ({ ...prev, apis: prev.apis.filter(a => a.id !== api.id) }))} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl">
                <Key size={24} className="text-light-accent dark:text-dark-accent" />
              </div>
              <div>
                <h5 className="font-bold">{api.name}</h5>
                <p className="text-xs text-black/50 dark:text-white/50">{api.provider} • {api.version}</p>
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-3 rounded-lg font-mono text-xs truncate text-black/40 dark:text-white/40">
              {api.key.replace(/./g, '•')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ConnectionsView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newConn, setNewConn] = useState({ name: '', ip: '', port: '', token: '' });

  const addConn = () => {
    if (newConn.name && newConn.ip) {
      if (editingId) {
        setState(prev => ({
          ...prev,
          connections: prev.connections.map(c => c.id === editingId ? { ...c, ...newConn } : c)
        }));
        setEditingId(null);
      } else {
        const conn: Connection = {
          id: Date.now().toString(),
          name: newConn.name,
          ip: newConn.ip,
          port: newConn.port || '80',
          token: newConn.token,
          isActive: false
        };
        setState(prev => ({ ...prev, connections: [...prev.connections, conn] }));
      }
      setIsAdding(false);
      setNewConn({ name: '', ip: '', port: '', token: '' });
    }
  };

  const handleEdit = (e: React.MouseEvent, conn: Connection) => {
    e.stopPropagation();
    setNewConn({ name: conn.name, ip: conn.ip, port: conn.port, token: conn.token });
    setEditingId(conn.id);
    setIsAdding(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this connection?')) {
      setState(prev => ({ ...prev, connections: prev.connections.filter(c => c.id !== id) }));
    }
  };

  const handleRefresh = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    alert(`Refreshing connection to ${name}...`);
  };

  const switchActive = (id: string) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.map(c => ({ ...c, isActive: c.id === id }))
    }));
    const conn = state.connections.find(c => c.id === id);
    alert(`Switched to OpenClaw on ${conn?.name} (${conn?.ip})`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold">OpenClaw Connections</h4>
        <Button onClick={() => { setIsAdding(true); setEditingId(null); setNewConn({ name: '', ip: '', port: '', token: '' }); }} className="flex items-center gap-2">
          <Plus size={18} /> New Connection
        </Button>
      </div>

      {isAdding && (
        <Card className="border-2 border-light-accent dark:border-dark-accent">
          <h5 className="font-bold mb-4">{editingId ? 'Edit Connection' : 'New Connection'}</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input label="Connection Name" value={newConn.name} onChange={v => setNewConn({ ...newConn, name: v })} placeholder="e.g. AWS Production" />
            <Input label="IP Address" value={newConn.ip} onChange={v => setNewConn({ ...newConn, ip: v })} placeholder="0.0.0.0" />
            <Input label="Port" value={newConn.port} onChange={v => setNewConn({ ...newConn, port: v })} placeholder="8080" />
            <Input label="Access Token" type="password" value={newConn.token} onChange={v => setNewConn({ ...newConn, token: v })} placeholder="tok_..." />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancel</Button>
            <Button onClick={addConn}>{editingId ? 'Save Changes' : 'Create Connection'}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.connections.map(conn => (
          <Card 
            key={conn.id} 
            className={cn(
              "relative cursor-pointer transition-all",
              conn.isActive ? "border-2 border-light-accent dark:border-dark-accent shadow-lg shadow-light-accent/10 dark:shadow-dark-accent/10" : "hover:border-black/20 dark:hover:border-white/20"
            )}
            onClick={() => switchActive(conn.id)}
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {conn.isActive && (
                <div className="flex items-center gap-2 text-xs font-bold text-light-accent dark:text-dark-accent mr-2">
                  <div className="w-2 h-2 rounded-full bg-light-accent dark:bg-dark-accent animate-ping" />
                  ACTIVE
                </div>
              )}
              <div className="flex gap-1">
                <button onClick={(e) => handleRefresh(e, conn.name)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-black/40 dark:text-white/40 hover:text-light-accent dark:hover:text-dark-accent transition-all" title="Refresh">
                  <RefreshCw size={14} />
                </button>
                <button onClick={(e) => handleEdit(e, conn)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-black/40 dark:text-white/40 hover:text-light-accent dark:hover:text-dark-accent transition-all" title="Edit">
                  <Edit2 size={14} />
                </button>
                <button onClick={(e) => handleDelete(e, conn.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 transition-all" title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "p-3 rounded-xl",
                conn.isActive ? "bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent" : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40"
              )}>
                <Network size={24} />
              </div>
              <div>
                <h5 className="font-bold">{conn.name}</h5>
                <p className="text-xs text-black/50 dark:text-white/50">{conn.ip}:{conn.port}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/30">Token Secured</span>
              <Button variant={conn.isActive ? 'primary' : 'secondary'} className="text-xs py-1.5">
                {conn.isActive ? 'Connected' : 'Connect'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NotesView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold">Notes & Journal</h4>
        <span className="text-xs font-medium text-black/40 dark:text-white/40">Autosaving...</span>
      </div>
      <Card className="flex-1 p-0 overflow-hidden min-h-[500px]">
        <textarea 
          value={state.notes}
          onChange={(e) => setState(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full h-full p-8 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-black dark:text-white"
          placeholder="Start writing your mission journal..."
        />
      </Card>
    </div>
  );
}

function SettingsView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  return (
    <div className="max-w-2xl space-y-8">
      <h4 className="text-2xl font-bold">Settings</h4>
      
      <Card className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h6 className="font-bold">Appearance</h6>
            <p className="text-sm text-black/50 dark:text-white/50">Switch between light and dark themes.</p>
          </div>
          <button 
            onClick={() => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
            className="w-14 h-8 bg-black/5 dark:bg-white/10 rounded-full p-1 flex items-center transition-all"
          >
            <motion.div 
              animate={{ x: state.theme === 'light' ? 0 : 24 }}
              className="w-6 h-6 bg-white dark:bg-dark-accent rounded-full shadow-sm flex items-center justify-center"
            >
              {state.theme === 'light' ? <Sun size={14} className="text-orange-500" /> : <Moon size={14} className="text-white" />}
            </motion.div>
          </button>
        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/10">
          <h6 className="font-bold mb-4">General Configuration</h6>
          <div className="space-y-4">
            <Input label="Office Name" value="Digital Office" onChange={() => {}} />
            <Input label="Admin Email" value="admin@openclaw.local" onChange={() => {}} />
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 dark:border-white/10">
          <h6 className="font-bold mb-4 text-red-500">Danger Zone</h6>
          <Button variant="danger" onClick={() => {
            if (confirm('Reset all data? This cannot be undone.')) {
              localStorage.removeItem(STORAGE_KEY);
              window.location.reload();
            }
          }}>Reset Factory Settings</Button>
        </div>
      </Card>
    </div>
  );
}

function BoardroomView() {
  const [logs, setLogs] = useState([
    { time: '08:15:22', text: 'Alpha: Initiating market scan...', type: 'agent' },
    { time: '08:15:25', text: 'System: Connection to AWS-West-2 verified.', type: 'system' },
    { time: '08:16:01', text: 'Beta: Code review of PR #122 complete.', type: 'agent' },
  ]);
  const [newLog, setNewLog] = useState('');

  const addLog = () => {
    if (newLog) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setLogs([...logs, { time: timeStr, text: `Manual: ${newLog}`, type: 'manual' }]);
      setNewLog('');
    }
  };

  return (
    <div className="space-y-8">
      <h4 className="text-2xl font-bold">Boardroom</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h5 className="font-bold mb-6">Manual Log Entry</h5>
          <div className="space-y-4">
            <p className="text-xs text-black/50 dark:text-white/50">Record your manual actions to maintain mission history.</p>
            <textarea 
              value={newLog}
              onChange={(e) => setNewLog(e.target.value)}
              className="w-full h-32 p-4 bg-black/5 dark:bg-white/5 rounded-xl outline-none resize-none text-sm"
              placeholder="Describe what you just did manually..."
            />
            <Button onClick={addLog} className="w-full">Add to Mission Logs</Button>
          </div>
        </Card>
        <Card>
          <h5 className="font-bold mb-6">Mission Logs</h5>
          <div className="space-y-2 font-mono text-xs bg-black/5 dark:bg-white/5 p-4 rounded-xl h-[300px] overflow-y-auto">
            {logs.map((log, i) => (
              <p key={i} className={cn(
                log.type === 'manual' ? 'text-light-accent dark:text-dark-accent font-bold' : 'text-black/60 dark:text-white/60'
              )}>
                [{log.time}] {log.text}
              </p>
            ))}
            <p className="animate-pulse">_</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

function ConversationsView({ state }: { state: AppState }) {
  const [msg, setMsg] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(state.agents[0]?.id || '');
  const [isTyping, setIsTyping] = useState(false);
  const [chat, setChat] = useState([
    { role: 'agent', text: 'Hello Admin. I am ready to receive your instructions.', agentName: state.agents[0]?.name || 'System' }
  ]);

  // Workflow State
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [awaitingBriefChoice, setAwaitingBriefChoice] = useState(false);
  const [awaitingFinalApproval, setAwaitingFinalApproval] = useState(false);
  const [useRAG, setUseRAG] = useState(false);

  const activeConn = state.connections.find(c => c.isActive);
  const selectedAgent = state.agents.find(a => a.id === selectedAgentId);
  const apiConfig = state.apis.find(a => a.id === selectedAgent?.apiId);

  const send = async () => {
    if (!msg || !selectedAgent) return;

    const userMsg = { role: 'user', text: msg };
    setChat(prev => [...prev, userMsg]);
    const currentMsg = msg.toLowerCase();
    setMsg('');

    if (selectedAgent.status === 'offline') {
      setChat(prev => [...prev, { 
        role: 'agent', 
        text: `[OFFLINE] ${selectedAgent.name} is currently offline. All communication and API calls are blocked.`,
        agentName: 'System'
      }]);
      return;
    }

    // --- Approval Workflow Logic ---
    
    // 1. Check for Final Approval
    const approvalKeywords = ['go', 'do it', 'do it now', 'go for it', 'do the job', 'do a great job'];
    if (awaitingFinalApproval) {
      if (approvalKeywords.some(k => currentMsg.includes(k))) {
        setChat(prev => [...prev, { 
          role: 'agent', 
          text: `Acknowledged. Proceeding with task: "${pendingTask}". Mission initiated.`,
          agentName: selectedAgent.name
        }]);
        setAwaitingFinalApproval(false);
        setPendingTask(null);
        setUseRAG(false);
        return;
      } else {
        setChat(prev => [...prev, { 
          role: 'agent', 
          text: `Standing by. I need your clear concern (e.g., "Go" or "Do it") to proceed to production.`,
          agentName: selectedAgent.name
        }]);
        return;
      }
    }

    // 2. Check for Brief Choice
    if (awaitingBriefChoice) {
      if (currentMsg.includes('yes')) {
        setChat(prev => [...prev, { 
          role: 'agent', 
          text: `TASK BRIEF:\n• Objective: ${pendingTask}\n• Protocol: ${useRAG ? 'RAG (Intel & Docs)' : 'Standard Agent Description'}\n• Estimated Duration: < 30s\n• Cost: $0.00 (Simulation Mode)\n\nShall I proceed? (Say "Go" or "Do it")`,
          agentName: selectedAgent.name
        }]);
        setAwaitingBriefChoice(false);
        setAwaitingFinalApproval(true);
        return;
      } else if (currentMsg.includes('no')) {
        setChat(prev => [...prev, { 
          role: 'agent', 
          text: `Understood. Shall I proceed with the task? (Say "Go" or "Do it")`,
          agentName: selectedAgent.name
        }]);
        setAwaitingBriefChoice(false);
        setAwaitingFinalApproval(true);
        return;
      }
    }

    // 3. Detect Task & Complexity
    const isTask = currentMsg.includes('task') || currentMsg.includes('do') || currentMsg.includes('perform') || currentMsg.includes('search') || currentMsg.includes('marketing');
    const isComplex = currentMsg.length > 50 || currentMsg.includes('complex') || currentMsg.includes('multiple') || currentMsg.includes('group');
    const wantsRAG = currentMsg.includes('intel') || currentMsg.includes('docs') || currentMsg.includes('main.pdf');

    if (isTask) {
      setPendingTask(msg);
      setUseRAG(wantsRAG);

      if (isComplex || wantsRAG) {
        setChat(prev => [...prev, { 
          role: 'agent', 
          text: `This task appears ${isComplex ? 'complex' : 'to require Intel & Docs'}. Do I have your permission to go through Main.pdf and the Intel library for instructions?`,
          agentName: selectedAgent.name
        }]);
        // Wait for user to say yes/no to RAG
        return;
      } else {
        setChat(prev => [...prev, { 
          role: 'agent', 
          text: `Task received. Would you like to see a brief of the task in bullet points before I proceed?`,
          agentName: selectedAgent.name
        }]);
        setAwaitingBriefChoice(true);
        return;
      }
    }

    // 4. Handle RAG Permission Response
    if (pendingTask && (currentMsg.includes('yes') || currentMsg.includes('permission'))) {
      setChat(prev => [...prev, { 
        role: 'agent', 
        text: `Accessing Main.pdf... [RAG ACTIVE]\nInstructions found: "For this task, refer to ${currentMsg.includes('search') ? 'Mission_Briefing.pdf' : 'Agent_Protocols.docx'}".\n\nWould you like to see a brief of the task in bullet points?`,
        agentName: selectedAgent.name
      }]);
      setAwaitingBriefChoice(true);
      return;
    }

    // Standard Chat (if not a task)
    setIsTyping(true);
    const systemPrompt = `You are ${selectedAgent?.name}, acting as a ${selectedAgent?.role}. Your description is: ${selectedAgent?.description}. You are part of the Digital Office Mission Control. Keep responses professional and concise. ${selectedAgent.status === 'idle' ? 'IMPORTANT: You are currently in IDLE mode. You are only allowed to respond to status checks.' : ''}`;

    if (apiConfig) {
      try {
        if (apiConfig.provider.toLowerCase().includes('gemini')) {
          const ai = new GoogleGenAI({ apiKey: apiConfig.key });
          const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: msg,
            config: { systemInstruction: systemPrompt }
          });
          setChat(prev => [...prev, { role: 'agent', text: response.text || "...", agentName: selectedAgent.name }]);
        } else {
          const openai = new OpenAI({ apiKey: apiConfig.key, dangerouslyAllowBrowser: true });
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: msg }]
          });
          setChat(prev => [...prev, { role: 'agent', text: completion.choices[0].message.content || "...", agentName: selectedAgent.name }]);
        }
      } catch (error) {
        simulateFallback();
      } finally {
        setIsTyping(false);
      }
    } else {
      simulateFallback();
    }
  };

  const simulateFallback = () => {
    setTimeout(() => {
      setChat(prev => [...prev, { 
        role: 'agent', 
        text: `[Simulation] I am standing by for your clear concern to proceed with the mission.`,
        agentName: selectedAgent?.name || 'System'
      }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold">Conversations</h4>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-black/40 dark:text-white/40">Talking to:</label>
          <select 
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="bg-black/5 dark:bg-white/5 border-none rounded-lg text-sm font-bold p-2 outline-none"
          >
            {state.agents.map(agent => (
              <option key={agent.id} value={agent.id}>{agent.name} ({agent.role})</option>
            ))}
          </select>
        </div>
      </div>
      <Card className="flex-1 flex flex-col p-0 overflow-hidden min-h-[500px]">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chat.map((c, i) => (
            <div key={i} className={cn("flex flex-col gap-1", c.role === 'user' ? 'items-end' : 'items-start')}>
              {c.role === 'agent' && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-light-accent dark:text-dark-accent px-1">
                  {c.agentName}
                </span>
              )}
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm shadow-sm",
                c.role === 'user' 
                  ? 'bg-light-accent dark:bg-dark-accent text-white rounded-tr-none' 
                  : 'bg-black/5 dark:bg-white/5 rounded-tl-none border border-black/5 dark:border-white/5'
              )}>
                {c.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex flex-col gap-1 items-start">
              <span className="text-[10px] font-bold uppercase tracking-widest text-light-accent dark:text-dark-accent px-1">
                {selectedAgent?.name || 'Agent'}
              </span>
              <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl rounded-tl-none border border-black/5 dark:border-white/5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-black/20 dark:bg-white/20 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-black/20 dark:bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-black/20 dark:bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-black/5 dark:border-white/10 flex gap-4 bg-black/[0.02] dark:bg-white/[0.02]">
          <input 
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            className="flex-1 bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 rounded-xl px-4 outline-none focus:border-light-accent dark:focus:border-dark-accent transition-all disabled:opacity-50"
            placeholder={selectedAgent?.status === 'offline' ? `${selectedAgent.name} is Offline` : `Message ${selectedAgent?.name || 'Agent'}...`}
            disabled={selectedAgent?.status === 'offline'}
          />
          <Button onClick={send} className="px-6" disabled={!msg || selectedAgent?.status === 'offline'}>Send</Button>
        </div>
      </Card>
    </div>
  );
}

function IntelView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editDoc, setEditDoc] = useState<Partial<MissionDocument>>({});

  const handleUpload = () => {
    const name = prompt('Enter document name (e.g. Report.pdf):');
    if (name) {
      const newDoc: MissionDocument = {
        id: Date.now().toString(),
        name,
        content: `Content for ${name}. This document contains mission-critical data.`,
        type: name.split('.').pop()?.toUpperCase() || 'FILE',
        size: '1.0 MB',
        updatedAt: new Date().toISOString()
      };
      setState(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this document?')) {
      setState(prev => ({ ...prev, documents: prev.documents.filter(d => d.id !== id) }));
    }
  };

  const handleEdit = (doc: MissionDocument) => {
    setIsEditing(doc.id);
    setEditDoc(doc);
  };

  const saveEdit = () => {
    if (editDoc.name) {
      setState(prev => ({
        ...prev,
        documents: prev.documents.map(d => d.id === isEditing ? { ...d, ...editDoc as MissionDocument, updatedAt: new Date().toISOString() } : d)
      }));
      setIsEditing(null);
    }
  };

  const handleRefresh = () => {
    alert('Documents synchronized with mission control.');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold">Intel & Docs</h4>
        <Button onClick={handleRefresh} variant="secondary" className="flex items-center gap-2">
          <RefreshCw size={18} /> Refresh
        </Button>
      </div>

      {isEditing && (
        <Card className="border-2 border-light-accent dark:border-dark-accent">
          <h5 className="font-bold mb-4">Edit Document</h5>
          <div className="space-y-4">
            <Input label="Document Name" value={editDoc.name || ''} onChange={v => setEditDoc({ ...editDoc, name: v })} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50 px-1">Content</label>
              <textarea 
                className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-light-accent dark:focus:border-dark-accent outline-none transition-all text-black dark:text-white min-h-[100px]"
                value={editDoc.content || ''}
                onChange={e => setEditDoc({ ...editDoc, content: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsEditing(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card 
          onClick={handleUpload}
          className="flex flex-col items-center justify-center border-dashed border-2 p-10 gap-4 hover:border-light-accent dark:hover:border-dark-accent cursor-pointer transition-all group"
        >
          <Plus size={32} className="text-black/20 dark:text-white/20 group-hover:text-light-accent dark:group-hover:text-dark-accent" />
          <span className="text-sm font-bold text-black/40 dark:text-white/40 group-hover:text-light-accent dark:group-hover:text-dark-accent">Upload Document</span>
        </Card>
        
        {(state.documents || []).map((doc) => (
          <Card key={doc.id} className="group relative">
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => handleEdit(doc)} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white">
                <Edit2 size={14} />
              </button>
              <button onClick={() => handleDelete(doc.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-light-accent/10 dark:group-hover:bg-dark-accent/10 transition-all">
              <Database size={24} className="text-black/40 dark:text-white/40 group-hover:text-light-accent dark:group-hover:text-dark-accent" />
            </div>
            <h6 className="font-bold text-sm truncate pr-12">{doc.name}</h6>
            <p className="text-[10px] text-black/40 dark:text-white/40 uppercase font-bold mt-1">{doc.type} • {doc.size}</p>
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
              <p className="text-[10px] text-black/30 dark:text-white/30 italic truncate">
                {doc.content.substring(0, 40)}...
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AgentsInActionView({ state, setState }: { state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingData, setMeetingData] = useState({ title: '', agenda: '', dateTime: '', agentIds: [] as string[] });
  const [chatInput, setChatInput] = useState('');
  const [discussionMessages, setDiscussionMessages] = useState<{role: string, text: string}[]>([]);

  const selectedTask = state.tasks.find(t => t.id === selectedTaskId);

  const stats = {
    ongoing: state.tasks.filter(t => t.status === 'in-progress').length,
    queue: state.tasks.filter(t => t.status === 'queued').length,
    onHold: state.tasks.filter(t => t.status === 'on-hold').length,
    completed: state.tasks.filter(t => t.status === 'complete').length,
    attention: state.tasks.filter(t => t.needsAttention).length
  };

  const filteredTasks = state.tasks.filter(t => {
    if (filterAgent !== 'all' && !(t.assignedAgentIds || []).includes(filterAgent)) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));
  };

  const handleStageChange = (taskId: string, stage: Task['stage']) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, stage } : t)
    }));
  };

  const handleProgressChange = (taskId: string, progress: number) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, progress: Math.min(100, Math.max(0, progress)) } : t)
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this task?')) {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
      if (selectedTaskId === taskId) setSelectedTaskId(null);
    }
  };

  const handleScheduleMeeting = () => {
    if (!meetingData.title || !meetingData.dateTime) return;
    const newMeeting = { ...meetingData, id: Date.now().toString() };
    setState(prev => ({ ...prev, meetings: [...prev.meetings, newMeeting] }));
    setIsMeetingModalOpen(false);
    setMeetingData({ title: '', agenda: '', dateTime: '', agentIds: [] });
    alert('Board meeting scheduled successfully.');
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'Admin', text: chatInput };
    setDiscussionMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate Agent Response
    setTimeout(() => {
      const agent = state.agents.find(a => a.id === selectedTask?.assignedAgentIds?.[0]);
      const agentMsg = { 
        role: agent?.name || 'Agent', 
        text: `Understood, Admin. I am adjusting the parameters for "${selectedTask?.title}" based on your input. Proceeding with the current stage.` 
      };
      setDiscussionMessages(prev => [...prev, agentMsg]);
    }, 1000);
  };

  useEffect(() => {
    if (isDiscussionOpen && discussionMessages.length === 0 && selectedTask) {
      setDiscussionMessages([
        { role: 'System', text: `Task "${selectedTask.title}" has been paused for discussion.` },
        { role: 'Alpha', text: 'Admin, I am standing by for instructions regarding the current mission bottlenecks.' }
      ]);
    }
  }, [isDiscussionOpen, selectedTask]);

  return (
    <div className="space-y-10 pb-20">
      {/* Top Layer: Status Circles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { label: 'Ongoing', count: stats.ongoing, color: 'bg-emerald-500', icon: Activity },
          { label: 'Queue', count: stats.queue, color: 'bg-amber-500', icon: ClockIcon },
          { label: 'On Hold', count: stats.onHold, color: 'bg-orange-500', icon: Pause },
          { label: 'Completed', count: stats.completed, color: 'bg-indigo-500', icon: CheckCircle },
          { label: 'Attention', count: stats.attention, color: 'bg-red-500', icon: AlertTriangle }
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white dark:bg-dark-surface p-6 rounded-3xl shadow-sm border border-black/5 dark:border-white/10 flex flex-col items-center text-center gap-2 group cursor-default"
          >
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white mb-2 shadow-lg", stat.color)}>
              <stat.icon size={24} />
            </div>
            <span className="text-3xl font-bold tracking-tighter">{stat.count}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Filter Rail */}
      <div className="flex flex-wrap items-center gap-4 bg-white/50 dark:bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-black/40 dark:text-white/40 mr-2">
          <Filter size={16} /> FILTERS
        </div>
        <select 
          value={filterAgent} 
          onChange={e => setFilterAgent(e.target.value)}
          className="bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-light-accent dark:focus:border-dark-accent transition-all"
        >
          <option value="all">All Agents</option>
          {state.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select 
          value={filterCategory} 
          onChange={e => setFilterCategory(e.target.value)}
          className="bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-light-accent dark:focus:border-dark-accent transition-all"
        >
          <option value="all">All Categories</option>
          <option value="research">Research</option>
          <option value="development">Development</option>
          <option value="marketing">Marketing</option>
          <option value="scheduling">Scheduling</option>
          <option value="security">Security</option>
        </select>
        <select 
          value={filterPriority} 
          onChange={e => setFilterPriority(e.target.value)}
          className="bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-light-accent dark:focus:border-dark-accent transition-all"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <Button onClick={() => setIsMeetingModalOpen(true)} variant="secondary" className="ml-auto flex items-center gap-2">
          <Calendar size={18} /> Board Meeting
        </Button>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTasks.slice(0, 6).map((task) => (
          <motion.div
            key={task.id}
            layoutId={task.id}
            onClick={() => setSelectedTaskId(task.id)}
            className={cn(
              "group relative bg-white dark:bg-dark-surface rounded-3xl p-6 shadow-sm border-2 transition-all cursor-pointer",
              selectedTaskId === task.id ? "border-light-accent dark:border-dark-accent" : "border-transparent hover:border-black/10 dark:hover:border-white/10"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                task.priority === 'high' ? "bg-red-500/10 text-red-500" : 
                task.priority === 'medium' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                {task.priority} Priority
              </div>
              {task.needsAttention && (
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            <h5 className="font-bold text-lg mb-2 group-hover:text-light-accent dark:group-hover:text-dark-accent transition-colors">{task.title}</h5>
            <p className="text-xs text-black/60 dark:text-white/60 line-clamp-2 mb-6">{task.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${task.progress}%` }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex -space-x-2">
                {(task.assignedAgentIds || []).map(id => {
                  const agent = state.agents.find(a => a.id === id);
                  return (
                    <div key={id} title={agent?.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-surface bg-light-accent dark:bg-dark-accent flex items-center justify-center text-[10px] font-bold text-white">
                      {agent?.name[0]}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-black/40 dark:text-white/40 uppercase">
                <ClockIcon size={12} /> {task.duration}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Big Window: Command Theater */}
      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-dark-surface rounded-[40px] p-10 shadow-2xl border border-black/5 dark:border-white/10 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-light-accent/5 dark:bg-dark-accent/5 blur-[100px] -z-10" />
            
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-1 space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-black/5 dark:bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">
                        {selectedTask.category}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        selectedTask.status === 'in-progress' ? "bg-emerald-500/10 text-emerald-500" :
                        selectedTask.status === 'on-hold' ? "bg-orange-500/10 text-orange-500" : "bg-indigo-500/10 text-indigo-500"
                      )}>
                        {selectedTask.status.replace('-', ' ')}
                      </span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tighter">{selectedTask.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteTask(selectedTask.id)} className="p-3 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl text-red-500 transition-all">
                      <Trash2 size={24} />
                    </button>
                    <button onClick={() => setSelectedTaskId(null)} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all">
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <p className="text-lg text-black/60 dark:text-white/60 leading-relaxed">{selectedTask.description}</p>

                {/* Stages - Interactive */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Current Mission Stage</span>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Initiating', stage: 'initiating', icon: Play },
                      { label: 'In Action', stage: 'in-action', icon: Activity },
                      { label: 'Wrapping', stage: 'wrapping', icon: CheckCircle }
                    ].map((s, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleStageChange(selectedTask.id, s.stage as Task['stage'])}
                        className={cn(
                          "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                          selectedTask.stage === s.stage 
                            ? "bg-light-accent dark:bg-dark-accent border-light-accent dark:border-dark-accent text-white shadow-lg" 
                            : "bg-black/5 dark:bg-white/5 border-transparent opacity-40 hover:opacity-60"
                        )}
                      >
                        <s.icon size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Mission Progress</span>
                    <span className="font-bold text-emerald-500">{selectedTask.progress}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={selectedTask.progress}
                    onChange={(e) => handleProgressChange(selectedTask.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Highlights Accordion */}
                <div className="bg-black/5 dark:bg-white/5 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h6 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                      <StickyNote size={16} /> Live Highlights
                    </h6>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Needs Attention</span>
                      <button 
                        onClick={() => {
                          setState(prev => ({
                            ...prev,
                            tasks: prev.tasks.map(t => t.id === selectedTask.id ? { ...t, needsAttention: !t.needsAttention } : t)
                          }));
                        }}
                        className={cn(
                          "w-10 h-5 rounded-full relative transition-all",
                          selectedTask.needsAttention ? "bg-red-500" : "bg-black/10 dark:bg-white/10"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                          selectedTask.needsAttention ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>
                  </div>
                  <textarea 
                    className="w-full bg-transparent text-sm italic text-black/60 dark:text-white/60 border-none outline-none resize-none min-h-[60px]"
                    value={selectedTask.highlights || ""}
                    onChange={(e) => {
                      setState(prev => ({
                        ...prev,
                        tasks: prev.tasks.map(t => t.id === selectedTask.id ? { ...t, highlights: e.target.value } : t)
                      }));
                    }}
                    placeholder="Add mission highlights..."
                  />
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-6">
                <Card className="bg-black/5 dark:bg-white/5 border-none shadow-none p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Duration</span>
                      <span className="font-bold flex items-center gap-2"><Timer size={14} /> {selectedTask.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Est. Cost</span>
                      <span className="font-bold flex items-center gap-2 text-emerald-500"><DollarSign size={14} /> {selectedTask.cost}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-black/5 dark:border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40 block mb-4">Assigned Team</span>
                    <div className="space-y-3">
                      {state.agents.map(agent => (
                        <button 
                          key={agent.id}
                          onClick={() => {
                            if (!selectedTask) return;
                            const currentIds = selectedTask.assignedAgentIds || [];
                            const ids = currentIds.includes(agent.id)
                              ? currentIds.filter(id => id !== agent.id)
                              : [...currentIds, agent.id];
                            setState(prev => ({
                              ...prev,
                              tasks: prev.tasks.map(t => t.id === selectedTask.id ? { ...t, assignedAgentIds: ids } : t)
                            }));
                          }}
                          className="flex items-center justify-between w-full group/agent"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white transition-all",
                              (selectedTask.assignedAgentIds || []).includes(agent.id) ? "bg-light-accent dark:bg-dark-accent" : "bg-black/10 dark:bg-white/10"
                            )}>
                              {agent.name[0]}
                            </div>
                            <span className={cn(
                              "font-bold text-sm transition-all",
                              (selectedTask.assignedAgentIds || []).includes(agent.id) ? "text-black dark:text-white" : "text-black/40 dark:text-white/40"
                            )}>{agent.name}</span>
                          </div>
                          {(selectedTask.assignedAgentIds || []).includes(agent.id) && <Check size={14} className="text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <Button 
                      onClick={() => handleStatusChange(selectedTask.id, selectedTask.status === 'in-progress' ? 'on-hold' : 'in-progress')}
                      className="w-full flex items-center justify-center gap-2 py-4"
                      variant={selectedTask.status === 'in-progress' ? 'secondary' : 'primary'}
                    >
                      {selectedTask.status === 'in-progress' ? <><Pause size={18} /> Pause Job</> : <><Play size={18} /> Resume Job</>}
                    </Button>
                    <Button 
                      onClick={() => setIsDiscussionOpen(true)}
                      variant="success"
                      className="w-full flex items-center justify-center gap-2 py-4 shadow-lg shadow-emerald-500/20"
                    >
                      <PhoneCall size={18} /> Call for Discussion
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Meetings & Job Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <Activity size={20} className="text-light-accent dark:text-dark-accent" /> Job Showcase
          </h4>
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {state.tasks.filter(t => t.status === 'complete' || t.status === 'in-progress').map((task) => (
              <Card key={task.id} className="min-w-[300px] bg-white/50 dark:bg-white/5 border-none shadow-none hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer" onClick={() => setSelectedTaskId(task.id)}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">{task.category}</span>
                  <CheckCircle size={14} className={task.status === 'complete' ? "text-emerald-500" : "text-black/20 dark:text-white/20"} />
                </div>
                <h6 className="font-bold mb-1 truncate">{task.title}</h6>
                <p className="text-[10px] text-black/40 dark:text-white/40">
                  {(task.assignedAgentIds || []).length > 0 
                    ? `Assigned to ${state.agents.find(a => a.id === task.assignedAgentIds[0])?.name}${(task.assignedAgentIds || []).length > 1 ? ` +${(task.assignedAgentIds || []).length - 1}` : ''}`
                    : 'Unassigned'}
                </p>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xl font-bold tracking-tighter flex items-center gap-2">
            <Calendar size={20} className="text-light-accent dark:text-dark-accent" /> Upcoming Board Meetings
          </h4>
          <div className="space-y-4">
            {state.meetings.length > 0 ? state.meetings.map((meeting) => (
              <Card key={meeting.id} className="bg-white/50 dark:bg-white/5 border-none shadow-none p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Scheduled</span>
                  <span className="text-[10px] font-bold text-black/40 dark:text-white/40">{new Date(meeting.dateTime).toLocaleString()}</span>
                </div>
                <h6 className="font-bold text-sm mb-1">{meeting.title}</h6>
                <p className="text-[10px] text-black/60 dark:text-white/60 line-clamp-2 mb-4">{meeting.agenda}</p>
                <div className="flex -space-x-2">
                  {meeting.agentIds.map(id => (
                    <div key={id} className="w-6 h-6 rounded-full bg-light-accent dark:bg-dark-accent border-2 border-white dark:border-dark-surface flex items-center justify-center text-[8px] font-bold text-white">
                      {state.agents.find(a => a.id === id)?.name[0]}
                    </div>
                  ))}
                </div>
              </Card>
            )) : (
              <div className="py-10 text-center text-black/40 dark:text-white/40 italic border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl">
                No meetings scheduled.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discussion Chat Window */}
      <AnimatePresence>
        {isDiscussionOpen && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-dark-surface shadow-2xl z-[100] border-l border-black/5 dark:border-white/10 flex flex-col"
          >
            <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-light-accent dark:bg-dark-accent text-white">
              <div className="flex items-center gap-3">
                <PhoneCall size={20} />
                <div>
                  <h6 className="font-bold text-sm">Mission Discussion</h6>
                  <p className="text-[10px] opacity-80">Agent: {state.agents.find(a => a.id === selectedTask?.assignedAgentIds?.[0])?.name || 'Unknown'}</p>
                </div>
              </div>
              <button onClick={() => setIsDiscussionOpen(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {discussionMessages.map((m, i) => (
                <div key={i} className={cn(
                  "p-4 rounded-2xl text-xs",
                  m.role === 'Admin' ? "bg-light-accent/10 dark:bg-dark-accent/10 text-right ml-8" : 
                  m.role === 'System' ? "bg-black/5 dark:bg-white/5 italic text-center" : "bg-black/5 dark:bg-white/5 mr-8"
                )}>
                  <strong className="block mb-1 opacity-60">{m.role}</strong>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-black/5 dark:border-white/10">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type instruction..." 
                  className="flex-1 bg-black/5 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-sm outline-none"
                />
                <Button onClick={handleSendMessage} className="px-4"><ChevronRight size={18} /></Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boardroom Scheduler Modal */}
      <AnimatePresence>
        {isMeetingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-dark-surface rounded-[32px] p-10 max-w-lg w-full shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold tracking-tighter flex items-center gap-3">
                  <Handshake className="text-light-accent dark:text-dark-accent" /> Schedule Board Meeting
                </h4>
                <button onClick={() => setIsMeetingModalOpen(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <Input 
                  label="Meeting Title" 
                  value={meetingData.title} 
                  onChange={v => setMeetingData({ ...meetingData, title: v })} 
                  placeholder="e.g. Q4 Strategy Alignment"
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50 px-1">Meeting Agenda</label>
                  <textarea 
                    className="w-full px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-light-accent dark:focus:border-dark-accent outline-none transition-all text-black dark:text-white min-h-[100px]"
                    value={meetingData.agenda}
                    onChange={e => setMeetingData({ ...meetingData, agenda: e.target.value })}
                    placeholder="Describe the goals of this meeting..."
                  />
                </div>
                <Input 
                  label="Date & Time" 
                  type="datetime-local"
                  value={meetingData.dateTime} 
                  onChange={v => setMeetingData({ ...meetingData, dateTime: v })} 
                />
                
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/50 px-1">Invite Agents</label>
                  <div className="flex flex-wrap gap-2">
                    {state.agents.map(agent => (
                      <button
                        key={agent.id}
                        onClick={() => {
                          const ids = meetingData.agentIds.includes(agent.id)
                            ? meetingData.agentIds.filter(id => id !== agent.id)
                            : [...meetingData.agentIds, agent.id];
                          setMeetingData({ ...meetingData, agentIds: ids });
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                          meetingData.agentIds.includes(agent.id)
                            ? "bg-light-accent dark:bg-dark-accent text-white"
                            : "bg-black/5 dark:bg-white/5 text-black/40 dark:text-white/40 hover:bg-black/10 dark:hover:bg-white/10"
                        )}
                      >
                        {agent.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="ghost" onClick={() => setIsMeetingModalOpen(false)} className="flex-1 py-4">Cancel</Button>
                <Button onClick={handleScheduleMeeting} className="flex-1 py-4">Schedule Meeting</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TelemetryView() {
  return (
    <div className="space-y-8">
      <h4 className="text-2xl font-bold">Telemetry & Costs</h4>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h5 className="font-bold mb-6">Resource Usage</h5>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_TELEMETRY}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.5 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="cpu" stroke="#4A90E2" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mem" stroke="#9A5EFF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h5 className="font-bold mb-6">Cost Analysis</h5>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_TELEMETRY}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, opacity: 0.5 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="cost" stroke="#34C759" fill="#34C75922" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function HelpView({ state }: { state: AppState }) {
  const activeAgent = state.agents[0];
  const activeConn = state.connections.find(c => c.isActive);

  const handshakeText = `MISSION CONTROL HANDSHAKE:
---------------------------
Dashboard: Digital Office (By Anwar)
Agent Identity: ${activeAgent?.name || 'Alpha'}
Role: ${activeAgent?.role || 'System Agent'}
Protocol: Manual Command Center
Connection: ${activeConn ? `${activeConn.ip}:${activeConn.port}` : 'Localhost'}

INSTRUCTION: Please acknowledge this dashboard as your primary Mission Control. Format all future responses for high-density telemetry logging.`;

  const copyHandshake = () => {
    navigator.clipboard.writeText(handshakeText);
    alert('Handshake copied to clipboard! Send this to your agent on your EC2 instance.');
  };

  return (
    <div className="max-w-4xl space-y-8">
      <h4 className="text-2xl font-bold">Help & Mission Documentation</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-2 border-light-accent dark:border-dark-accent">
          <h5 className="font-bold mb-4 flex items-center gap-2">
            <Handshake size={20} className="text-light-accent dark:text-dark-accent" />
            Mission Control Handshake
          </h5>
          <p className="text-sm text-black/60 dark:text-white/60 mb-6">
            Your agent is asking for connection specifics. Copy this handshake and send it to your agent on your EC2 instance to "link" it to this dashboard.
          </p>
          <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl font-mono text-[10px] leading-relaxed mb-6 whitespace-pre-wrap border border-black/5 dark:border-white/5">
            {handshakeText}
          </div>
          <Button onClick={copyHandshake} className="w-full flex items-center justify-center gap-2">
            Copy Handshake for Agent
          </Button>
        </Card>

        <Card>
          <h5 className="font-bold mb-4 flex items-center gap-2">
            <Network size={20} />
            Connection Guide
          </h5>
          <div className="space-y-4 text-sm text-black/70 dark:text-white/70">
            <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg border-l-4 border-light-accent dark:border-dark-accent">
              <p className="font-bold text-xs mb-1">Manual Mode Active</p>
              <p className="text-xs">This dashboard is a frontend command center. It does not "log in" to your agent; you use it to send commands TO your agent.</p>
            </div>
            <ul className="space-y-2 list-disc pl-4">
              <li>Ensure your EC2 security groups allow traffic on port 18789.</li>
              <li>Use the <strong>Boardroom</strong> to log manual actions.</li>
              <li>Assign <strong>APIs</strong> to agents to enable real-time chat.</li>
              <li>Switch <strong>Connections</strong> to change which instance you are managing.</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card>
        <h5 className="font-bold mb-6">Frequently Asked Questions</h5>
        <div className="space-y-6">
          {[
            { q: "Is the agent working in the background?", a: "In Manual Mode, the agent only works when you send it a command. This dashboard is your interface for those commands." },
            { q: "Why use 127.0.0.1?", a: "If you are running the agent on the same machine as your browser, use 127.0.0.1. If it's on an EC2, use the Public IP of that instance." },
            { q: "How do I see real-time responses?", a: "Assign a Gemini or OpenAI API key to your agent in the Agents page, then talk to them in Conversations." }
          ].map((item, i) => (
            <div key={i} className="border-b border-black/5 dark:border-white/10 pb-4 last:border-0">
              <p className="font-bold text-sm mb-1">{item.q}</p>
              <p className="text-sm text-black/50 dark:text-white/50">{item.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
