export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50">
      <section
        aria-label="van-garf"
        className="relative min-h-[33svh] overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/yellow-paint.png')" }}
      >
        <div aria-hidden="true" className="absolute inset-0 bg-black/5" />
        <header className="relative p-6 sm:p-9">
          <img alt="van-garf" className="h-auto w-44 sm:w-60" src="/van-garf.png" />
        </header>
      </section>
    </main>
  );
}
