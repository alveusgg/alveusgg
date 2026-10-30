const NonprofitStatus = () => (
  <div className="hidden gap-4 text-sm lg:grid lg:pt-8">
    <div className="relative rounded-lg border border-white/20 px-4 py-3">
      <p className="absolute top-0 left-2 -translate-y-1/2 bg-alveus-green px-2 py-1 text-xs tracking-wide text-alveus-tan/75 uppercase">
        Tax-exempt status
      </p>
      <p className="text-lg font-bold">501(c)(3) nonprofit</p>
    </div>

    <div className="relative rounded-lg border border-white/20 px-4 py-3">
      <p className="absolute top-0 left-2 -translate-y-1/2 bg-alveus-green px-2 py-1 text-xs tracking-wide text-alveus-tan/75 uppercase">
        EIN
      </p>
      <p className="text-lg font-bold">86-1772907</p>
    </div>
  </div>
);

export default NonprofitStatus;
