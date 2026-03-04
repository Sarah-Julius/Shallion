import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SERVICES = [
  'Companionship & Social Visits',
  'Help with Daily Tasks',
  'Medication Reminders',
  'Transportation',
  'Music & Activities',
  'Outdoor Walks',
  'Reading & Conversation',
  'Other',
];

const INTERESTS = [
  'Music', 'Gardening', 'Reading', 'Walking',
  'Cooking', 'Arts & Crafts', 'Sports', 'Movies',
  'Board Games', 'Knitting', 'History', 'Nature',
];

export default function ClientRegister() {
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    registrant_type: 'self', carer_name: '', carer_relationship: '',
    services: [], interests: [], gp_certificate: null,
  });

  const toggleItem = (field, item) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(item)
        ? f[field].filter(i => i !== item)
        : [...f[field], item]
    }));
  };

  const handleSubmit = async () => {
    try {
      await api.post('/auth/register/', {
        username: form.email,
        email: form.email,
        password: form.password,
      });
      nav('/login');
    } catch {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full ${step >= s ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Step 1 — Account Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
            <p className="text-gray-500 text-sm">Tell us about yourself</p>

            <input className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Full Name" value={form.full_name}
              onChange={e => setForm({...form, full_name: e.target.value})} />

            <input className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="email" placeholder="Email Address" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} />

            <input className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              type="password" placeholder="Password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />

            <p className="font-medium text-gray-700">Who is registering?</p>
            <div className="flex gap-3">
              {['self', 'carer'].map(type => (
                <button key={type}
                  onClick={() => setForm({...form, registrant_type: type})}
                  className={`flex-1 py-2 rounded-xl border-2 font-medium transition-all ${
                    form.registrant_type === type
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-500'
                  }`}>
                  {type === 'self' ? 'Myself' : 'Carer / Family'}
                </button>
              ))}
            </div>

            {form.registrant_type === 'carer' && (
              <>
                <input className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Carer's Full Name" value={form.carer_name}
                  onChange={e => setForm({...form, carer_name: e.target.value})} />
                <input className="w-full border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Relationship to Client (e.g. Daughter)" value={form.carer_relationship}
                  onChange={e => setForm({...form, carer_relationship: e.target.value})} />
              </>
            )}

            <button onClick={() => setStep(2)}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium mt-2">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 — Services & Interests */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Services & Interests</h2>
            <p className="text-gray-500 text-sm">Help us find the right volunteers for you</p>

            <div>
              <p className="font-medium text-gray-700 mb-3">Services needed</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICES.map(s => (
                  <button key={s} onClick={() => toggleItem('services', s)}
                    className={`text-sm py-2 px-3 rounded-xl border-2 text-left transition-all ${
                      form.services.includes(s)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-700 mb-3">Interests & hobbies</p>
              <div className="grid grid-cols-3 gap-2">
                {INTERESTS.map(i => (
                  <button key={i} onClick={() => toggleItem('interests', i)}
                    className={`text-sm py-2 px-3 rounded-xl border-2 transition-all ${
                      form.interests.includes(i)
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-500'
                    }`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 font-medium">
                ← Back
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium">
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — GP Certificate */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Verification</h2>
            <p className="text-gray-500 text-sm">Please upload your GP certificate confirming your diagnosis</p>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-gray-600 mb-4">Upload GP Certificate</p>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setForm({...form, gp_certificate: e.target.files[0]})}
                className="w-full text-sm text-gray-500" />
              {form.gp_certificate && (
                <p className="mt-3 text-green-600 text-sm">✅ {form.gp_certificate.name}</p>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">
              Your certificate will be reviewed by our team before your account is activated
            </p>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)}
                className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 font-medium">
                ← Back
              </button>
              <button onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium">
                Complete Registration
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
