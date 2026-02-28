import Link from 'next/link'

type CTABannerProps = {
  title: string
  description?: string
  primaryHref?: string
  primaryLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
}

export default function CTABanner({
  title,
  description,
  primaryHref = '/contact',
  primaryLabel = 'Get in touch',
  secondaryHref = '/product',
  secondaryLabel = 'See how it works',
}: CTABannerProps) {
  return (
    <section className="relative overflow-hidden bg-ink px-4 py-20 sm:px-6">
      {/* Subtle gradient accent — guides attention, doesn't overwhelm */}
      <div className="absolute inset-0 bg-accent-gradient-subtle opacity-60" aria-hidden />
      <div className="absolute left-0 top-0 h-full w-1 gradient-accent-bg" aria-hidden />
      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold text-paper sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-5 text-paper/80 leading-relaxed">{description}</p>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-ui bg-paper px-6 py-3 text-base font-semibold text-ink shadow-soft hover:bg-paper-subdued focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-ui border border-white/30 bg-transparent px-6 py-3 text-base font-semibold text-paper hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
