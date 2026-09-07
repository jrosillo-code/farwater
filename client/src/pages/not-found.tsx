import { Link } from "wouter";
import { SharedHeader } from "@/components/shared-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="solid" />
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="coord text-xs uppercase tracking-[0.3em] text-primary">Off the chart</span>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-wide text-foreground">
          No water at this position.
        </h1>
        <p className="mt-4 max-w-md font-serif italic text-muted-foreground">
          Even good charts have blank corners. Let&apos;s get you back to known water.
        </p>
        <Link
          href="/"
          className="mt-8 border border-primary px-8 py-3 font-display text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Back to the chart
        </Link>
      </main>
    </div>
  );
}
