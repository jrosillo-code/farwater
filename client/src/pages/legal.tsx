import { SharedHeader } from "@/components/shared-header";

// Privacy + Terms: plain-language legal pages. Collecting emails without a
// posted privacy policy is both a legal exposure and an amateur signal for a
// trust-first brand — these keep it honest and simple.

function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="solid" />
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-32">
        <h1 className="font-display text-3xl font-bold tracking-wide text-foreground">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="prose mt-10 space-y-6 font-serif text-[15px] leading-relaxed text-foreground/85 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-wide [&_h2]:text-foreground">
          {children}
        </div>
      </main>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="September 2026">
      <section>
        <h2>What we collect</h2>
        <p>
          When you join the waitlist we store your email address. When you use the
          contact form we store your name, email, inquiry type, and message. We also
          collect basic, anonymous usage analytics (pages visited, referrer, browser
          type) to understand how the site is used. Messages you send to the
          on-site concierge are processed by an AI provider to generate a reply and
          are not linked to your identity.
        </p>
      </section>
      <section>
        <h2>How we use it</h2>
        <p>
          To contact you about FARWATER departures, respond to your inquiries, and
          improve the site. We do not sell or share your personal information with
          third parties for their marketing.
        </p>
      </section>
      <section>
        <h2>Where it lives</h2>
        <p>
          Data is stored with our infrastructure providers (website hosting and a
          managed database within the EU). It is retained until you ask us to
          delete it.
        </p>
      </section>
      <section>
        <h2>Your choices</h2>
        <p>
          You can request a copy of your data or ask us to delete it at any time —
          use the contact form or write to us, and we will act on it promptly.
        </p>
      </section>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="September 2026">
      <section>
        <h2>About this site</h2>
        <p>
          FARWATER is currently in its founding phase. This site presents
          the brand and collects expressions of interest; it is not a booking
          platform, and nothing on it constitutes an offer of travel services.
          Departure details shown reflect planned trips and may
          change.
        </p>
      </section>
      <section>
        <h2>Waitlist and applications</h2>
        <p>
          Joining the waitlist or requesting access creates no obligation on either
          side. Places in any future cohort are limited and allocated at our
          discretion.
        </p>
      </section>
      <section>
        <h2>Concierge</h2>
        <p>
          The on-site concierge is an AI assistant. Its answers are informational
          and may be imperfect; they are not commitments on behalf of FARWATER.
        </p>
      </section>
      <section>
        <h2>Content</h2>
        <p>
          All text, imagery, film and branding on this site belong to FARWATER
          EXPEDITIONS or their respective owners and may not be reused without
          permission.
        </p>
      </section>
    </LegalShell>
  );
}
