import Image from "next/image";
import {
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandGithub,
  IconMail,
} from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer className="bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 border-t border-gruvbox-gray text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 pt-12 pb-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & tagline */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-gruvbox-yellow-light dark:bg-gruvbox-yellow-dark w-12 h-12 rounded-xl flex items-center justify-center shadow-md">
                <Image
                  src="/oldvibes-small.png"
                  alt="Old Vibes logo"
                  width={500}
                  height={500}
                  className="rounded-md object-contain"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-2xl font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark tracking-tight font-mono">
                  Old Vibes
                </span>
              </div>
            </div>
            <p className="text-gruvbox-gray font-mono text-sm mb-4">
              Share &amp; sell your vintage finds.
            </p>
            {/* Socials */}
            <div className="flex space-x-4 mt-2">
              <a
                href="https://instagram.com/"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gruvbox-orange transition-colors"
              >
                <IconBrandInstagram size={22} />
              </a>
              <a
                href="https://twitter.com/"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gruvbox-orange transition-colors"
              >
                <IconBrandTwitter size={22} />
              </a>
              <a
                href="https://github.com/"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gruvbox-orange transition-colors"
              >
                <IconBrandGithub size={22} />
              </a>
              <a
                href="mailto:hello@oldvibes.com"
                aria-label="Email"
                className="hover:text-gruvbox-orange transition-colors"
              >
                <IconMail size={22} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-4 font-mono">
              Product
            </h3>
            <ul className="space-y-2 text-gruvbox-gray text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#explore"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Explore
                </a>
              </li>
              <li>
                <a
                  href="#download"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Download
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-4 font-mono">
              Company
            </h3>
            <ul className="space-y-2 text-gruvbox-gray text-sm">
              <li>
                <a
                  href="/about"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="/careers"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-gruvbox-orange-light dark:text-gruvbox-orange-dark mb-4 font-mono">
              Support
            </h3>
            <ul className="space-y-2 text-gruvbox-gray text-sm">
              <li>
                <a
                  href="#help"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-gruvbox-orange transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gruvbox-gray mt-8 pt-6 text-center text-gruvbox-gray text-xs font-mono">
          <p>
            &copy; {new Date().getFullYear()} Old Vibes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
