import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Card, Badge, Button, Disclaimer, MarkdownText } from '@/components/ui';
import { CaseReplay } from '@/components/war-stories/CaseReplay';
import { BridgeReplay } from '@/components/war-stories/BridgeReplay';
import { Collapsible } from '@/components/war-stories/Collapsible';
import { InvestigatorPlaybook } from '@/components/war-stories/InvestigatorPlaybook';
import { getAllCases, getCase } from '@/lib/cases';
import {
  ArrowLeft,
  ArrowUpRight,
  Clock,
  Wallet,
  Search,
  TriangleAlert,
  FlaskConical,
  BookText,
  ExternalLink,
  Fingerprint,
  Boxes,
} from 'lucide-react';

export function generateStaticParams() {
  return getAllCases().map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) return { title: 'Case not found - Rekt School' };
  return { title: `${c.title} - Rekt School`, description: c.tldr };
}

const difficultyVariant = {
  beginner: 'mint',
  intermediate: 'yellow',
  advanced: 'danger',
} as const;

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCase(slug);
  if (!c) notFound();

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <TopBar lessonTitle={c.protocol} />

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 sm:p-8 space-y-6">
        <div>
          <Link
            href="/war-stories"
            className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All War Stories
          </Link>
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={difficultyVariant[c.difficulty]} className="text-[10px] px-2 py-0.5 capitalize">
              {c.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5">
              {c.category}
            </Badge>
            <Badge variant="yellow" className="text-[10px] px-2 py-0.5">
              {c.dateLabel}
            </Badge>
          </div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
            {c.title}
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Protocol', value: c.protocol },
              { label: 'Chain', value: c.chain },
              { label: 'Loss', value: c.lossUsd.split('(')[0].trim() },
              { label: 'Status', value: c.status },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-surface border border-border space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">{m.label}</div>
                <div className="text-xs font-semibold leading-snug">{m.value}</div>
              </div>
            ))}
          </div>
        </header>

        <Card className="p-5 border-2 border-accent/40 bg-accent/5 rounded-xl space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-accent">TL;DR</div>
          <MarkdownText content={c.tldr} className="text-sm" />
        </Card>

        {c.background.length > 0 && (
          <Collapsible
            title={`Background: what is ${c.protocol}?`}
            icon={<Boxes className="w-5 h-5 text-accent" />}
            hint="plain English"
            defaultOpen
          >
            <div className="space-y-2.5 pt-1">
              {c.background.map((b) => (
                <div key={b.label} className="p-3 rounded-lg bg-bg border border-border space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-accent">
                    {b.label}
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed">{b.text}</p>
                </div>
              ))}
            </div>
          </Collapsible>
        )}

        <Collapsible title="The mechanism" icon={<BookText className="w-5 h-5 text-accent" />} defaultOpen>
          <MarkdownText content={c.mechanism} className="text-sm" />
        </Collapsible>

        <Collapsible
          title="The Investigator's Playbook"
          icon={<Fingerprint className="w-5 h-5 text-accent" />}
          hint={`${c.researchMethod.length} moves`}
          defaultOpen
        >
          <InvestigatorPlaybook steps={c.researchMethod} />
        </Collapsible>

        <Collapsible
          title="Timeline"
          icon={<Clock className="w-5 h-5 text-accent" />}
          hint={`${c.timeline.length} events`}
          defaultOpen
        >
          <div className="space-y-0 pt-1">
            {c.timeline.map((t, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-accent border-2 border-ink mt-1.5" />
                  {i < c.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                </div>
                <div className="pb-5 space-y-1">
                  <div className="font-mono text-[11px] font-bold text-accent">{t.time}</div>
                  <p className="text-sm text-ink-soft leading-relaxed">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </Collapsible>

        {c.actors.length > 0 && (
          <Collapsible
            title="Wallets & accounts"
            icon={<Wallet className="w-5 h-5 text-accent" />}
            hint="who was who"
          >
            <div className="grid gap-3 sm:grid-cols-2 pt-1">
              {c.actors.map((a) => (
                <Card key={a.label} className="p-4 space-y-2 border border-border rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-heading font-bold text-sm">{a.label}</div>
                    {a.addressKind && (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-ink-faint">
                        {a.addressKind}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-accent">{a.role}</div>
                  {a.address && (
                    <div className="font-mono text-[11px] break-all px-2 py-1.5 rounded bg-bg border border-border">
                      {a.address}
                    </div>
                  )}
                  {a.note && <p className="text-xs text-ink-soft leading-relaxed">{a.note}</p>}
                  <div className="flex items-center justify-between pt-1">
                    {a.source ? (
                      <span className="text-[10px] text-ink-faint">Source: {a.source}</span>
                    ) : (
                      <span />
                    )}
                    {a.explorerUrl && (
                      <a
                        href={a.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold uppercase tracking-wide text-accent inline-flex items-center gap-1 hover:underline"
                      >
                        Explorer <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </Collapsible>
        )}

        {c.transactions.length > 0 && (
          <Collapsible
            title="Key moves"
            icon={<Search className="w-5 h-5 text-accent" />}
            hint={`${c.transactions.length} steps`}
          >
            <div className="space-y-3 pt-1">
              {c.transactions.map((t, i) => (
                <Card key={i} className="p-4 space-y-1.5 border border-border rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-heading font-bold text-sm">{t.label}</div>
                    {t.time && <span className="font-mono text-[10px] text-accent">{t.time}</span>}
                  </div>
                  <p className="text-xs text-ink-soft leading-relaxed">{t.description}</p>
                  {t.signature && (
                    <div className="font-mono text-[11px] break-all px-2 py-1.5 rounded bg-bg border border-border">
                      {t.signature}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </Collapsible>
        )}

        <Collapsible
          title="Red flags you could have spotted"
          icon={<TriangleAlert className="w-5 h-5 text-danger" />}
          hint={`${c.redFlags.length}`}
          defaultOpen
        >
          <div className="space-y-2 pt-1">
            {c.redFlags.map((f, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-danger/5 border border-danger/30">
                <TriangleAlert className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-ink leading-relaxed">{f}</p>
              </div>
            ))}
          </div>
        </Collapsible>

        {(c.replay || c.bridgeReplay) && (
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-accent" /> Replay the attack
            </h2>
            {c.replay && <CaseReplay replay={c.replay} protocol={c.protocol} />}
            {c.bridgeReplay && <BridgeReplay replay={c.bridgeReplay} protocol={c.protocol} />}
          </section>
        )}

        {c.labLink && (
          <section className="space-y-3">
            <Card className="p-5 border-2 border-ink rounded-xl shadow-pop bg-surface space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-accent" />
                <h2 className="font-heading font-bold text-base">Replay it in the sandbox</h2>
              </div>
              <p className="text-sm text-ink-soft leading-relaxed">
                Don&apos;t just read it - do it. {c.labLabel ?? 'The matching lab'} lets you pull the
                same levers the attacker used and watch it unfold. Safe, simulated, and free.
              </p>
              <Link href={c.labLink}>
                <Button variant="primary" className="gap-2">
                  <FlaskConical className="w-4 h-4" /> Open {c.labLabel ?? 'the lab'}
                </Button>
              </Link>
            </Card>
          </section>
        )}

        <Collapsible title="Sources" icon={<ExternalLink className="w-5 h-5 text-accent" />}>
          <ul className="space-y-2 pt-1">
            {c.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-accent inline-flex items-start gap-1.5 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {s.label}
                </a>
              </li>
            ))}
          </ul>
        </Collapsible>

        <Disclaimer />
      </main>
    </div>
  );
}
