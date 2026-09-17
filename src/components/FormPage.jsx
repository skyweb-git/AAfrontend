import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { API_URL } from '../config';
import { CheckCircle, AlertCircle, Loader, FileText } from 'lucide-react';

const FormPage = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [values, setValues] = useState({});
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const baseUrl = API_URL ? API_URL.replace(/\/api$/, '') : 'https://sverxiioo.nanoprofiles.com';

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/api/forms/${formId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Form not found');
          return;
        }
        const data = await res.json();
        if (!data.form) {
          setError(data.message || 'This form is no longer accepting submissions.');
          return;
        }
        setForm(data.form);
        // Initialise values
        const initial = {};
        data.form.fields.forEach(f => { initial[f.label] = ''; });
        setValues(initial);
      } catch (err) {
        setError('Failed to load form. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [formId, baseUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Client-side required check
    for (const field of form.fields) {
      if (field.required && !values[field.label]?.toString().trim()) {
        setSubmitError(`"${field.label}" is required.`);
        return;
      }
    }

    const responses = form.fields.map(f => ({ fieldLabel: f.label, value: values[f.label] || '' }));

    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/api/forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses, guestName, guestEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Submission failed. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)', paddingTop: '80px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', paddingTop: '80px', color: 'white' }}>
              <Loader size={40} className="animate-spin" style={{ color: '#ef4444' }} />
              <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading form…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '48px 32px' }}>
                <AlertCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
                <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Form Unavailable</h2>
                <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>{error}</p>
                <Link to="/" style={{ display: 'inline-block', background: '#ef4444', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Success */}
          {submitted && (
            <div style={{ textAlign: 'center', paddingTop: '80px' }}>
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '16px', padding: '48px 32px' }}>
                <CheckCircle size={56} style={{ color: '#22c55e', margin: '0 auto 20px' }} />
                <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Submitted Successfully!</h2>
                <p style={{ color: '#9ca3af', fontSize: '15px', marginBottom: '8px' }}>Thank you for filling out <strong style={{ color: 'white' }}>{form?.title}</strong>.</p>
                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '32px' }}>We'll get back to you soon.</p>
                <Link to="/" style={{ display: 'inline-block', background: '#ef4444', color: 'white', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* Form */}
          {!loading && form && !submitted && (
            <div>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '14px', marginBottom: '16px' }}>
                  <FileText size={28} style={{ color: '#ef4444' }} />
                </div>
                <h1 style={{ color: 'white', fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: '800', marginBottom: '8px', lineHeight: 1.2 }}>{form.title}</h1>
                {form.description && (
                  <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6' }}>{form.description}</p>
                )}
                {form.eventId?.title && (
                  <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: '600', marginTop: '8px', letterSpacing: '0.05em' }}>
                    📅 {form.eventId.title}
                  </p>
                )}
              </div>

              {/* Form card */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', backdropFilter: 'blur(12px)' }}>
                <form onSubmit={handleSubmit}>
                  {/* Name + Email always first */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: '#d1d5db', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Your Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full"
                      style={{ width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}
                      placeholder="Full Name"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', color: '#d1d5db', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      style={{ width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}
                      placeholder="you@example.com"
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', marginBottom: '24px' }} />

                  {/* Dynamic fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {form.fields.map((field, i) => (
                      <div key={i}>
                        <label style={{ display: 'block', color: '#d1d5db', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                          {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                        </label>
                        <div style={{ '--tw-ring-color': '#ef4444' }}>
                          {field.type === 'textarea' ? (
                            <textarea
                              style={{ width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none', minHeight: '90px', resize: 'vertical' }}
                              placeholder={field.placeholder}
                              value={values[field.label] || ''}
                              onChange={e => setValues(p => ({ ...p, [field.label]: e.target.value }))}
                              required={field.required}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              style={{ width: '100%', padding: '10px 16px', background: '#1f2937', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}
                              value={values[field.label] || ''}
                              onChange={e => setValues(p => ({ ...p, [field.label]: e.target.value }))}
                              required={field.required}
                            >
                              <option value="">Select an option…</option>
                              {field.options?.map((opt, j) => <option key={j} value={opt}>{opt}</option>)}
                            </select>
                          ) : field.type === 'checkbox' ? (
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                style={{ width: '18px', height: '18px', accentColor: '#ef4444' }}
                                checked={!!values[field.label]}
                                onChange={e => setValues(p => ({ ...p, [field.label]: e.target.checked }))}
                                required={field.required}
                              />
                              <span style={{ color: '#d1d5db', fontSize: '14px' }}>{field.placeholder || field.label}</span>
                            </label>
                          ) : (
                            <input
                              type={field.type}
                              style={{ width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'white', fontSize: '14px', outline: 'none' }}
                              placeholder={field.placeholder}
                              value={values[field.label] || ''}
                              onChange={e => setValues(p => ({ ...p, [field.label]: e.target.value }))}
                              required={field.required}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Error */}
                  {submitError && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 16px', marginTop: '20px', color: '#fca5a5', fontSize: '13px' }}>
                      {submitError}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      marginTop: '28px', width: '100%', padding: '14px', background: submitting ? '#7f1d1d' : '#ef4444',
                      color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700',
                      cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    {submitting ? (
                      <><Loader size={18} className="animate-spin" /> Submitting…</>
                    ) : 'Submit Form'}
                  </button>
                </form>
              </div>

              <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '12px', marginTop: '24px' }}>
                Powered by <strong style={{ color: '#6b7280' }}>ArtArtist</strong>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FormPage;
