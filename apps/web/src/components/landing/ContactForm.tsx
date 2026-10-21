'use client';

import React from 'react';

export interface ContactFormProps {
  supportEmail: string;
}

/**
 * Support request form used on the contact page. Posts to /api/contact, which
 * stores the message so nothing is lost in an inbox-less deployment.
 */
export function ContactForm({ supportEmail }: ContactFormProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>(
    'idle'
  );
  const [note, setNote] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setNote('Fill in your name, email and message.');
      return;
    }

    setStatus('sending');
    setNote(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('sent');
        setNote('Thanks — we got it. We reply within 2 business days.');
        setName('');
        setEmail('');
        setMessage('');
        return;
      }

      setStatus('error');
      setNote(
        data?.message || `Could not send that. Email us directly at ${supportEmail}.`
      );
    } catch {
      setStatus('error');
      setNote(`Could not send that. Email us directly at ${supportEmail}.`);
    }
  };

  if (status === 'sent') {
    return (
      <div className="rounded-xl border-2 border-border bg-surface-muted p-4 text-sm text-ink">
        <p className="font-semibold">Message sent.</p>
        <p className="text-ink-soft mt-1">{note}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Name
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border-2 border-border bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border-2 border-border bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          Message
        </span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="What can we help with?"
          className="mt-1 w-full rounded-lg border-2 border-border bg-white px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </label>
      {note && status === 'error' && (
        <p className="text-sm font-medium text-secondary-dark">{note}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="pop inline-flex min-h-[44px] items-center justify-center rounded-full border-2 border-ink bg-accent-strong px-5 text-sm font-bold text-white shadow-pop disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
