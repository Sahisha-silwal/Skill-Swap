import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './components/Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (isSignUp) => {
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-slate-700">
          <h1 className="text-3xl font-bold text-center text-indigo-400 mb-2">SkillSwap</h1>
          <p className="text-slate-400 text-center mb-6">Your skills are your currency.</p>
          <div className="space-y-4">
            <input 
              className="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Email" 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
            <input 
              className="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-indigo-500"
              placeholder="Password" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => handleAuth(false)}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-semibold transition">
                Log In
              </button>
              <button 
                onClick={() => handleAuth(true)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-semibold transition border border-slate-500">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard session={session} />;
}