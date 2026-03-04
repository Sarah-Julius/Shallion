import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';

const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLIC_KEY');

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/payments/create-intent/', { amount: 2000 });
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) }
      });
      if (result.error) {
        setStatus(result.error.message);
      } else {
        setStatus('✅ Payment successful!');
      }
    } catch {
      setStatus('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-gray-50">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay $20.00'}
      </button>
      {status && (
        <p className={`text-center text-sm ${status.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
          {status}
        </p>
      )}
    </div>
  );
}

export default function Payment() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <div className="flex items-center mb-6">
          <button onClick={() => nav('/dashboard')} className="text-gray-500 hover:text-gray-700 mr-3">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600">Amount to pay</p>
          <p className="text-2xl font-bold text-blue-600">$20.00</p>
        </div>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </div>
    </div>
  );
}
