export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-display font-bold mb-3">Receh48</h3>
            <p className="text-dark-300 text-sm">
              Layanan joki video call terpercaya untuk fans JKT48. Aman, cepat, dan profesional.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Layanan</h4>
            <ul className="space-y-2 text-sm text-dark-300">
              <li>
                <a href="/video-call" className="hover:text-white transition-colors">Joki Video Call</a>
              </li>
              <li>
                <a href="/meet-greet" className="hover:text-white transition-colors">Joki Meet N Greet</a>
              </li>
              <li>
                <a href="/twoshot" className="hover:text-white transition-colors">Joki 2Shoot</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm text-dark-300">
              <li>Email: jokireceh48@gmail.com</li>
              <li>Twitter: @receh_48</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-800 mt-8 pt-8 text-center text-sm text-dark-400">
          <p>&copy; {currentYear} Receh48. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}