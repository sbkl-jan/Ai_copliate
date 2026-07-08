import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Target, Search, Plus, DollarSign, Brain, Trash2, X, Sparkles } from 'lucide-react';

interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high';
  value: number;
  aiSuggestions: string[];
  notes: string[];
}

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [details, setDetails] = useState<Lead | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Add Lead Modal State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const fetchLeads = async () => {
    try {
      const res = await api.get(`/leads?search=${search}`);
      setLeads(res.data.data);
    } catch (err) {
      console.error('Failed to load leads', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search]);

  useEffect(() => {
    if (!selectedLeadId) {
      setDetails(null);
      return;
    }

    const fetchLeadDetails = async () => {
      setDetailsLoading(true);
      try {
        const res = await api.get(`/leads/${selectedLeadId}`);
        setDetails(res.data.data);
      } catch (err) {
        console.error('Error fetching lead details', err);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchLeadDetails();
  }, [selectedLeadId]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/leads', {
        name: newName,
        email: newEmail,
        phone: newPhone,
        value: Number(newValue) || 0,
        priority: newPriority,
      });
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewValue('');
      setShowAddForm(false);
      fetchLeads();
    } catch (err) {
      console.error('Failed to create lead', err);
    }
  };

  const handleUpdateStatus = async (status: Lead['status']) => {
    if (!details) return;
    try {
      const res = await api.put(`/leads/${details._id}`, { status });
      setDetails(res.data.data);
      fetchLeads();
    } catch (err) {
      console.error('Failed to update lead status', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await api.delete(`/leads/${id}`);
      setSelectedLeadId(null);
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead', err);
    }
  };

  // Compute Pipeline stats
  const totalPipelineVal = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const activeCount = leads.filter((l) => l.status !== 'won' && l.status !== 'lost').length;

  return (
    <div className="flex-1 p-8 ml-64 min-h-screen relative flex gap-6">
      
      {/* List Section */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Lead Pipeline</h2>
            <p className="text-slate-400 text-sm mt-1">Track prospect deals, contract values, and prioritize follow-ups.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all duration-150"
          >
            <Plus size={16} /> Add Prospect
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="glass-card rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold">Total Pipeline Value</span>
              <h4 className="text-xl font-bold text-emerald-400 mt-1">${totalPipelineVal.toLocaleString()}</h4>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="glass-card rounded-xl p-5 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-xs font-semibold">Active Deal Inquiries</span>
              <h4 className="text-xl font-bold text-brand-400 mt-1">{activeCount} deals</h4>
            </div>
            <div className="p-3 rounded-lg bg-brand-500/10 text-brand-400">
              <Target size={18} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, email, or source..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Leads Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-4">Lead Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Value</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead._id}
                  onClick={() => setSelectedLeadId(lead._id)}
                  className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all duration-150 ${
                    selectedLeadId === lead._id ? 'bg-brand-500/5' : ''
                  }`}
                >
                  <td className="px-6 py-4 flex flex-col">
                    <span className="font-semibold text-slate-200 text-sm">{lead.name}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{lead.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      lead.status === 'won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      lead.status === 'lost' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-semibold capitalize">{lead.priority}</td>
                  <td className="px-6 py-4 text-slate-200 font-semibold">${(lead.value || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details sidebar panel */}
      {selectedLeadId && (
        <div className="w-96 glass-panel border-l border-white/5 h-screen fixed right-0 top-0 p-6 flex flex-col justify-between z-20">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Target size={18} className="text-brand-400" /> Pipeline Deal Detail
              </h3>
              <button
                onClick={() => setSelectedLeadId(null)}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-center py-20 text-slate-500 text-sm">
                Fetching lead details...
              </div>
            ) : details ? (
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[75vh] pr-2">
                
                {/* Header details */}
                <div className="pb-4 border-b border-white/5 flex flex-col gap-1.5">
                  <h4 className="text-xl font-bold text-white">{details.name}</h4>
                  <span className="text-xs text-slate-400 font-medium">{details.email}</span>
                  <span className="text-xs text-slate-400 font-medium">{details.phone || 'No phone number'}</span>
                </div>

                {/* Deal valuation */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Est. Deal Value</span>
                    <h5 className="text-lg font-bold text-emerald-400 mt-1">${(details.value || 0).toLocaleString()}</h5>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Priority Label</span>
                    <h5 className="text-sm font-bold text-slate-200 mt-1 capitalize">{details.priority}</h5>
                  </div>
                </div>

                {/* AI Follow-up Suggestions */}
                <div className="flex flex-col gap-3 bg-brand-500/5 p-4 rounded-xl border border-brand-500/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                    <Brain size={14} /> AI Recommendation Suggestions
                  </h4>
                  {details.aiSuggestions.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No AI suggestions calculated yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-2 list-none text-xs text-slate-300">
                      {details.aiSuggestions.map((sug, idx) => (
                        <li key={idx} className="flex gap-2 items-start bg-dark-600 p-2 rounded border border-white/5">
                          <span className="text-brand-400 font-bold">&bull;</span>
                          <span>{sug}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Pipeline stage controllers */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Update Pipeline Status</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as Lead['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-semibold capitalize border transition-all duration-150 ${
                          details.status === st 
                            ? 'bg-brand-500 border-brand-500 text-white shadow-sm' 
                            : 'border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleDeleteLead(details._id)}
                  className="mt-6 py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} /> Delete Lead
                </button>

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Lead Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-white/10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-400" /> Open New Prospect Deal
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Lead Contact Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Deal Value ($)"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-brand-500/25"
              >
                Create Lead
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Leads;
