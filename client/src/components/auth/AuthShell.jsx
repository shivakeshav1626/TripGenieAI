import { Link } from "react-router-dom";
import { Compass, MapPin, Plane, Sparkles } from "lucide-react";

const AuthShell = ({
  heroHeading,
  heroDescription,
  cardTitle,
  cardSubtitle,
  footerText,
  footerLinkTo,
  footerLinkLabel,
  mobileHint,
  mobileHintLinkTo,
  mobileHintLinkLabel,
  children,
}) => {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(212,175,55,0.035)_0,rgba(212,175,55,0.035)_1px,transparent_1px,transparent_44px)]" />
      <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[32rem] w-[32rem] rounded-full bg-luxury-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-14%] top-[-12%] h-[34rem] w-[34rem] rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-[1280px] items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative flex flex-col justify-center py-6 lg:py-10">
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-luxury-300/40 bg-luxury-500/10 text-luxury-200">
              <Compass className="h-5 w-5" />
            </div>
            <p className="text-[2rem] font-black tracking-tight text-white">
              TripGenie <span className="text-luxury-300">AI</span>
            </p>
          </div>

          <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">{heroHeading}</h1>

          <p className="mt-8 max-w-lg text-2xl leading-relaxed text-slate-300/90">{heroDescription}</p>

          <div className="pointer-events-none relative mt-14 h-52 max-w-2xl rounded-[2.5rem] border border-luxury-300/10 bg-gradient-to-b from-luxury-500/5 to-transparent">
            <Plane className="absolute right-24 top-8 h-8 w-8 rotate-12 text-luxury-300/35" />
            <MapPin className="absolute right-36 bottom-12 h-8 w-8 text-luxury-300/35" />
            <Sparkles className="absolute left-10 top-8 h-8 w-8 text-luxury-300/35" />
            <div className="absolute bottom-0 left-0 right-0 h-24 rounded-b-[2.5rem] bg-gradient-to-t from-luxury-500/10 to-transparent" />
          </div>
        </section>

        <section className="rounded-[2rem] border border-luxury-500/15 bg-card-800/85 p-6 backdrop-blur-2xl sm:p-10 shadow-soft">
          <div className="space-y-2">
            <h2 className="text-5xl font-black tracking-tight text-white">{cardTitle}</h2>
            <p className="text-lg text-slate-400">{cardSubtitle}</p>
          </div>

          <div className="mt-10">{children}</div>

          <p className="mt-9 text-center text-lg text-slate-400">
            {footerText}{" "}
            <Link to={footerLinkTo} className="font-semibold text-luxury-300 transition hover:text-luxury-200">
              {footerLinkLabel}
            </Link>
          </p>
        </section>
      </div>

      <div className="mt-4 text-center lg:hidden">
        <span className="text-sm text-slate-400">{mobileHint} </span>
        <Link to={mobileHintLinkTo} className="text-sm font-semibold text-luxury-300">
          {mobileHintLinkLabel}
        </Link>
      </div>
    </div>
  );
};

export default AuthShell;
