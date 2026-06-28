import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  ArrowRight,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-earth-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-black text-xs">V</span>
              </div>
              <span className="text-base font-bold font-heading text-gray-900 tracking-tight">
                Viciniti
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Empowering local economies by connecting neighbors for trade and
              professional services. Your community, simplified.
            </p>
            <div className="flex space-x-3 mt-5">
              {[
                { icon: <Instagram className="w-4 h-4" />, href: "#" },
                { icon: <Twitter className="w-4 h-4" />, href: "#" },
                { icon: <Facebook className="w-4 h-4" />, href: "#" },
                { icon: <Linkedin className="w-4 h-4" />, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-8 h-8 rounded-full bg-earth-50 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-4">
              Marketplace
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Buy Items", href: "/browse/items" },
                { name: "Hire Services", href: "/browse/services" },
                { name: "Sell an Item", href: "/dashboard/listings/create" },
                { name: "Offer a Service", href: "/dashboard/services/create" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary-600 text-xs font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-4">
              Account
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Login", href: "/login" },
                { name: "Sign Up", href: "/signup" },
                { name: "Dashboard", href: "/dashboard" },
                { name: "Safety Center", href: "/safety" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary-600 text-xs font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-1">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-[0.15em] mb-4">
              Stay Updated
            </h3>
            <p className="text-gray-500 text-xs mb-3">
              Get the latest local deals and news.
            </p>
            <form className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full border border-earth-300 rounded-lg py-2 px-3 text-xs focus:outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              <button
                type="submit"
                className="cursor-pointer absolute right-1.5 top-1 p-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors shadow-sm"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-earth-100 flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} Viciniti Inc.
            </p>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Terms
            </Link>
          </div>
          <div className="flex items-center text-gray-400 text-xs italic">
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            hello@viciniti.local
          </div>
        </div>
      </div>
    </footer>
  );
}
