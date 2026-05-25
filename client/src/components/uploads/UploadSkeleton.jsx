const UploadSkeleton = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="glass-card animate-pulse rounded-[1.5rem] p-5">
          <div className="flex gap-4">
            <div className="h-20 w-20 rounded-2xl bg-white/10" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-3/4 rounded-full bg-white/10" />
              <div className="h-3 w-1/2 rounded-full bg-white/10" />
              <div className="h-16 rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadSkeleton;
