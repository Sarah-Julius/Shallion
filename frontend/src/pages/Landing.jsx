import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-indigo-800 mb-4">Shallion</h1>
        <p className="text-xl text-gray-600 max-w-md">
          Connecting people living with dementia to caring volunteers in their community
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
        <div
          onClick={() => nav('/register/client')}
          className="flex-1 bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-indigo-400"
        >
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">I need support</h2>
          <p className="text-gray-500">Register as a client to find caring volunteers who can help you</p>
          <button className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 font-medium">
            Register as Client
          </button>
        </div>

        <div
          onClick={() => nav('/register/volunteer')}
          className="flex-1 bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-green-400"
        >
          <div className="text-5xl mb-4">🤝</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">I want to help</h2>
          <p className="text-gray-500">Register as a volunteer and make a difference in someone's life</p>
          <button className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium">
            Register as Volunteer
          </button>
        </div>
      </div>

      <p className="mt-8 text-gray-500">
        Already have an account?{' '}
        <span onClick={() => nav('/login')} className="text-indigo-600 cursor-pointer hover:underline">
          Sign in
        </span>
      </p>
    </div>
  );
}
