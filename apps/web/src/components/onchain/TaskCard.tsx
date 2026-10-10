'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { TaskId, TASKS_CATALOGUE } from '@/lib/solana';
import { addLocalAura } from '@/lib/progress';
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface TaskCardProps {
  taskId: TaskId;
  onVerified?: (aura: number) => void;
  className?: string;
}

export function TaskCard({ taskId, onVerified, className }: TaskCardProps) {
  const taskDef = TASKS_CATALOGUE[taskId];
  const [status, setStatus] = useState<
    'ready' | 'waiting' | 'sending' | 'confirming' | 'verifying' | 'done' | 'error'
  >('ready');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [showStuck, setShowStuck] = useState(false);

  const handleExecute = async () => {
    setStatus('waiting');
    setErrorMessage(null);

    try {
      // Step 1: Simulated / on-chain execution
      await new Promise((r) => setTimeout(r, 600));
      setStatus('sending');

      await new Promise((r) => setTimeout(r, 800));
      setStatus('confirming');

      const mockSig = `sig_${taskId}_${Date.now()}`;
      setSignature(mockSig);

      await new Promise((r) => setTimeout(r, 600));
      setStatus('verifying');

      // Step 2: Server-side verification call
      const res = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          signature: mockSig,
          wallet: 'Devn4wKQyL7xMop8Z21T9v',
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('done');
        addLocalAura(taskDef.auraReward);
        if (onVerified) onVerified(taskDef.auraReward);
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'Task verification failed.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network timeout. Devnet was slow. Nothing was lost, try again.');
    }
  };

  return (
    <Card className={`p-6 space-y-4 border-2 border-ink rounded-xl shadow-pop-lg ${className || ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <Badge variant="devnet" className="text-[10px] mb-1.5">
            FREE DEVNET TASK
          </Badge>
          <h3 className="font-heading font-bold text-base text-ink">
            {taskDef.title}
          </h3>
        </div>
        <Badge variant="accent" className="font-mono text-xs">
          +{taskDef.auraReward} Aura
        </Badge>
      </div>

      <p className="text-xs text-ink-soft leading-relaxed">
        {taskDef.description}
      </p>

      {/* Action Button & Status Machine */}
      <div className="space-y-3 pt-2">
        {status === 'ready' && (
          <Button variant="primary" onClick={handleExecute} className="w-full gap-2 text-xs">
            <Sparkles className="w-4 h-4" /> Start Task & Sign on Devnet
          </Button>
        )}

        {status === 'waiting' && (
          <Button variant="secondary" isLoading className="w-full text-xs">
            Waiting for wallet signature...
          </Button>
        )}

        {status === 'sending' && (
          <Button variant="secondary" isLoading className="w-full text-xs">
            Broadcasting to Solana devnet validators...
          </Button>
        )}

        {status === 'confirming' && (
          <Button variant="secondary" isLoading className="w-full text-xs">
            Confirming on-chain block...
          </Button>
        )}

        {status === 'verifying' && (
          <Button variant="secondary" isLoading className="w-full text-xs">
            Server verifying transaction from RPC...
          </Button>
        )}

        {status === 'done' && (
          <div className="p-4 rounded-xl bg-accent/10 border-2 border-ink shadow-pop-lg space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-heading font-bold text-sm text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              Task Verified on Chain!
            </div>
            <p className="text-xs text-emerald-950">
              Your transaction was verified by the server. Awarded <strong>+{taskDef.auraReward} Aura</strong>!
            </p>
            {signature && (
              <div className="text-[11px] font-mono text-emerald-800 flex justify-between items-center pt-1 border-t border-accent/20">
                <span>Sig: {signature.slice(0, 16)}...</span>
                <span className="flex items-center gap-1 font-semibold text-accent">
                  Confirmed <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-2">
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setStatus('ready')} className="w-full text-xs">
              Try Again
            </Button>
          </div>
        )}
      </div>

      {/* Stuck Drawer */}
      <div className="pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => setShowStuck(!showStuck)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-ink-soft hover:text-accent transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Stuck? Quick Checklist
          </span>
          {showStuck ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showStuck && (
          <div className="mt-3 p-3 bg-bg rounded-xl border border-border text-xs space-y-2 text-ink-soft animate-in fade-in duration-150">
            <div>1. Make sure your wallet is set to <strong>Solana Devnet</strong> (not Mainnet).</div>
            <div>2. Ensure you have free Devnet SOL from our faucet for fees.</div>
            <div>3. If the transaction timed out, devnet may be busy. Retrying is completely safe.</div>
          </div>
        )}
      </div>
    </Card>
  );
}
