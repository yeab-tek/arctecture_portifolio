import ContactForm from '../components/ContactForm'

export default function Contact() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 sm:py-20">
      <p className="label-eyebrow mb-3">Get in touch</p>
      <h1 className="font-display text-3xl font-semibold text-ink">Start a conversation</h1>
      <p className="mt-3 text-ink-muted">
        Tell us a little about your project — site, scope, timeline — and we'll follow up
        with next steps.
      </p>
      <div className="mt-10">
        <ContactForm />
      </div>
    </div>
  )
}
