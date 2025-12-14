'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Home, 
  Monitor, 
  Layout, 
  Plus, 
  Settings, 
  Play, 
  Trash2, 
  Clock,
  TrendingUp,
  CheckCircle,
  Timer,
  ChevronLeft
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'PAUSED' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalAgents: number;
  activeAgents: number;
  totalExecutions: number;
  executionsToday: number;
  successRate: number;
  hoursSaved: number;
  totalCost: number;
}

export default function DashboardPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch agents
      const agentsRes = await fetch('/api/agents');
      const agentsData = await agentsRes.json();
      setAgents(agentsData.agents || []);

      // Fetch stats (this would come from an API endpoint)
      // For now, calculate from agents
      const statsData: DashboardStats = {
        totalAgents: agentsData.agents?.length || 0,
        activeAgents: agentsData.agents?.filter((a: Agent) => a.status === 'ACTIVE').length || 0,
        totalExecutions: 0,
        executionsToday: 0,
        successRate: 0,
        hoursSaved: 0,
        totalCost: 0
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAgent(id: string) {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await fetch(`/api/agents/${id}`, { method: 'DELETE' });
      setAgents(agents.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete agent:', error);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Nimbus ☁️</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>

          <Link 
            href="/monitor"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Monitor className="w-5 h-5" />
            Monitor
          </Link>

          <Link 
            href="/templates"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Layout className="w-5 h-5" />
            Templates
          </Link>

          <Link 
            href="/agents/new"
            className="flex items-center gap-3 px-3 py-2 mt-4 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            New Agent
          </Link>
        </nav>

        {/* Recent Agents */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recents
          </h3>
          <div className="space-y-2">
            {agents.slice(0, 3).map(agent => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className="flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                  {agent.name[0]}
                </div>
                <span className="truncate">{agent.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 p-4 text-sm text-gray-600 hover:text-gray-900 border-t border-gray-200"
        >
          <ChevronLeft className="w-4 h-4" />
          Hide sidebar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your AI Agents</h1>
              <p className="text-gray-600 mt-1">Build and manage autonomous agents</p>
            </div>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
              >
                Show sidebar
              </button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Agents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAgents}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Layout className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{stats.activeAgents} active</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Executions Today</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.executionsToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">{stats.totalExecutions} total</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.successRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hours Saved</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.hoursSaved}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Timer className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">This week</p>
              </div>
            </div>
          )}

          {/* Agents Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading agents...</p>
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Layout className="w-12 h-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-semibold text-gray-900 mt-4">No agents yet</h3>
              <p className="text-gray-600 mt-2">Get started by creating your first agent</p>
              <Link
                href="/agents/new"
                className="inline-flex items-center gap-2 px-4 py-2 mt-6 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Create Agent
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold">
                        {agent.name[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          agent.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {agent.description || 'No description provided'}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <Clock className="w-4 h-4" />
                    Last run: {new Date(agent.updatedAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/agents/${agent.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-center"
                    >
                      <Settings className="w-4 h-4 inline mr-1" />
                      Configure
                    </Link>
                    <Link
                      href={`/agents/${agent.id}/run`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-center"
                    >
                      <Play className="w-4 h-4 inline mr-1" />
                      Run
                    </Link>
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
