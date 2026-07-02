export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#F3F2F1] to-white min-h-[600px] animate-pulse">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="h-8 w-40 bg-[#E8E6E4] rounded-full" />
              <div className="h-16 w-full max-w-xl bg-[#E8E6E4] rounded-xl" />
              <div className="h-6 w-full max-w-lg bg-[#E8E6E4] rounded-lg" />
              <div className="h-12 w-48 bg-[#E8E6E4] rounded-lg" />
            </div>
            <div className="aspect-square max-w-md mx-auto w-full bg-[#E8E6E4] rounded-2xl" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-9 w-56 bg-[#E8E6E4] rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-[#F3F2F1] overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-[#E8E6E4]" />
              <div className="p-4 space-y-3">
                <div className="h-7 w-24 bg-[#E8E6E4] rounded" />
                <div className="h-4 w-full bg-[#E8E6E4] rounded" />
                <div className="h-10 w-full bg-[#E8E6E4] rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
