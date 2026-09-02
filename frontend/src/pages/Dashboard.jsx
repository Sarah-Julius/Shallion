import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const services = [['companionship', 'Companionship'], ['daily_tasks', 'Daily tasks'], ['medication', 'Medication reminders'], ['transportation', 'Transportation'], ['music', 'Music & activities'], ['walking', 'Outdoor walks'], ['reading', 'Reading & conversation'], ['other', 'Other']];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');
  const [data, setData] = useState({ requests: [], applications: [], bookings: [], messages: [], matches: [] });
  const [notice, setNotice] = useState('');
  const [requestForm, setRequestForm] = useState({ service_type: 'companionship', description: '', date_needed: '', time_needed: '10:00' });
  const [message, setMessage] = useState({ receiver: '', content: '' });

  const load = useCallback(async () => {
    const endpoints = [['requests', '/requests/'], ['applications', '/applications/'], ['bookings', '/bookings/'], ['messages', '/messages/']];
    const results = await Promise.all(endpoints.map(([, url]) => api.get(url).then(r => r.data).catch(() => [])));
    const next = Object.fromEntries(endpoints.map(([key], i) => [key, results[i]]));
    if (user?.role === 'client') next.matches = await api.get('/matches/').then(r => r.data).catch(() => []);
    setData(value => ({ ...value, ...next }));
  }, [user?.role]);

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const contacts = useMemo(() => {
    const map = new Map();
    data.bookings.forEach(booking => {
      const id = user?.role === 'client' ? booking.volunteer : booking.client;
      const name = user?.role === 'client' ? booking.volunteer_name : booking.client_name;
      map.set(id, name);
    });
    return [...map.entries()];
  }, [data.bookings, user?.role]);

  const createRequest = async e => { e.preventDefault(); await api.post('/requests/', requestForm); setRequestForm({...requestForm, description: '', date_needed: ''}); setNotice('Support request created.'); load(); };
  const apply = async id => { await api.post('/applications/', { request: id, message: 'I would be happy to help with this request.' }); setNotice('Application sent.'); load(); };
  const accept = async id => { await api.post(`/applications/${id}/accept/`); setNotice('Volunteer accepted and booking created.'); load(); };
  const updateBooking = async (id, status) => { await api.patch(`/bookings/${id}/`, { status }); setNotice('Booking updated.'); load(); };
  const sendMessage = async e => { e.preventDefault(); await api.post('/messages/', message); setMessage({...message, content: ''}); setNotice('Message sent.'); load(); };
  const signOut = () => { logout(); nav('/login'); };

  const tabs = ['overview', 'requests', 'bookings', 'messages'];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><div><p className="text-xl font-extrabold text-indigo-800">Shallion</p><p className="text-sm text-slate-500">Community support, thoughtfully matched</p></div><div className="flex items-center gap-3"><span className="hidden text-sm sm:block">{user?.full_name}</span>{user?.role === 'client' && !user?.has_paid && <button onClick={() => nav('/payment')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Membership</button>}<button onClick={signOut} className="rounded-lg border px-3 py-2 text-sm font-semibold">Sign out</button></div></div></header>
      <nav className="border-b bg-white"><div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5">{tabs.map(item => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize ${tab === item ? 'border-indigo-700 text-indigo-700' : 'border-transparent text-slate-500'}`}>{item}</button>)}</div></nav>
      <main className="mx-auto max-w-6xl px-5 py-8">
        {notice && <div className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}
        {tab === 'overview' && <section><h1 className="text-3xl font-bold">Welcome, {user?.full_name?.split(' ')[0]}</h1><p className="mt-2 text-slate-600">Your {user?.role} account is {user?.is_verified ? 'verified' : 'awaiting verification'}.</p><div className="mt-7 grid gap-4 sm:grid-cols-3">{[['Open requests', data.requests.length], ['Applications', data.applications.length], ['Bookings', data.bookings.length]].map(([label, value]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>)}</div>{user?.role === 'client' && <div className="mt-8"><h2 className="text-xl font-bold">Verified volunteer matches</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{data.matches.map(match => <article key={match.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h3 className="font-bold">{match.full_name}</h3><p className="text-sm text-slate-500">{match.location}</p><p className="mt-2 text-sm">{match.bio || 'Verified community volunteer'}</p></article>)}</div></div>}</section>}
        {tab === 'requests' && <section><h2 className="text-2xl font-bold">{user?.role === 'client' ? 'Your support requests' : 'Available requests'}</h2>{user?.role === 'client' && <form onSubmit={createRequest} className="mt-5 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:grid-cols-2"><select value={requestForm.service_type} onChange={e => setRequestForm({...requestForm, service_type:e.target.value})} className="rounded-xl border p-3">{services.map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select><input required type="date" value={requestForm.date_needed} onChange={e => setRequestForm({...requestForm,date_needed:e.target.value})} className="rounded-xl border p-3"/><input required type="time" value={requestForm.time_needed} onChange={e => setRequestForm({...requestForm,time_needed:e.target.value})} className="rounded-xl border p-3"/><textarea required placeholder="What support would help?" value={requestForm.description} onChange={e => setRequestForm({...requestForm,description:e.target.value})} className="rounded-xl border p-3"/><button className="rounded-xl bg-indigo-700 p-3 font-semibold text-white sm:col-span-2">Create request</button></form>}<div className="mt-5 space-y-3">{data.requests.map(item => <article key={item.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><div className="flex justify-between gap-3"><div><h3 className="font-bold">{services.find(([value])=>value===item.service_type)?.[1] || item.service_type}</h3><p className="text-sm text-slate-500">{item.client_name} · {item.date_needed} at {item.time_needed}</p><p className="mt-2">{item.description}</p></div>{user?.role === 'volunteer' && <button onClick={() => apply(item.id)} className="h-fit rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">Offer help</button>}</div></article>)}{user?.role === 'client' && data.applications.map(application => <article key={application.id} className="rounded-2xl bg-indigo-50 p-5"><p className="font-semibold">{application.volunteer_name} offered to help</p><p className="text-sm text-slate-600">{application.message}</p>{application.status === 'pending' && <button onClick={() => accept(application.id)} className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Accept and book</button>}</article>)}</div></section>}
        {tab === 'bookings' && <section><h2 className="text-2xl font-bold">Bookings</h2><div className="mt-5 space-y-3">{data.bookings.map(booking => <article key={booking.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200"><h3 className="font-bold">{booking.service_type}</h3><p className="text-sm text-slate-500">{booking.client_name} with {booking.volunteer_name} · {booking.date} at {booking.time}</p><p className="mt-2 text-sm capitalize">Status: {booking.status}</p>{booking.status === 'upcoming' && <div className="mt-3 flex gap-2"><button onClick={() => updateBooking(booking.id,'completed')} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">Mark completed</button><button onClick={() => updateBooking(booking.id,'cancelled')} className="rounded-lg border px-3 py-2 text-sm font-semibold">Cancel</button></div>}</article>)}</div></section>}
        {tab === 'messages' && <section><h2 className="text-2xl font-bold">Messages</h2>{contacts.length > 0 ? <form onSubmit={sendMessage} className="mt-5 flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:flex-row"><select required value={message.receiver} onChange={e => setMessage({...message,receiver:e.target.value})} className="rounded-xl border p-3"><option value="">Choose contact</option>{contacts.map(([id,name]) => <option key={id} value={id}>{name}</option>)}</select><input required value={message.content} onChange={e => setMessage({...message,content:e.target.value})} placeholder="Write a message" className="flex-1 rounded-xl border p-3"/><button className="rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white">Send</button></form> : <p className="mt-3 text-slate-600">Messaging becomes available after a client accepts a volunteer.</p>}<div className="mt-5 space-y-2">{data.messages.map(item => <div key={item.id} className="rounded-xl bg-white p-4 ring-1 ring-slate-200"><p className="text-sm font-semibold">{item.sender_name} → {item.receiver_name}</p><p>{item.content}</p><p className="mt-1 text-xs text-slate-400">{new Date(item.sent_at).toLocaleString()}</p></div>)}</div></section>}
      </main>
    </div>
  );
}
