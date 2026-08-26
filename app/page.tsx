export default function Home() {
  return (
    <main className="bg-white">
      <section
        aria-label="van-garf"
        className="relative isolate h-[100svh] overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/blue-paint.png')" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.08) 55%, white 100%)",
          }}
        />
        <div className="relative z-10 mx-auto flex h-[100svh] max-w-[90rem] flex-col px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-5">
          <header className="flex items-center justify-between">
            <img alt="van-garf" className="h-auto w-24 sm:w-32" src="/van-garf.png" />
            <a
              className="impasto-button inline-flex h-8 w-28 items-center justify-center px-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:h-9 sm:w-32 sm:text-xs"
              href="#contact"
            >
              Contact us
            </a>
          </header>

          <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center py-8 text-center sm:py-10">
            <div className="mx-auto max-w-3xl">
              <h1 className="font-display text-balance text-3xl font-normal tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
                Making the everyday extraordinary.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-sm leading-6 text-slate-800 sm:text-base sm:leading-7">
                A new perspective, shaped with intention.
              </p>
              <a
                className="impasto-button mt-5 inline-flex h-11 w-36 items-center justify-center px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 sm:mt-6 sm:h-12 sm:w-40"
                href="#contact"
              >
                Contact us
              </a>
            </div>

            <div
              aria-label="Gallery placeholder"
              className="mt-8 h-[clamp(12rem,32svh,26rem)] w-full rounded-2xl border border-white/40 bg-slate-300/90 shadow-[0_24px_70px_rgb(15_23_42_/_0.16)] sm:mt-10"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
