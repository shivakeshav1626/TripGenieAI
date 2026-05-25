const ItinerarySkeleton = () => {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="glass-card animate-pulse rounded-[1.75rem] p-5">
          <div className="space-y-4">
            <div className="h-4 w-28 rounded-full bg-white/10" />
            <div className="h-8 w-3/4 rounded-2xl bg-white/10" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-24 rounded-2xl bg-white/10" />
              <div className="h-24 rounded-2xl bg-white/10" />
            </div>
            <div className="h-12 rounded-2xl bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItinerarySkeleton;