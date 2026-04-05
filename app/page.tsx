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
      <section className="relative overflow-hidden bg-earth-50 py-16 md:py-24 lg:py-32">
        {/* Subtle decorative background element */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-20 pointer-events-none">
          <div className="aspect-square w-64 md:w-125 rounded-full bg-primary-400" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white border border-primary-100 text-primary-700 px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-6 md:mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
              Global Local Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-heading text-gray-900 tracking-tight leading-[1.1]">
              Your Neighborhood,
              <span className="block text-primary-500">Everywhere.</span>
            </h1>

            <p className="mt-6 md:mt-8 text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto px-2">
              The seamless way to buy, sell, and hire. Connect with trusted
              locals for services or items—whether you're at home or traveling.
            </p>

            <div className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link
                href="/browse/items"
                className="btn-primary text-base md:text-lg px-8 md:px-10 py-4 flex items-center justify-center gap-2 group shadow-xl shadow-primary-500/20"
              >
                Browse Items
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/browse/services"
                className="btn-outline bg-white text-base md:text-lg px-8 md:px-10 py-4 flex items-center justify-center gap-2 shadow-sm"
              >
                Hire Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How Viciniti Works
            </h2>
            <div className="mt-4 h-1.5 w-16 md:w-20 bg-primary-500 mx-auto rounded-full" />
            <p className="mt-6 text-gray-500 text-base md:text-lg">
              Simple, secure, and community-driven.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: <MapPin className="w-8 h-8 text-primary-600" />,
                title: "Set Your Location",
                description:
                  "Tell us where you are and we'll curate the best local listings and services in your immediate area.",
              },
              {
                icon: <ShoppingBag className="w-8 h-8 text-primary-600" />,
                title: "Buy, Sell or Hire",
                description:
                  "List items you no longer need or find skilled professionals for everything from plumbing to design.",
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-primary-600" />,
                title: "Pay Securely",
                description:
                  "Transactions are protected with our integrated payment system and comprehensive money-back guarantee.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative p-6 md:p-8 rounded-3xl border border-gray-100 bg-white hover:border-primary-100 hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-earth-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-12 gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Popular Categories
              </h2>
              <p className="mt-3 md:mt-4 text-gray-500 text-base md:text-lg">
                Explore a wide range of goods and services near you.
              </p>
            </div>
            <Link
              href="/categories"
              className="text-primary-600 font-semibold flex items-center gap-2 hover:underline text-sm md:text-base"
            >
              View All Categories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
                className="flex flex-col items-center p-6 md:p-8 bg-white rounded-2xl border border-transparent shadow-sm hover:shadow-md hover:border-primary-200 hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="text-gray-400 group-hover:text-primary-500 transition-colors mb-3 md:mb-4 scale-110 md:scale-125">
                  {category.icon}
                </div>
                <p className="text-sm md:text-base text-gray-800 font-bold group-hover:text-primary-700 text-center">
                  {category.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto bg-primary-600 rounded-4xl md:rounded-[3rem] p-8 md:p-20 text-center relative overflow-hidden shadow-2xl">
          {/* Abstract circles */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-primary-500 rounded-full opacity-50" />
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-64 h-64 md:w-96 md:h-96 bg-primary-400 rounded-full opacity-20" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to join the community?
            </h2>
            <p className="text-primary-100 text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto">
              Create your account in less than a minute and start connecting
              with people in your area.
            </p>
            <Link
              href="/signup"
              className="inline-block w-full sm:w-auto bg-white text-primary-600 px-8 md:px-10 py-4 rounded-xl md:rounded-2xl text-base md:text-lg font-bold hover:bg-earth-50 transition-all hover:scale-105 shadow-xl"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
