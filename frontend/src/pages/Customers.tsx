import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, User, Phone, Mail, Calendar, Brain, X, Plus, Sparkles } from 'lucide-react';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
}

interface AppointmentDetails {
  _id: string;
  title: string;
  startTime: string;
  status: string;
}

interface SelectedCustomerDetail {
  customer: Customer;
  appointments: AppointmentDetails[];
  aiMemory: {
    facts: string[];
    preferences: Record<string, any>;
  };
}

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [details, setDetails] = useState<SelectedCustomerDetail | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Create New Customer State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const fetchCustomers = async () => {
    try {
      const response = await api.get(`/customers?search=${search}`);
      setCustomers(response.data.data.customers);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // Load profile side details panel
  useEffect(() => {
    if (!selectedCustomerId) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setDetailsLoading(true);
      try {
        const res = await api.get(`/customers/${selectedCustomerId}`);
        setDetails(res.data.data);
      } catch (err) {
        console.error('Error fetching details', err);
      } finally {
        setDetailsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedCustomerId]);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', {
        email: newEmail,
        firstName: newFirst,
        lastName: newLast,
        phoneNumber: newPhone,
      });
      setNewEmail('');
      setNewFirst('');
      setNewLast('');
      setNewPhone('');
      setShowAddForm(false);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to create customer', err);
    }
  };

  return (
    <div className="flex-1 p-8 ml-64 min-h-screen relative flex gap-6">
      
      {/* Directory Section */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Customer Directory</h2>
            <p className="text-slate-400 text-sm mt-1">Manage tenant contacts, communication records, and profiles.</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all duration-150"
          >
            <Plus size={16} /> Add Contact
          </button>
        </div>

        {/* Filters */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by first/last name, email, or telephone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Directory List Grid */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Telephone</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c._id}
                  onClick={() => setSelectedCustomerId(c._id)}
                  className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-all duration-150 ${
                    selectedCustomerId === c._id ? 'bg-brand-500/5' : ''
                  }`}
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center font-bold">
                      {c.firstName[0]}
                    </div>
                    <span className="font-semibold text-slate-200">{c.firstName} {c.lastName}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{c.email}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{c.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      c.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500'
                    }`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Slide-Over details panel */}
      {selectedCustomerId && (
        <div className="w-96 glass-panel border-l border-white/5 h-screen fixed right-0 top-0 p-6 flex flex-col justify-between z-20">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User size={18} className="text-brand-400" /> Profiler Summary
              </h3>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-center py-20 text-slate-500 text-sm">
                Loading profile files...
              </div>
            ) : details ? (
              <div className="flex flex-col gap-6 overflow-y-auto max-h-[80vh] pr-2">
                
                {/* Profile detail */}
                <div className="flex flex-col items-center gap-2 text-center pb-4 border-b border-white/5">
                  <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center font-bold text-2xl text-brand-400">
                    {details.customer.firstName[0]}
                  </div>
                  <h4 className="text-xl font-bold text-white">{details.customer.firstName} {details.customer.lastName}</h4>
                  <span className="text-xs text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20 font-semibold uppercase">Customer</span>
                </div>

                {/* Directory Contacts details */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Mail size={16} />
                    <span>{details.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Phone size={16} />
                    <span>{details.customer.phoneNumber || 'No phone added'}</span>
                  </div>
                </div>

                {/* AI Memory Agent Facts */}
                <div className="flex flex-col gap-3 bg-brand-500/5 p-4 rounded-xl border border-brand-500/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                    <Brain size={14} /> AI Memory Extraction
                  </h4>
                  {details.aiMemory.facts.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No interaction insights compiled yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5 pl-4 list-disc text-xs text-slate-300">
                      {details.aiMemory.facts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Appointment Calendar list */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar size={14} /> Appointment History
                  </h4>
                  {details.appointments.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No appointment history registered.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {details.appointments.map((appt) => (
                        <div key={appt._id} className="p-2.5 rounded-lg border border-white/5 bg-white/[0.01] flex items-center justify-between">
                          <div>
                            <h5 className="text-xs font-semibold text-slate-200">{appt.title}</h5>
                            <span className="text-[10px] text-slate-500">{new Date(appt.startTime).toLocaleDateString()}</span>
                          </div>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            appt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-500'
                          }`}>{appt.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Customer Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-white/10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-400" /> Onboard New Client
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newFirst}
                  onChange={(e) => setNewFirst(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newLast}
                  onChange={(e) => setNewLast(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
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
              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-brand-500/25"
              >
                Register Customer
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
