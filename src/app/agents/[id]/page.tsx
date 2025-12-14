'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Settings,
  FileText,
  BarChart3,
  Database,
  ChevronDown,
  Plus,
  Mail,
  Lock,
  Trash2,
  Send,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  description?: string;
  status: string;
  instructions: string;
  model: string;
  triggers: any[];
  tools: any[];
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('configuration');
  const [assistantMessage, setAssistantMessage] = useState('');

  useEffect(() => {
    fetchAgent();
  }, [id]);

  async function fetchAgent() {
    try {
      const res = await fetch(`/api/agents/${id}`);
      const data = await res.json();
      setAgent(data.agent);
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveAgent() {
    if (!agent) return;
    try {
      await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agent)
      });
      alert('Agent saved successfully!');
    } catch (error) {
      console.error('Failed to save agent:', error);
      alert('Failed to save agent');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-900 text-lg font-semibold">Agent not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold">
                {agent.name[0]}
              </div>
              <span className="font-medium">{agent.name}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">Modified</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 px-3 py-1.5 bg-orange-50 text-orange-700 rounded">
              Undeployed changes
            </span>
            <button 
              onClick={saveAgent}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Deploy
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'chats'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chats
          </button>
          <button
            onClick={() => setActiveTab('configuration')}
            className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'configuration'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Logs
          </button>
          <button
            onClick={() => setActiveTab('evals')}
            className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'evals'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Evals
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`flex items-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'datasets'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-4 h-4" />
            Datasets
          </button>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Configuration */}
        <div className="w-1/2 overflow-y-auto bg-white border-r border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Agent configuration</h2>

          {/* Triggers */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700">Triggers</label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">
                <Lock className="w-4 h-4" />
                Chat
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full border border-gray-300">
                <Plus className="w-4 h-4" />
                Email
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-full border border-gray-300">
                <Plus className="w-4 h-4" />
                A2A
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700">Instructions</label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <textarea
              value={agent.instructions}
              onChange={(e) => setAgent({ ...agent, instructions: e.target.value })}
              className="w-full h-48 px-3 py-2 text-sm font-mono bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="You are a helpful assistant..."
            />
          </div>

          {/* Model */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700">Model</label>
              <HelpCircle className="w-4 h-4 text-gray-400" />
            </div>
            <select
              value={agent.model}
              onChange={(e) => setAgent({ ...agent, model: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="meta-llama/llama-3.1-405b-instruct">gpt-4.1</option>
              <option value="meta-llama/llama-3.1-70b-instruct">gpt-4.0</option>
              <option value="meta-llama/llama-3.1-8b-instruct">gpt-3.5-turbo</option>
            </select>
          </div>

          {/* Advanced Settings */}
          <details className="mb-6">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Advanced settings
            </summary>
            <div className="mt-3 text-sm text-gray-600">
              <p>Additional configuration options coming soon...</p>
            </div>
          </details>

          {/* Tools */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-gray-700">Tools</label>
            </div>
            {agent.tools && agent.tools.length > 0 ? (
              <div className="space-y-2">
                {agent.tools.map((tool: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{tool.toolId}</span>
                      <button className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-sm font-medium text-gray-900 mb-2">No tools configured</p>
                <p className="text-sm text-gray-500 mb-4">
                  Tools are how agents perform actions and interact<br />
                  with your data, workflows, and business logic.
                </p>
                <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                  <Plus className="w-4 h-4" />
                  Add new tool
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Configuration Assistant */}
        <div className="w-1/2 flex flex-col bg-gray-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <h3 className="text-sm font-medium text-gray-700">Configuration Assistant</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">Configuration Assistant</span>
                  <span className="text-xs text-gray-500">1:28 PM</span>
                </div>
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
                  Hi! I can help you configure this agent with specific capabilities and access to various tools. 
                  What type of agent are you trying to build?
                </div>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={assistantMessage}
                onChange={(e) => setAssistantMessage(e.target.value)}
                placeholder="Message Configuration Assistant"
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <select className="text-xs bg-transparent text-gray-600">
                <option>gpt-4.1</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
