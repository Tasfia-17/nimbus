'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Calendar,
  DollarSign
} from 'lucide-react';

interface Execution {
  id: string;
  agentId: string;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  cost?: number;
  logs: any[];
  result?: any;
  error?: string;
}

export default function MonitorPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'running' | 'success' | 'failed'>('all');

  useEffect(() => {
    fetchExecutions();
  }, []);

  async function fetchExecutions() {
    try {
      // This would fetch from an API endpoint
      // For now, using empty array
      setExecutions([]);
    } catch (error) {
      console.error('Failed to fetch executions:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredExecutions = executions.filter(exec => {
    if (filter === 'all') return true;
    return exec.status.toLowerCase() === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'CANCELLED':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      RUNNING: 'bg-blue-100 text-blue-800',
      SUCCESS: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900">
            Nimbus ☁️
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Home
          </Link>

          <Link 
            href="/monitor"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
          >
            Monitor
          </Link>

          <Link 
            href="/templates"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Templates
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Execution List */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900 mb-4">Execution Monitor</h1>
            
            {/* Filters */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
                >
                  <option value="all">All Status</option>
                  <option value="running">Running</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600 mb-1 block">Date Range</label>
                <button className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <span>Last 7 days</span>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Execution List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="inline-block w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredExecutions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No executions found</p>
                <p className="text-xs text-gray-500 mt-1">Run an agent to see executions here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredExecutions.map((execution) => (
                  <button
                    key={execution.id}
                    onClick={() => setSelectedExecution(execution)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedExecution?.id === execution.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="text-sm font-medium text-gray-900">
                          Agent Execution
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(execution.status)}`}>
                        {execution.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(execution.startedAt).toLocaleString()}
                      </div>
                      {execution.duration && (
                        <div className="flex items-center gap-2">
                          Duration: {execution.duration}s
                        </div>
                      )}
                      {execution.cost && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3" />
                          ${execution.cost.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Execution Details */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedExecution ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Execution Details</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Pause className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadge(selectedExecution.status)}`}>
                    {selectedExecution.status}
                  </span>
                  <span className="text-sm text-gray-600">
                    Started: {new Date(selectedExecution.startedAt).toLocaleString()}
                  </span>
                  {selectedExecution.duration && (
                    <span className="text-sm text-gray-600">
                      Duration: {selectedExecution.duration}s
                    </span>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Execution Timeline</h3>
                  
                  {selectedExecution.logs && selectedExecution.logs.length > 0 ? (
                    <div className="space-y-4">
                      {selectedExecution.logs.map((log: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              {getStatusIcon(log.status || 'SUCCESS')}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900">{log.tool || 'Step ' + (idx + 1)}</h4>
                                <span className="text-xs text-gray-500">{log.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{log.action || 'Processing...'}</p>
                              {log.input && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                                    View input
                                  </summary>
                                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.input, null, 2)}
                                  </pre>
                                </details>
                              )}
                              {log.output && (
                                <details className="mt-2">
                                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                                    View output
                                  </summary>
                                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.output, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-sm text-gray-600">No execution steps recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Select an execution to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
