import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const interests = ['Music', 'Gardening', 'Reading', 'Walking', 'Cooking', 'Arts & Crafts', 'Sports', 'Movies', 'Board Games', 'History', 'Nature'];

export default function Register() {
  const { role: routeRole } = useParams();
  const [form, setForm] = useState({ email: '', password: '', full_name: '', phone: '', location: '', bio: '', role: routeRole === 'volunteer' ? 'volunteer' : 'client', registrant_type: 'self', pvg_number: '', interests: [] });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const toggleInterest = name => setForm(value => ({ ...value, interests: value.interests.includes(name) ? value.interests.filter(item => item !== name) : [...value.interests, name] }));

  const handleSubmit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      nav('/dashboard');
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(' ') : 'Registration failed. Please check your details.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <Link to="/" className="text-sm font-semibold text-indigo-700">← Back to Shallion</Link>
        <h1 className="mt-5 text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-slate-600">Choose how you will use Shallion and complete your profile.</p>
        {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">I am joining as
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="mt-1 w-full rounded-xl border p-3">
              <option value="client">A client or carer</option><option value="volunteer">A volunteer</option>
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">Full name<input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="mt-1 w-full rounded-xl border p-3" /></label>
          <label className="text-sm font-medium text-slate-700">Email<input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="mt-1 w-full rounded-xl border p-3" /></label>
          <label className="text-sm font-medium text-slate-700">Password<input required minLength="8" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="mt-1 w-full rounded-xl border p-3" /></label>
          <label className="text-sm font-medium text-slate-700">Phone<input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1 w-full rounded-xl border p-3" /></label>
          <label className="text-sm font-medium text-slate-700">Location<input value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="mt-1 w-full rounded-xl border p-3" /></label>
          {form.role === 'client' ? (
            <label className="text-sm font-medium text-slate-700">Registering for
              <select value={form.registrant_type} onChange={e => setForm({...form, registrant_type: e.target.value})} className="mt-1 w-full rounded-xl border p-3"><option value="self">Myself</option><option value="carer">A family member</option></select>
            </label>
          ) : (
            <label className="text-sm font-medium text-slate-700">PVG number (optional)<input value={form.pvg_number} onChange={e => setForm({...form, pvg_number: e.target.value})} className="mt-1 w-full rounded-xl border p-3" /></label>
          )}
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700">Short introduction<textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows="3" className="mt-1 w-full rounded-xl border p-3" /></label>
        <fieldset className="mt-6"><legend className="text-sm font-semibold text-slate-800">Interests</legend><div className="mt-3 flex flex-wrap gap-2">{interests.map(name => <button type="button" key={name} onClick={() => toggleInterest(name)} className={`rounded-full px-3 py-2 text-sm ${form.interests.includes(name) ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'}`}>{name}</button>)}</div></fieldset>
        <button disabled={busy} className="mt-8 w-full rounded-xl bg-indigo-700 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="mt-4 text-center text-sm text-slate-600">Already registered? <Link to="/login" className="font-semibold text-indigo-700">Sign in</Link></p>
      </form>
    </main>
  );
}
