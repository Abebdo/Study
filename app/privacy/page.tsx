export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6 lg:p-10">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground">This policy explains how EduPlatform collects and processes personal data.</p>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">1. Data we collect</h2>
        <p className="text-sm text-muted-foreground">Account information, course activity, and support interactions.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">2. How we use data</h2>
        <p className="text-sm text-muted-foreground">To provide learning services, personalize experience, and secure the platform.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">3. Your controls</h2>
        <p className="text-sm text-muted-foreground">You can update profile details and request support for privacy-related concerns.</p>
      </section>
    </main>
  )
}
