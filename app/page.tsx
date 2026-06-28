import MainLayout from "@/components/layout/MainLayout";
import Link from "next/link";
import {
  MapPin,
  ShoppingBag,
  ShieldCheck,
  Smartphone,
  Shirt,
  Home,
  Car,
  Monitor,
  Wrench,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Viciniti — Local Community Marketplace",
  description:
    "Buy and sell items, hire and offer local services in your community. Viciniti connects people near you in Lagos and across Nigeria.",
};

export default function LandingPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-earth-50 py-10 md:py-16 lg:py-20">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-square w-48 md:w-96 rounded-full bg-primary-400" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white border border-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-xs font-medium mb-4 md:mb-6 shadow-sm">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
              Global Local Marketplace
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-gray-900 tracking-tight leading-[1.1]">
              Your Neighborhood,
              <span className="block text-primary-500">Everywhere.</span>
            </h1>

            <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
              The seamless way to buy, sell, and hire. Connect with trusted
              locals for services or items—whether you're at home or traveling.
            </p>

            <div className="mt-7 md:mt-9 flex flex-col sm:flex-row gap-3 justify-center px-4">
              <Link
                href="/browse/items"
                className="btn-primary text-sm md:text-base px-6 md:px-8 py-3 flex items-center justify-center gap-2 group shadow-xl shadow-primary-500/20"
              >
                Browse Items
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/browse/services"
                className="btn-outline bg-white text-sm md:text-base px-6 md:px-8 py-3 flex items-center justify-center gap-2 shadow-sm"
              >
                Hire Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-10 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              How Viciniti Works
            </h2>
            <div className="mt-3 h-1 w-12 md:w-16 bg-primary-500 mx-auto rounded-full" />
            <p className="mt-4 text-gray-500 text-sm md:text-base">
              Simple, secure, and community-driven.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <MapPin className="w-5 h-5 text-primary-600" />,
                title: "Set Your Location",
                description:
                  "Tell us where you are and we'll curate the best local listings and services in your immediate area.",
              },
              {
                icon: <ShoppingBag className="w-5 h-5 text-primary-600" />,
                title: "Buy, Sell or Hire",
                description:
                  "List items you no longer need or find skilled professionals for everything from plumbing to design.",
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-primary-600" />,
                title: "Pay Securely",
                description:
                  "Transactions are protected with our integrated payment system and comprehensive money-back guarantee.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative p-4 md:p-6 rounded-2xl border border-gray-100 bg-white hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-10 md:py-16 bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-7 md:mb-10 gap-3">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Popular Categories
              </h2>
              <p className="mt-2 md:mt-3 text-gray-500 text-sm md:text-base">
                Explore a wide range of goods and services near you.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-primary-600 font-semibold flex items-center gap-1.5 hover:underline text-xs md:text-sm"
            >
              View All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { icon: <Smartphone />, name: "Electronics" },
              { icon: <Shirt />, name: "Fashion" },
              { icon: <Home />, name: "Home & Garden" },
              { icon: <Car />, name: "Vehicles" },
              { icon: <Monitor />, name: "Technology" },
              { icon: <Wrench />, name: "Repairs" },
              { icon: <BookOpen />, name: "Tutoring" },
              { icon: <Sparkles />, name: "Cleaning" },
            ].map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 md:p-5 bg-white rounded-xl border border-transparent shadow-sm hover:shadow-md hover:border-primary-200 hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="text-gray-400 group-hover:text-primary-500 transition-colors mb-2 md:mb-3">
                  {category.icon}
                </div>
                <p className="text-xs md:text-sm text-gray-800 font-bold group-hover:text-primary-700 text-center">
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-14 px-4">
        <div className="max-w-6xl mx-auto bg-primary-600 rounded-3xl md:rounded-[2rem] p-6 md:p-14 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-36 h-36 md:w-52 md:h-52 bg-primary-500 rounded-full opacity-50" />
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-48 h-48 md:w-72 md:h-72 bg-primary-400 rounded-full opacity-20" />

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to join the community?
            </h2>
            <p className="text-primary-100 text-sm md:text-base mb-6 md:mb-8 max-w-2xl mx-auto">
              Create your account in less than a minute and start connecting
              with people in your area.
            </p>
            <Link
              href="/signup"
              className="inline-block w-full sm:w-auto bg-white text-primary-600 px-6 md:px-8 py-3 rounded-xl text-sm md:text-base font-bold hover:bg-earth-50 transition-all hover:scale-105 shadow-xl"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
