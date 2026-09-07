import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import axios from 'axios';
import { Sparkles, ArrowRight, RefreshCw, Award, Clock } from 'lucide-react';

export default function Dashboard({ session }) {
  const [profile, setProfile] = useState(null);
  const [matchingData, setMatchingData] = useState(null);
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(false);
const [offered, setOffered] = useState('');
const [wanted, setWanted] = useState('');
  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchProfile();
    findMatches();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    setProfile(data);
  };
const saveProfile = async (e) => {
  e.preventDefault();
  if (!session?.user?.id) return;

  const { error } = await supabase.from('profiles').upsert({
    id: session.user.id,
    email: session.user.email,
    offered_skills: offered,
    wanted_skills: wanted,
  });

  if (error) {
    alert(error.message);
  } else {
    alert('Skills updated successfully!');
    fetchProfile();
  }
};
  const findMatches = async () => {
    setLoading(true);
    try {
      const token = session.access_token;
      const res = await axios.get(`${API_URL}/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatchingData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateAIPlan = async (skillName) => {
    setLoading(true);
    try {
      const token = session.access_token;
      const res = await axios.post(`${API_URL}/ai/learning-plan`, 
        { skillName, userLevel: 'Beginner' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiPlan(res.data.plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          SkillSwap 🔗
        </h1>
        <div className="flex items-center gap-6">
          <div className="bg-indigo-950 border border-indigo-700/50 px-4 py-1.5 rounded-full flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold">{profile?.credits ?? 0} Skill Credits</span>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded text-slate-300">
            Sign Out
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800 p-6 rounded-2xl border border-indigo-500/20 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Welcome back, {profile?.name || 'Swapper'} 👋</h2>
            <form onSubmit={saveProfile} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 space-y-4">
  <h3 className="text-xl font-bold text-white mb-2">Update Your Skill Profile</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        Skills You Can Teach
      </label>
      <input
        type="text"
        placeholder="e.g. React, C Programming, Math"
        value={offered}
        onChange={(e) => setOffered(e.target.value)}
        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        Skills You Want to Learn
      </label>
      <input
        type="text"
        placeholder="e.g. Digital Logic, Physics, Guitar"
        value={wanted}
        onChange={(e) => setWanted(e.target.value)}
        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
      />
    </div>
  </div>

  <button
    type="submit"
    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
  >
    Save Skills
  </button>
</form>
            <p className="text-slate-400 text-sm">Can't find a direct match? We'll automatically construct a Skill Chain.</p>
          </div>
          <button 
            onClick={findMatches}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Matches
          </button>
        </div>

        <section>
          <h3 className="text-lg font-semibold mb-4 text-slate-300">Exchange Engine Results</h3>

          {loading ? (
            <div className="p-8 text-center text-slate-500 bg-slate-800/50 rounded-xl border border-slate-800 animate-pulse">
              Searching system for direct matches and multi-person chains...
            </div>
          ) : matchingData?.type === 'direct' ? (
            <div className="grid md:grid-cols-2 gap-4">
              {matchingData.matches.map((m, idx) => (
                <div key={idx} className="bg-slate-800 p-5 rounded-xl border border-slate-700 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {m.score}% Direct Match
                      </span>
                    </div>
                    <ul className="text-sm text-slate-300 space-y-1 mb-4">
                      {m.matchReasons.map((r, i) => <li key={i}>• {r}</li>)}
                    </ul>
                  </div>
                  <button 
                    onClick={() => generateAIPlan('Target Skill')}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-sm font-medium py-2 rounded-lg transition flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> AI Learning Plan
                  </button>
                </div>
              ))}
            </div>
          ) : matchingData?.type === 'chain' ? (
            <div className="bg-slate-800/80 p-6 rounded-xl border border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
                <span>🔗 Multi-Person Skill Chain Discovered</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">No direct match was found, but knowledge is passed along this chain so everyone learns!</p>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-lg border border-slate-700/50">
                {matchingData.chain.map((step, i) => (
                  <React.Fragment key={i}>
                    <div className="text-center bg-slate-800 p-3 rounded-lg border border-slate-700 w-full md:w-auto">
                      <p className="text-xs text-slate-400">Step {i + 1}</p>
                      <p className="font-bold text-sm text-white mt-1">Teaches: {step.skillTaught}</p>
                    </div>
                    {i < matchingData.chain.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-indigo-400 hidden md:block shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => generateAIPlan(matchingData.chain[0]?.skillTaught || 'Skill')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" /> Generate AI Learning Plan for Chain
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 p-8 rounded-xl border border-slate-800 text-center">
              <p className="text-slate-400">No active matches or chains found yet.</p>
            </div>
          )}
        </section>

        {aiPlan && (
          <section className="bg-slate-800 p-6 rounded-xl border border-amber-500/20">
            <h3 className="text-lg font-bold text-amber-300 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> AI Generated Learning Syllabus
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {aiPlan.map((session, idx) => (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                    <Clock className="w-3.5 h-3.5" /> Session {session.sessionNumber}
                  </div>
                  <h4 className="font-semibold text-white mb-1">{session.title}</h4>
                  <p className="text-xs text-slate-400">{session.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}