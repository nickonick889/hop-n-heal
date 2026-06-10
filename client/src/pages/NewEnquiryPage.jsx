import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

// ─── Question definitions ──────────────────────────────────────────

const BASE_QUESTIONS = [
  {
    id: 'group_size',
    title: 'How many people are travelling?',
    type: 'radio',
    options: ['Just me', '2–3 people', '4+ people'],
  },
  {
    id: 'duration',
    title: 'How long do you plan to stay?',
    type: 'radio',
    options: ['3–5 days', '1 week', '2 weeks+'],
  },
  {
    id: 'budget',
    title: "What's your overall budget?",
    type: 'radio',
    options: ['Under $5k', '$5k–$10k', '$10k+'],
  },
  {
    id: 'travel_dates',
    title: 'When are you thinking of travelling?',
    subtitle: 'Your best estimate is fine — dates can always change.',
    type: 'date',
  },
  {
    id: 'medical',
    title: 'Any medical services you need?',
    subtitle: 'Select all that apply — nothing is set in stone.',
    type: 'checkbox',
    options: ['Cardiac Screening', 'Cancer Screening', 'Orthopaedic Assessment', 'Neurology Consultation', 'Fertility Treatment', 'Executive Health Check', 'Other'],
  },
  {
    id: 'accommodation',
    title: 'What type of accommodation do you prefer?',
    subtitle: 'Select all that apply.',
    type: 'checkbox',
    options: ['Hotel', 'Serviced Apartment'],
  },
  {
    id: 'transport',
    title: 'Will you need transport?',
    subtitle: 'Select all that apply.',
    type: 'checkbox',
    options: ['Airport Transfer', 'Hospital Transfers', 'Daily Transport'],
  },
  {
    id: 'activity',
    title: 'Interested in any activities?',
    subtitle: 'Optional extras for your trip.',
    type: 'checkbox',
    options: ['Cultural Tours', 'Wellness & Spa', 'Adventure Activities'],
  },
  {
    id: 'food_budget',
    title: "What's your food budget per meal?",
    type: 'radio',
    options: ['Budget ($5–$15/meal)', 'Mid-range ($15–$40/meal)', 'Fine dining ($40+/meal)'],
  },
  {
    id: 'food_restrictions',
    title: 'Any dietary requirements?',
    subtitle: 'Select all that apply.',
    type: 'checkbox',
    options: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Nut allergy'],
  },
  {
    id: 'food_cuisine',
    title: 'Any cuisine preferences?',
    subtitle: 'Singapore has it all — select what excites you, or say you\'re open to anything.',
    type: 'checkbox',
    options: [
      'Open to anything',
      'Local Singaporean (hawker food)',
      'Chinese',
      'Malay',
      'Indian',
      'Japanese',
      'Korean',
      'Western',
      'Thai',
      'Vietnamese',
      'Italian / Mediterranean',
    ],
  },
];

const ACCOUNT_QUESTION = {
  id: 'account',
  title: 'Almost there — create your account',
  subtitle: 'Your enquiry will be saved straight to your account.',
  type: 'account',
};

// ─── Page ─────────────────────────────────────────────────────────

