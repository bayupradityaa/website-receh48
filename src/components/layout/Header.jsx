import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";

export function Header() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navClass = (active) =>
    `px-4 py-2 rounded-xl font-semibold transition-all ${
      active
        ? "bg-white/10 text-amber-200 border border-white/15 shadow-[0_12px_40px_-25px_rgba(255,215,130,0.6)]"
        : "text-white/70 hover:text-white hover:bg-white/10"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* background layer */}
      <div className="absolute inset-0 bg-[#06070A]/80 backdrop-blur-xl border-b border-white/10" />

      {/* subtle glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 left-24 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -top-14 right-20 w-72 h-72 rounded-full bg-primary-600/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              {/* glow ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/60 via-primary-500/40 to-yellow-200/40 blur-lg opacity-70 group-hover:opacity-95 transition-opacity" />
              <div className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-br from-amber-300 via-primary-500 to-yellow-200">
                <div className="w-full h-full rounded-full bg-black/60" />
              </div>

              <img
                src="https://pbs.twimg.com/profile_images/1810271835117981696/ypceIB66_400x400.jpg"
                alt="Receh48 Logo"
                className="absolute inset-[3px] rounded-full object-cover shadow-[0_18px_55px_-35px_rgba(255,215,130,0.55)] group-hover:scale-[1.03] transition-transform"
              />
            </div>

            <span className="text-xl sm:text-2xl font-display font-extrabold tracking-tight">
              <span className="text-white">Receh</span>
              <span className="bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                48
              </span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <Link to="/" className={navClass(isActive("/"))}>
              Home
            </Link>
            <Link to="/video-call" className={navClass(isActive("/video-call"))}>
              Joki Video Call
            </Link>
            <Link to="/meet-greet" className={navClass(isActive("/meet-greet"))}>
              Joki Meet n Greet
            </Link>
            <Link to="/twoshot" className={navClass(isActive("/twoshot"))}>
              Joki 2-Shoot
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {profile?.role === "admin" && (
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold rounded-xl"
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}

                <div className="flex items-center gap-2">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                    <span className="text-amber-200 text-sm font-extrabold">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold rounded-xl"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-white/60 text-sm font-semibold">Guest</div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
