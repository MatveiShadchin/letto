export default function CatalogLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-9 w-64 bg-[#E8E6E4] rounded-lg mb-2" />
        <div className="h-5 w-80 bg-[#E8E6E4] rounded mb-8" />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4 h-96 bg-[#F5F5F3] rounded-lg" />
          <div className="lg:w-3/4">
            <div className="h-20 bg-white rounded-lg border border-[#F3F2F1] mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-[#F3F2F1] overflow-hidden">
                  <div className="aspect-square bg-[#E8E6E4]" />
                  <div className="p-4 space-y-3">
                    <div className="h-7 w-24 bg-[#E8E6E4] rounded" />
                    <div className="h-4 w-full bg-[#E8E6E4] rounded" />
                    <div className="h-10 w-full bg-[#E8E6E4] rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
