import { DescentShell, PageHead } from "@/components/descent/shell";

// Privacy + Terms: plain-language legal pages. Collecting emails without a
// posted privacy policy is both a legal exposure and an amateur signal for a
// trust-first brand — these keep it honest and simple.

function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <DescentShell chapters={[{ at: 0, label: "Fine print" }]} chat={false} snow={40}>
      <div className="px-6 pb-28 pt-36 lg:pl-24">
        <div className="mx-auto max-w-3xl">
          <PageHead kicker={`Last updated ${updated}`} title={title} />
          <div className="mt-12 space-y-10 font-body text-lg leading-relaxed text-[var(--sea-text)]/85 [&_h2]:coord [&_h2]:text-xs [&_h2]:text-[var(--teal-bright)] [&_p]:mt-3">
            {children}
          </div>
        </div>
      </div>
    </DescentShell>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="September 2026">
      <section>
        <h2>WHAT WE COLLECT</h2>
        <p>
          When you join the waitlist we store your email address. When you use the contact form we store your name, email, inquiry type, and message. We also collect basic, anonymous usage analytics (pages visited, referrer, browser type) to understand how the site is used. Messages you send to the on-site concierge are processed by an AI provider to generate a reply and are not linked to your identity.
        </p>
      </section>
      <section>
        <h2>HOW WE USE IT</h2>
        <p>To contact you about FARWATER departures, respond to your inquiries, and improve the site. We do not sell or share your personal information with third parties for their marketing.</p>
      </section>
      <section>
        <h2>WHERE IT LIVES</h2>
        <p>Data is stored with our infrastructure providers (website hosting and a managed database within the EU). It is retained until you ask us to delete it.</p>
      </section>
      <section>
        <h2>YOUR CHOICES</h2>
        <p>You can request a copy of your data or ask us to delete it at any time — use the contact form or write to us, and we will act on it promptly.</p>
      </section>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms of Use" updated="September 2026">
      <section>
        <h2>ABOUT THIS SITE</h2>
        <p>FARWATER is currently in its founding phase. This site presents the brand and collects expressions of interest; it is not a booking platform, and nothing on it constitutes an offer of travel services. Departure details shown reflect planned trips and may change.</p>
      </section>
      <section>
        <h2>WAITLIST AND APPLICATIONS</h2>
        <p>Joining the waitlist or requesting access creates no obligation on either side. Places in any future cohort are limited and allocated at our discretion.</p>
      </section>
      <section>
        <h2>CONCIERGE</h2>
        <p>The on-site concierge is an AI assistant. Its answers are informational and may be imperfect; they are not commitments on behalf of FARWATER.</p>
      </section>
      <section>
        <h2>CONTENT</h2>
        <p>All text, imagery, film and branding on this site belong to FARWATER EXPEDITIONS or their respective owners and may not be reused without permission.</p>
      </section>
    </LegalShell>
  );
}
