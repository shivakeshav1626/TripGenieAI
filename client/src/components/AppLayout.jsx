import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

const AppLayout = () => {
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-96 w-96 rounded-full bg-luxury-500/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-32 h-80 w-80 rounded-full bg-luxury-300/8 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
