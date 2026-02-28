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
    <section className="bg-slate-900 px-4 py-16 text-white dark:bg-slate-950 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-4 text-slate-300">{description}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