export default function NewEnquiryPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [currentQ,       setCurrentQ]       = useState(0);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [showDateInput,  setShowDateInput]  = useState(false);
  const advanceTimer = useRef(null);

  // Enquiry answers
  const [answers, setAnswers] = useState({
    group_size: '', duration: '', budget: '', travel_dates: '',
    medical: [], accommodation: [], transport: [], activity: [],
    food_budget: '', food_restrictions: [], food_cuisine: [],
  });

  // Account fields (guests only)
  const [account, setAccount] = useState({ full_name: '', email: '', password: '', phone: '', country: '' });
  const setAcc = (k) => (e) => setAccount(a => ({ ...a, [k]: e.target.value }));

  // Wait for auth state to resolve before showing the form
  if (user === undefined) {
    return (
      <div className="bg-bg min-h-screen flex flex-col">
        <Navbar />
        <div className="h-1 bg-border" />
      </div>
    );
  }

  const isGuest   = !user;
  const questions = isGuest ? [...BASE_QUESTIONS, ACCOUNT_QUESTION] : BASE_QUESTIONS;
  const totalQ    = questions.length;
  const q         = questions[currentQ];
  const isLastQ   = currentQ === totalQ - 1;
  const progress  = ((currentQ + 1) / totalQ) * 100;

  // ─── Navigation ───────────────────────────────────────────────

  const goBack = () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (currentQ > 0) { setCurrentQ(n => n - 1); setError(''); }
  };

  const goForward = () => {
    setError('');
    setCurrentQ(n => n + 1);
  };

  // Radio: select → brief flash → auto-advance
  const handleRadio = (qId, value) => {
    setAnswers(a => ({ ...a, [qId]: value }));
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setError('');
      if (!isLastQ) setCurrentQ(n => n + 1);
      else handleLoggedInSubmit();
    }, 350);
  };

  // Checkbox: toggle; "None" and "Open to anything" are exclusive — selecting one clears all others
  const EXCLUSIVE = new Set(['None', 'Open to anything']);
  const handleCheckbox = (qId, opt) => {
    const current = answers[qId];
    let next;
    if (EXCLUSIVE.has(opt)) {
      next = current.includes(opt) ? [] : [opt];
    } else {
      const withoutExclusive = current.filter(o => !EXCLUSIVE.has(o));
      next = withoutExclusive.includes(opt)
        ? withoutExclusive.filter(o => o !== opt)
        : [...withoutExclusive, opt];
    }
    setAnswers(a => ({ ...a, [qId]: next }));
  };

  // ─── Submit helpers ───────────────────────────────────────────

  const buildInterests = () => [
    ...answers.medical.map(v           => ({ category: 'medical',          option_value: v })),
    ...answers.accommodation.map(v     => ({ category: 'accommodation',    option_value: v })),
    ...answers.transport.map(v         => ({ category: 'transport',        option_value: v })),
    ...answers.activity.map(v          => ({ category: 'activity',         option_value: v })),
    ...answers.food_restrictions.map(v => ({ category: 'food_restriction', option_value: v })),
    ...answers.food_cuisine.map(v       => ({ category: 'food_cuisine',     option_value: v })),
  ];

  const handleLoggedInSubmit = async () => {
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/enquiries', {
        group_size:    answers.group_size,
        duration_days: answers.duration,
        budget_range:  answers.budget,
        travel_dates:  answers.travel_dates || undefined,
        food_budget:   answers.food_budget,
        interests:     buildInterests(),
      });
      navigate(`/enquiries/${data.enquiry.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSubmit = async () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email.trim());
    if (!emailOk) { setError('Please enter a valid email address.'); return; }
    if (account.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/api/enquiries/guest', {
        full_name: account.full_name,
        email:     account.email,
        password:  account.password,
        phone:     account.phone || undefined,
        country:   account.country || undefined,
        group_size:    answers.group_size,
        duration_days: answers.duration,
        budget_range:  answers.budget,
        travel_dates:  answers.travel_dates || undefined,
        food_budget:   answers.food_budget,
        interests:     buildInterests(),
      });
      updateUser(data.user);
      // Full reload so AuthContext re-reads the new cookie before entering the protected route
      window.location.href = `/enquiries/${data.enquiry.id}`;
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Shared button style ──────────────────────────────────────

  const optionBase = 'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all';
  const optionOn   = 'border-accent bg-accent/10 text-accent';
  const optionOff  = 'border-border bg-surface text-text hover:border-accent/50 hover:bg-surface-alt';
  const inp        = 'w-full bg-bg border border-border rounded-xl px-4 py-3 text-base text-text placeholder:text-muted focus:outline-none focus:border-accent transition-colors';

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="bg-bg min-h-screen text-text flex flex-col">
      <Navbar />

      {/* Progress bar */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content area — fills remaining viewport height */}
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-6">

        {/* Question — vertically centred */}
        <div className="flex-1 flex flex-col justify-center py-10">

          {/* Counter */}
          <p className="text-sm text-muted mb-5">{currentQ + 1} / {totalQ}</p>

          {/* Title */}
          <h2
            className="text-3xl md:text-4xl text-text leading-snug mb-2"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {q.title}
          </h2>
          {q.subtitle
            ? <p className="text-muted mb-8">{q.subtitle}</p>
            : <div className="mb-8" />}

          {/* ── Radio ── */}
          {q.type === 'radio' && (
            <div className="space-y-3">
              {q.options.map(opt => {
                const on = answers[q.id] === opt;
                return (
                  <button key={opt} type="button" onClick={() => handleRadio(q.id, opt)}
                    className={`${optionBase} ${on ? optionOn : optionOff}`}>
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${on ? 'border-accent' : 'border-muted'}`}>
                      {on && <span className="w-2.5 h-2.5 rounded-full bg-accent block" />}
                    </span>
                    <span className="text-base font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Checkbox ── */}
          {q.type === 'checkbox' && (
            <div className="space-y-3">
              {q.options.map(opt => {
                const on = answers[q.id].includes(opt);
                return (
                  <button key={opt} type="button" onClick={() => handleCheckbox(q.id, opt)}
                    className={`${optionBase} ${on ? optionOn : optionOff}`}>
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${on ? 'border-accent bg-accent' : 'border-muted'}`}>
                      {on && <Check size={12} className="text-[#080808]" />}
                    </span>
                    <span className="text-base font-medium">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Date / travel dates ── */}
          {q.type === 'date' && (
            <div className="space-y-3">
              {/* Option: Not yet confirmed — auto-advances */}
              <button type="button"
                onClick={() => {
                  setShowDateInput(false);
                  setAnswers(a => ({ ...a, travel_dates: 'Not yet confirmed' }));
                  if (advanceTimer.current) clearTimeout(advanceTimer.current);
                  advanceTimer.current = setTimeout(() => {
                    setError('');
                    setCurrentQ(n => n + 1);
                  }, 350);
                }}
                className={`${optionBase} ${answers.travel_dates === 'Not yet confirmed' ? optionOn : optionOff}`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${answers.travel_dates === 'Not yet confirmed' ? 'border-accent' : 'border-muted'}`}>
                  {answers.travel_dates === 'Not yet confirmed' && <span className="w-2.5 h-2.5 rounded-full bg-accent block" />}
                </span>
                <span className="text-base font-medium">Not yet confirmed</span>
              </button>

              {/* Option: I have specific dates — reveals text input */}
              <button type="button"
                onClick={() => {
                  if (advanceTimer.current) clearTimeout(advanceTimer.current);
                  setShowDateInput(true);
                  if (answers.travel_dates === 'Not yet confirmed') {
                    setAnswers(a => ({ ...a, travel_dates: '' }));
                  }
                }}
                className={`${optionBase} ${showDateInput ? optionOn : optionOff}`}
              >
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${showDateInput ? 'border-accent' : 'border-muted'}`}>
                  {showDateInput && <span className="w-2.5 h-2.5 rounded-full bg-accent block" />}
                </span>
                <span className="text-base font-medium">I have specific dates</span>
              </button>

              {showDateInput && (
                <input
                  type="text"
                  autoFocus
                  value={answers.travel_dates === 'Not yet confirmed' ? '' : answers.travel_dates}
                  onChange={e => setAnswers(a => ({ ...a, travel_dates: e.target.value }))}
                  placeholder="e.g. Early June 2026, or 10–17 Jul"
                  className={`${inp} mt-1`}
                />
              )}
            </div>
          )}

          {/* ── Account creation ── */}
          {q.type === 'account' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted mb-1.5">Full name</label>
                <input type="text" required autoFocus value={account.full_name} onChange={setAcc('full_name')} placeholder="Jane Smith" className={inp} />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Email</label>
                <input type="email" required value={account.email} onChange={setAcc('email')} placeholder="you@example.com" className={inp} />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Password</label>
                <input type="password" required value={account.password} onChange={setAcc('password')} placeholder="Min. 8 characters" className={inp} />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Phone <span className="text-muted-dark">(optional)</span></label>
                <input type="tel" value={account.phone} onChange={setAcc('phone')} placeholder="+60 12 345 6789" className={inp} />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1.5">Country <span className="text-muted-dark">(optional)</span></label>
                <input type="text" value={account.country} onChange={setAcc('country')} placeholder="Malaysia" className={inp} />
              </div>
              <p className="text-sm text-muted pt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-accent hover:underline">Log in</Link>
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              {error}
              {error.includes('already registered') && (
                <span> <Link to="/login" className="underline">Log in here</Link>.</span>
              )}
            </div>
          )}
        </div>

        {/* Bottom nav */}
        <div className="pb-8 flex items-center justify-between gap-4">
          <button
            onClick={goBack}
            disabled={currentQ === 0}
            className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors disabled:opacity-30"
          >
            <ArrowLeft size={16} /> Back
          </button>

          {/* Date question — Continue button only shown when specific dates mode is active */}
          {q.type === 'date' && showDateInput && (
            <button
              onClick={goForward}
              disabled={!answers.travel_dates || answers.travel_dates === 'Not yet confirmed'}
              className="flex items-center gap-2 bg-accent text-[#080808] font-semibold px-6 py-3 rounded-full text-sm hover:bg-accent-hover disabled:opacity-60 transition-colors"
            >
              Continue <ArrowRight size={16} />
            </button>
          )}

          {/* Checkbox questions get a manual Continue / Submit button */}
          {q.type === 'checkbox' && (
            <button
              onClick={isLastQ ? handleLoggedInSubmit : goForward}
              disabled={loading}
              className="flex items-center gap-2 bg-accent text-[#080808] font-semibold px-6 py-3 rounded-full text-sm hover:bg-accent-hover disabled:opacity-60 transition-colors"
            >
              {isLastQ
                ? (loading ? 'Submitting…' : 'Submit enquiry')
                : 'Continue'}
              {!loading && <ArrowRight size={16} />}
            </button>
          )}

          {/* Account step submit */}
          {q.type === 'account' && (
            <button
              onClick={handleGuestSubmit}
              disabled={loading || !account.full_name || !account.email || !account.password}
              className="flex items-center gap-2 bg-accent text-[#080808] font-semibold px-6 py-3 rounded-full text-sm hover:bg-accent-hover disabled:opacity-60 transition-colors"
            >
              {loading ? 'Submitting…' : 'Create account & submit'}
              {!loading && <ArrowRight size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
