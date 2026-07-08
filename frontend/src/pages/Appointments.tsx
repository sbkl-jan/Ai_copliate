import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Calendar, Plus, X, AlertTriangle, Sparkles, Clock, User } from 'lucide-react';

interface Appointment {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  source: string;
}

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await api.post('/appointments', {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        title,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        source: 'portal',
      });

      // Reset
      setName('');
      setEmail('');
      setPhone('');
      setTitle('');
      setStartTime('');
      setEndTime('');
      setShowAddForm(false);
      fetchAppointments();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to schedule appointment. Internal conflict.');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    }
  };

  return (
    <div className="flex-1 p-8 ml-64 min-h-screen flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Calendar Bookings</h2>
          <p className="text-slate-400 text-sm mt-1">Review reservations, avoid booking conflicts, and manage timelines.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-all duration-150"
        >
          <Plus size={16} /> Book Appointment
        </button>
      </div>

      {/* Main Grid Timeline list */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Calendar size={18} className="text-brand-400" /> Timeline Agenda List
        </h3>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            Retrieving schedules...
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20 text-slate-500 text-sm border border-dashed border-white/5 rounded-xl">
            No upcoming appointments scheduled.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {appointments.map((appt) => (
              <div key={appt._id} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-150 flex items-center justify-between">
                
                {/* Details */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-xl">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{appt.title}</h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1"><User size={12} /> {appt.customerName}</span>
                      <span>&bull;</span>
                      <span>{new Date(appt.startTime).toLocaleString()} - {new Date(appt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>&bull;</span>
                      <span className="capitalize">Source: {appt.source}</span>
                    </div>
                  </div>
                </div>

                {/* Actions status */}
                <div className="flex items-center gap-4">
                  <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    appt.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    appt.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-slate-500/10 text-slate-500'
                  }`}>
                    {appt.status}
                  </span>
                  
                  {appt.status !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelAppointment(appt._id)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg border border-red-500/10 hover:border-red-500/20 transition-all duration-150"
                    >
                      Cancel
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Appointment Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-2xl w-full max-w-md p-6 border border-white/10 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-brand-400" /> Book Availability Slot
              </h3>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
                className="p-1 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex gap-2 items-start">
                <AlertTriangle size={16} className="shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Appointment Title / Concern"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              />
              <input
                type="text"
                placeholder="Customer Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Start Time</label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">End Time</label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-sm transition-all duration-150 shadow-md shadow-brand-500/25"
              >
                Confirm Reservation Slot
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;
