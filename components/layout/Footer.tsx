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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 mb-6">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-black text-sm">V</span>
              </div>
              <span className="text-xl font-bold font-heading text-gray-900 tracking-tight">
                Viciniti
              </span>
            </Link>
            <p className="text-gray-500 text-base leading-relaxed max-w-sm">
              Empowering local economies by connecting neighbors for trade and
              professional services. Your community, simplified.
            </p>
            <div className="flex space-x-4 mt-8">
              {[
                { icon: <Instagram className="w-5 h-5" />, href: "#" },
                { icon: <Twitter className="w-5 h-5" />, href: "#" },
                { icon: <Facebook className="w-5 h-5" />, href: "#" },
                { icon: <Linkedin className="w-5 h-5" />, href: "#" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-earth-50 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Marketplace Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-[0.15em] mb-6">
              Marketplace
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Buy Items", href: "/browse/items" },
                { name: "Hire Services", href: "/browse/services" },
                { name: "Sell an Item", href: "/dashboard/listings/create" },
                { name: "Offer a Service", href: "/dashboard/services/create" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary-600 text-[15px] font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-[0.15em] mb-6">
              Account
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Login", href: "/login" },
                { name: "Sign Up", href: "/signup" },
                { name: "Dashboard", href: "/dashboard" },
                { name: "Safety Center", href: "/safety" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary-600 text-[15px] font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="lg:col-span-1">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-[0.15em] mb-6">
              Stay Updated
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Get the latest local deals and news.
            </p>
            <form className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full border border-earth-300 rounded-xl py-3 px-4 text-sm focus:outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              <button
                type="submit"
                className="cursor-pointer absolute right-2 top-1.5 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-earth-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Viciniti Inc.
            </p>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Terms
            </Link>
          </div>
          <div className="flex items-center text-gray-400 text-sm italic">
            <Mail className="w-4 h-4 mr-2" />
            hello@viciniti.local
          </div>
        </div>
      </div>
    </footer>
  );
}
