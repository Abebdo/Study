export default function TermsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6 lg:p-10">
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="text-sm text-muted-foreground">These terms govern use of EduPlatform services.</p>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">1. Accounts</h2>
        <p className="text-sm text-muted-foreground">You are responsible for your account credentials and activity under your account.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">2. Content and conduct</h2>
        <p className="text-sm text-muted-foreground">Users must not upload unlawful content or abuse communication features.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">3. Billing</h2>
        <p className="text-sm text-muted-foreground">Paid subscriptions and course purchases follow the pricing shown at checkout.</p>
      </section>
    </main>
  )
}
