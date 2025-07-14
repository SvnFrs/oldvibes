import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 border-b border-gruvbox-gray sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and tagline */}
          <div className="flex items-center space-x-3">
            <div className="bg-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
              <Image
                src="/oldvibes-small.png"
                alt="Meaningful logo"
                width={500}
                height={500}
                className="rounded-md object-contain"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark tracking-tight font-mono">
                Old Vibes
              </h1>
              <span className="block text-sm text-gruvbox-gray font-bold -mt-1">
                Share &amp; sell your vintage finds
              </span>
            </div>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a
              href="#features"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#explore"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Explore
            </a>
            <a
              href="#download"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Download
            </a>
            <a
              href="#contact"
              className="text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 hover:text-gruvbox-orange transition-colors font-medium"
            >
              Contact
            </a>
            <a
              href="#post"
              className="ml-4 px-4 py-2 rounded-lg bg-gruvbox-orange text-gruvbox-bg font-bold shadow hover:bg-gruvbox-yellow transition"
            >
              Post Your Vibe
            </a>
          </nav>
          {/* Mobile menu placeholder */}
          <div className="md:hidden">
            {/* You can add a hamburger menu here if needed */}
          </div>
        </div>
      </div>
    </header>
  );
}
