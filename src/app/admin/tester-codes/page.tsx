'use client';

import { useState, useEffect } from 'react';
import { Plus, Copy, Check, RefreshCw } from 'lucide-react';
import GlassPanel from '@/components/ui/GlassPanel';
import { TesterCode } from '@/types/subscription';
import '../admin.css';

export default function TesterCodesAdmin() {
  const [codes, setCodes] = useState<TesterCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState({
    code: '',
    description: '',
    maxRedemptions: 100,
    accessDurationDays: 30,
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await fetch('/api/admin/tester-codes');
      if (response.ok) {
        const data = await response.json();
        setCodes(data.codes);
      }
    } catch (error) {
      console.error('Error fetching codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCode = async () => {
    try {
      const response = await fetch('/api/admin/tester-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCode),
      });
      
      if (response.ok) {
        setShowCreateForm(false);
        setNewCode({
          code: '',
          description: '',
          maxRedemptions: 100,
          accessDurationDays: 30,
        });
        await fetchCodes();
      }
    } catch (error) {
      console.error('Error creating code:', error);
    }
  };

  const toggleCode = async (codeId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/tester-codes/${codeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      
      if (response.ok) {
        await fetchCodes();
      }
    } catch (error) {
      console.error('Error toggling code:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode({ ...newCode, code });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-purple-950/40 to-black">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-2xl animate-pulse" />
          <RefreshCw className="w-12 h-12 text-purple-300 animate-spin relative z-10 drop-shadow-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-black via-purple-950/40 to-black relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-2xl">
              Tester Code Management
            </span>
          </h1>
          <p className="text-gray-300 text-lg">Create and manage beta access codes</p>
        </div>

        {/* Create new code section */}
        <GlassPanel className="mb-8 p-8 backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 shadow-2xl" variant="medium">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
            >
              <Plus className="w-5 h-5" />
              Create New Code
            </button>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Create New Code</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2 uppercase tracking-wider">
                    Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCode.code}
                      onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                      placeholder="BETA2024"
                      className="flex-1 px-4 py-3 bg-black/40 backdrop-blur border border-purple-500/50 rounded-lg focus:outline-none focus:border-purple-400 focus:bg-black/60 text-white placeholder-purple-300/50 font-mono transition-all"
                    />
                    <button
                      onClick={generateRandomCode}
                      className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30"
                      title="Generate random code"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2 uppercase tracking-wider">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newCode.description}
                    onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    placeholder="Beta testing program"
                    className="w-full px-4 py-3 bg-black/40 backdrop-blur border border-purple-500/50 rounded-lg focus:outline-none focus:border-purple-400 focus:bg-black/60 text-white placeholder-purple-300/50 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2 uppercase tracking-wider">
                    Max Redemptions
                  </label>
                  <input
                    type="number"
                    value={newCode.maxRedemptions}
                    onChange={(e) => setNewCode({ ...newCode, maxRedemptions: parseInt(e.target.value) })}
                    min="-1"
                    className="w-full px-4 py-3 bg-black/40 backdrop-blur border border-purple-500/50 rounded-lg focus:outline-none focus:border-purple-400 focus:bg-black/60 text-white transition-all"
                  />
                  <p className="text-xs text-purple-300/70 mt-1 italic">Use -1 for unlimited</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-purple-200 mb-2 uppercase tracking-wider">
                    Access Duration (days)
                  </label>
                  <input
                    type="number"
                    value={newCode.accessDurationDays}
                    onChange={(e) => setNewCode({ ...newCode, accessDurationDays: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-3 bg-black/40 backdrop-blur border border-purple-500/50 rounded-lg focus:outline-none focus:border-purple-400 focus:bg-black/60 text-white transition-all"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={createCode}
                  disabled={!newCode.code || !newCode.description}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-purple-500/50"
                >
                  Create Code
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCode({
                      code: '',
                      description: '',
                      maxRedemptions: 100,
                      accessDurationDays: 30,
                    });
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </GlassPanel>

        {/* Active codes table */}
        <GlassPanel className="p-8 backdrop-blur-xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 shadow-2xl" variant="medium">
          <h2 className="text-2xl font-bold text-white mb-6 bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Active Codes</h2>
          
          {codes.length === 0 ? (
            <p className="text-purple-300/70 text-center py-12 text-lg">No codes created yet</p>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30 bg-black/30">
                    <th className="text-left py-4 px-6 text-purple-200 font-semibold uppercase tracking-wider text-xs">Code</th>
                    <th className="text-left py-4 px-6 text-purple-200 font-semibold uppercase tracking-wider text-xs">Description</th>
                    <th className="text-center py-4 px-6 text-purple-200 font-semibold uppercase tracking-wider text-xs">Used / Max</th>
                    <th className="text-center py-4 px-6 text-purple-200 font-semibold uppercase tracking-wider text-xs">Duration</th>
                    <th className="text-center py-4 px-6 text-purple-200 font-semibold uppercase tracking-wider text-xs">Status</th>
                    <th className="text-center py-4 px-6 text-purple-200 font-semibold uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr key={code.code} className="border-b border-purple-500/20 hover:bg-purple-500/10 transition-all">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">{code.code}</span>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="p-1.5 hover:bg-purple-500/20 rounded-lg transition-all"
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-4 h-4 text-green-400 drop-shadow-glow" />
                            ) : (
                              <Copy className="w-4 h-4 text-purple-300 hover:text-purple-200" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-200">{code.description}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-semibold text-purple-200">
                          {code.currentRedemptions}
                        </span>
                        <span className="text-purple-400 mx-1">/</span>
                        <span className="text-gray-300">
                          {code.maxRedemptions === -1 ? '∞' : code.maxRedemptions}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-purple-200 font-medium">
                        {code.accessDurationDays} days
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur ${
                          code.isActive
                            ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-400/30'
                            : 'bg-gradient-to-r from-red-500/30 to-rose-500/30 text-red-300 border border-red-400/30'
                        }`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${
                            code.isActive ? 'bg-green-400 shadow-green-400/50 shadow-sm' : 'bg-red-400 shadow-red-400/50 shadow-sm'
                          }`} />
                          {code.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => toggleCode(code.code, !code.isActive)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                            code.isActive
                              ? 'bg-gradient-to-r from-red-500/30 to-rose-500/30 hover:from-red-500/40 hover:to-rose-500/40 text-red-300 border border-red-400/30'
                              : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 text-green-300 border border-green-400/30'
                          }`}
                        >
                          {code.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}