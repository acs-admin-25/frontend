/**
 * File: app/case-studies/page.tsx
 * Purpose: Renders the case studies page showcasing real estate success stories and AI-powered solutions.
 * Author: Alejo Cagliolo
 * Date: 5/25/25
 * Version: 1.0.0
 */

"use client"

import type React from "react"
import Image from "next/image"
import { Star, TrendingUp, BarChart2, MessageSquare, Users, ArrowUpRight, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import "aos/dist/aos.css"
import AOS from "aos"
import Navbar from "@/components/common/Navigation/Navbar"
import Footer from "../Footer"

/**
 * CaseStudiesPage Component
 * 
 * A comprehensive landing page showcasing real estate case studies and AI solutions.
 * Features include:
 * - Interactive case study filtering
 * - Animated statistics and testimonials
 * - Featured success stories
 * - AI tools showcase
 * 
 * @returns {JSX.Element} The rendered case studies page
 */
export default function CaseStudiesPage() {
  const [activeFilter, setActiveFilter] = useState("All")

  // Case studies data
  const caseStudies = [
    {
      id: 1,
      category: "Conversation AI",
      title: "Summit Properties",
      image: "/placeholder.svg?height=192&width=400&text=Summit+Properties",
      stats: [
        { value: "90%", label: "Response Time" },
        { value: "24/7", label: "Availability" },
        { value: "42%", label: "More Leads" },
      ],
      avatar: { initials: "MC", name: "Michael Chen", role: "Managing Broker" },
    },
    {
      id: 2,
      category: "Pricing AI",
      title: "Urban Homes",
      image: "/placeholder.svg?height=192&width=400&text=Urban+Homes",
      stats: [
        { value: "15%", label: "Higher Prices" },
        { value: "22%", label: "Faster Sales" },
        { value: "98%", label: "Accuracy" },
      ],
      avatar: { initials: "SJ", name: "Sarah Johnson", role: "Director of Operations" },
    },
    {
      id: 3,
      category: "Marketing AI",
      title: "Luxury Estates",
      image: "/placeholder.svg?height=192&width=400&text=Luxury+Estates",
      stats: [
        { value: "3x", label: "Marketing ROI" },
        { value: "60%", label: "More Leads" },
        { value: "45%", label: "Cost Reduction" },
      ],
      avatar: { initials: "RP", name: "Robert Patel", role: "Marketing Director" },
    },
  ]

  /**
   * Filters case studies based on the selected category
   * @type {Array} Array of filtered case study objects
   */
  const filteredCaseStudies =
    activeFilter === "All" ? caseStudies : caseStudies.filter((study) => study.category === activeFilter)

  /**
   * Card Component
   * A reusable card container with consistent styling
   * 
   * @param {Object} props - Component props
   * @param {string} props.className - Additional CSS classes
   * @param {React.ReactNode} props.children - Child elements
   * @returns {JSX.Element} Card container
   */
  const Card = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
      <div className={`bg-white rounded-lg border border-gray-100 ${className}`} {...props}>
        {children}
      </div>
    )
  }

  /**
   * CardContent Component
   * Container for card content with consistent padding
   * 
   * @param {Object} props - Component props
   * @param {string} props.className - Additional CSS classes
   * @param {React.ReactNode} props.children - Child elements
   * @returns {JSX.Element} Card content container
   */
  const CardContent = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
      <div className={`p-6 ${className}`} {...props}>
        {children}
      </div>
    )
  }

  /**
   * Avatar Component
   * Circular container for user avatars
   * 
   * @param {Object} props - Component props
   * @param {string} props.className - Additional CSS classes
   * @param {React.ReactNode} props.children - Child elements
   * @returns {JSX.Element} Avatar container
   */
  const Avatar = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
      <div className={`relative inline-block rounded-full overflow-hidden ${className}`} {...props}>
        {children}
      </div>
    )
  }

  /**
   * AvatarImage Component
   * Image component for avatars with fallback support
   * 
   * @param {Object} props - Component props
   * @param {string} props.src - Image source URL
   * @param {string} props.alt - Image alt text
   * @param {string} props.className - Additional CSS classes
   * @returns {JSX.Element} Avatar image
   */
  const AvatarImage = ({ src, alt, className = "", ...props }: { src: string; alt: string; className?: string }) => {
    return (
      <Image
        src={src || "/placeholder.svg"}
        alt={alt || "Avatar"}
        width={40}
        height={40}
        className={`h-full w-full object-cover ${className}`}
        {...props}
      />
    )
  }

  /**
   * AvatarFallback Component
   * Fallback display for avatars when image fails to load
   * 
   * @param {Object} props - Component props
   * @param {string} props.className - Additional CSS classes
   * @param {React.ReactNode} props.children - Child elements
   * @returns {JSX.Element} Avatar fallback display
   */
  const AvatarFallback = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-100 text-gray-600 ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }

  /**
   * Badge Component
   * Small label component for categories and tags
   * 
   * @param {Object} props - Component props
   * @param {string} props.className - Additional CSS classes
   * @param {React.ReactNode} props.children - Child elements
   * @returns {JSX.Element} Badge element
   */
  const Badge = ({ className = "", children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }

  /**
   * Button Component
   * Reusable button with consistent styling
   * 
   * @param {Object} props - Component props
   * @param {string} props.className - Additional CSS classes
   * @param {React.ReactNode} props.children - Child elements
   * @returns {JSX.Element} Button element
   */
  const Button = ({ className = "", children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-md px-4 py-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }

  // Initialize AOS (Animate On Scroll) library
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-out",
      once: true,
    })
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar/>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#0a5a2f] via-[#0e6537] to-[#157a42] text-white">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a5a2f] via-[#0e6537] to-[#157a42]"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <Badge className="bg-white/20 text-green-900 hover:bg-white/30 mb-4">Success Stories</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              <span className="text-white">AI-Powered</span> <span className="text-white">Success</span>{" "}
              <span className="text-white">in Real Estate</span>
            </h1>
            <p className="text-green-50 text-lg">
              Transforming property professionals into market leaders through intelligent technology
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(0 0 0 / 0.02)%27%3e%3cpath d=%27M0 .5H31.5V32%27/%3e%3c/svg%3e')] bg-[size:30px_30px]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0e6537] to-[#157a42] flex items-center justify-center text-green-50 group-hover:from-[#0a5a2f] group-hover:to-[#0e6537] transition-all duration-300">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-[#0e6537] transition-all duration-300">
                    75%
                  </p>
                  <p className="text-gray-500 text-sm">More Listings</p>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0e6537] to-[#157a42] flex items-center justify-center text-green-50 group-hover:from-[#0a5a2f] group-hover:to-[#0e6537] transition-all duration-300">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-[#0e6537] transition-all duration-300">
                    3.2x
                  </p>
                  <p className="text-gray-500 text-sm">ROI on AI</p>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0e6537] to-[#157a42] flex items-center justify-center text-green-50 group-hover:from-[#0a5a2f] group-hover:to-[#0e6537] transition-all duration-300">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-[#0e6537] transition-all duration-300">
                    90%
                  </p>
                  <p className="text-gray-500 text-sm">Faster Response</p>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0e6537] to-[#157a42] flex items-center justify-center text-green-50 group-hover:from-[#0a5a2f] group-hover:to-[#0e6537] transition-all duration-300">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-[#0e6537] transition-all duration-300">
                    $42M+
                  </p>
                  <p className="text-gray-500 text-sm">Property Value</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Case Study */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div
            className="bg-gradient-to-b from-[#f0f9f4] via-[#e6f5ec] to-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg"
            data-aos="fade-up"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 md:p-12">
                <Badge className="bg-[#0e6537] text-white hover:bg-[#0e6537] mb-4">Featured Success</Badge>
                <h2 className="text-2xl md:text-3xl font-bold text-[#002417] mb-4">Coastal Luxury Properties</h2>
                <p className="text-gray-600 mb-6">
                  From struggling boutique agency to market leader in ultra-luxury properties
                </p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-2xl font-bold text-[#0e6537]">75%</p>
                    <p className="text-gray-500 text-xs">Listing Growth</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-2xl font-bold text-[#0e6537]">$4.2M</p>
                    <p className="text-gray-500 text-xs">Avg. Sale Price</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-2xl font-bold text-[#0e6537]">3.2x</p>
                    <p className="text-gray-500 text-xs">ROI</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <Avatar className="h-12 w-12 border-2 border-[#0e6537]/20">
                    <AvatarImage src="/placeholder.svg?height=48&width=48&text=JM" alt="Jennifer Martinez" />
                    <AvatarFallback className="bg-[#0e6537]/10 text-[#0e6537]">JM</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-[#0e6537] text-[#0e6537]" />
                      ))}
                    </div>
                    <p className="text-gray-900 font-medium">Jennifer Martinez</p>
                    <p className="text-gray-500 text-sm">CEO, Coastal Luxury Properties</p>
                  </div>
                </div>

                <Button className="bg-[#0e6537] text-white hover:bg-[#0e6537]">View Full Case Study</Button>
              </div>

              <div className="relative h-[300px] md:h-auto">
                <Image
                  src="/placeholder.svg?height=400&width=600&text=Luxury+Property+Tech"
                  alt="Luxury Property with Tech"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-white/60 md:bg-gradient-to-r"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Grid */}
      <section className="py-16 bg-gradient-to-b from-[#e6f5ec] via-[#f0f9f4] to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-bold text-[#002417]">Success Stories</h2>
            <div className="flex gap-2">
              {["All", "Pricing AI", "Conversation AI", "Marketing AI"].map((filter) => (
                <Badge
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeFilter === filter
                      ? "bg-gradient-to-r from-[#0a5a2f] to-[#0e6537] text-white hover:from-[#0e6537] hover:to-[#157a42]"
                      : "bg-white hover:bg-gray-100 text-[#0e6537] border border-[#0e6537]/20 hover:border-[#0e6537]/40"
                  }`}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredCaseStudies.map((study, index) => (
              <Card
                key={study.id}
                className="overflow-hidden hover:shadow-lg hover:border-[#0e6537]/30 transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={100 * (index + 1)}
              >
                <div className="relative h-48">
                  <Image src={study.image || "/placeholder.svg"} alt={study.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[#0e6537] text-white hover:bg-[#0e6537]">{study.category}</Badge>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-[#002417] text-lg group-hover:text-[#0e6537] transition-all duration-300">
                      {study.title}
                    </h3>
                    <ArrowUpRight className="h-4 w-4 text-[#0e6537] opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-4">
                    {study.stats.map((stat, statIndex) => (
                      <div key={statIndex} className="bg-gradient-to-br from-[#e6f5ec] to-[#f0f9f4] p-3 rounded-lg">
                        <p className="text-lg font-bold text-[#0e6537]">{stat.value}</p>
                        <p className="text-gray-500 text-xs">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`/placeholder-40x40.png?height=40&width=40&text=${study.avatar.initials}`}
                        alt={study.avatar.name}
                      />
                      <AvatarFallback className="bg-[#0e6537]/10 text-[#0e6537]">
                        {study.avatar.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{study.avatar.name}</p>
                      <p className="text-xs text-gray-500">{study.avatar.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCaseStudies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No case studies found for the selected category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(0 0 0 / 0.02)%27%3e%3cpath d=%27M0 .5H31.5V32%27/%3e%3c/svg%3e')] bg-[size:30px_30px]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <Badge className="bg-[#0e6537] text-white hover:bg-[#0e6537] mb-2">Testimonials</Badge>
            <h2 className="text-2xl font-bold text-[#002417] mb-4">Client Testimonials</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear directly from real estate professionals who have transformed their businesses with our AI tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg hover:border-[#0e6537]/30 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="flex justify-between mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-[#0e6537] text-[#0e6537]" />
                  ))}
                </div>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#0e6537]/20"
                >
                  <path
                    d="M9.33333 21.3333C9.33333 23.9107 7.244 26 4.66667 26C2.08934 26 0 23.9107 0 21.3333C0 18.756 2.08934 16.6667 4.66667 16.6667C4.84667 16.6667 5.02 16.6813 5.19067 16.7013C5.84934 13.524 8.63067 11.1427 12 11.1427V14.476C12 15.8853 13.144 17.0293 14.5533 17.0293C15.9627 17.0293 17.1067 15.8853 17.1067 14.476V8C17.1067 6.59067 15.9627 5.44667 14.5533 5.44667H8.07733C6.668 5.44667 5.524 6.59067 5.524 8C5.524 9.40933 6.668 10.5533 8.07733 10.5533C7.04267 11.7387 6.39733 13.2507 6.26933 14.9093C5.74 14.7853 5.212 14.6667 4.66667 14.6667C1.02667 14.6667 0 18.6667 0 18.6667C0 18.6667 1.02667 21.3333 4.66667 21.3333C7.244 21.3333 9.33333 23.4227 9.33333 21.3333ZM27.3333 14.6667C26.788 14.6667 26.26 14.7853 25.7307 14.9093C25.6027 13.2507 24.9573 11.7387 23.9227 10.5533C25.332 10.5533 26.476 9.40933 26.476 8C26.476 6.59067 25.332 5.44667 23.9227 5.44667H17.4467C16.0373 5.44667 14.8933 6.59067 14.8933 8V14.476C14.8933 15.8853 16.0373 17.0293 17.4467 17.0293C18.856 17.0293 20 15.8853 20 14.476V11.1427C23.3693 11.1427 26.1507 13.524 26.8093 16.7013C26.98 16.6813 27.1533 16.6667 27.3333 16.6667C29.9107 16.6667 32 18.756 32 21.3333C32 23.9107 29.9107 26 27.3333 26C24.756 26 22.6667 23.9107 22.6667 21.3333C22.6667 23.4227 24.756 21.3333 27.3333 21.3333C30.9733 21.3333 32 18.6667 32 18.6667C32 18.6667 30.9733 14.6667 27.3333 14.6667Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <p className="text-gray-600 italic mb-6">
                "The AI pricing tool got me 15% more than I expected for my listings. It's like having a market analyst
                on staff 24/7."
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-[#0e6537]/20">
                  <AvatarImage src="/placeholder.svg?height=40&width=40&text=SJ" alt="Sarah Johnson" />
                  <AvatarFallback className="bg-[#0e6537]/10 text-[#0e6537]">SJ</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#002417]">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Urban Homes</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg hover:border-[#0e6537]/30 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex justify-between mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-[#0e6537] text-[#0e6537]" />
                  ))}
                </div>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#0e6537]/20"
                >
                  <path
                    d="M9.33333 21.3333C9.33333 23.9107 7.244 26 4.66667 26C2.08934 26 0 23.9107 0 21.3333C0 18.756 2.08934 16.6667 4.66667 16.6667C4.84667 16.6667 5.02 16.6813 5.19067 16.7013C5.84934 13.524 8.63067 11.1427 12 11.1427V14.476C12 15.8853 13.144 17.0293 14.5533 17.0293C15.9627 17.0293 17.1067 15.8853 17.1067 14.476V8C17.1067 6.59067 15.9627 5.44667 14.5533 5.44667H8.07733C6.668 5.44667 5.524 6.59067 5.524 8C5.524 9.40933 6.668 10.5533 8.07733 10.5533C7.04267 11.7387 6.39733 13.2507 6.26933 14.9093C5.74 14.7853 5.212 14.6667 4.66667 14.6667C1.02667 14.6667 0 18.6667 0 18.6667C0 18.6667 1.02667 21.3333 4.66667 21.3333C7.244 21.3333 9.33333 23.4227 9.33333 21.3333ZM27.3333 14.6667C26.788 14.6667 26.26 14.7853 25.7307 14.9093C25.6027 13.2507 24.9573 11.7387 23.9227 10.5533C25.332 10.5533 26.476 9.40933 26.476 8C26.476 6.59067 25.332 5.44667 23.9227 5.44667H17.4467C16.0373 5.44667 14.8933 6.59067 14.8933 8V14.476C14.8933 15.8853 16.0373 17.0293 17.4467 17.0293C18.856 17.0293 20 15.8853 20 14.476V11.1427C23.3693 11.1427 26.1507 13.524 26.8093 16.7013C26.98 16.6813 27.1533 16.6667 27.3333 16.6667C29.9107 16.6667 32 18.756 32 21.3333C32 23.9107 29.9107 26 27.3333 26C24.756 26 22.6667 23.9107 22.6667 21.3333C22.6667 23.4227 24.756 21.3333 27.3333 21.3333C30.9733 21.3333 32 18.6667 32 18.6667C32 18.6667 30.9733 14.6667 27.3333 14.6667Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <p className="text-gray-600 italic mb-6">
                "Our agents now focus only on the most promising leads, increasing productivity by 85%. The AI lead
                scoring is incredibly accurate."
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-[#0e6537]/20">
                  <AvatarImage src="/placeholder.svg?height=40&width=40&text=AR" alt="Amanda Rodriguez" />
                  <AvatarFallback className="bg-[#0e6537]/10 text-[#0e6537]">AR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#002417]">Amanda Rodriguez</p>
                  <p className="text-xs text-gray-500">Metro Realty</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg hover:border-[#0e6537]/30 transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex justify-between mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-[#0e6537] text-[#0e6537]" />
                  ))}
                </div>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-[#0e6537]/20"
                >
                  <path
                    d="M9.33333 21.3333C9.33333 23.9107 7.244 26 4.66667 26C2.08934 26 0 23.9107 0 21.3333C0 18.756 2.08934 16.6667 4.66667 16.6667C4.84667 16.6667 5.02 16.6813 5.19067 16.7013C5.84934 13.524 8.63067 11.1427 12 11.1427V14.476C12 15.8853 13.144 17.0293 14.5533 17.0293C15.9627 17.0293 17.1067 15.8853 17.1067 14.476V8C17.1067 6.59067 15.9627 5.44667 14.5533 5.44667H8.07733C6.668 5.44667 5.524 6.59067 5.524 8C5.524 9.40933 6.668 10.5533 8.07733 10.5533C7.04267 11.7387 6.39733 13.2507 6.26933 14.9093C5.74 14.7853 5.212 14.6667 4.66667 14.6667C1.02667 14.6667 0 18.6667 0 18.6667C0 18.6667 1.02667 21.3333 4.66667 21.3333C7.244 21.3333 9.33333 23.4227 9.33333 21.3333ZM27.3333 14.6667C26.788 14.6667 26.26 14.7853 25.7307 14.9093C25.6027 13.2507 24.9573 11.7387 23.9227 10.5533C25.332 10.5533 26.476 9.40933 26.476 8C26.476 6.59067 25.332 5.44667 23.9227 5.44667H17.4467C16.0373 5.44667 14.8933 6.59067 14.8933 8V14.476C14.8933 15.8853 16.0373 17.0293 17.4467 17.0293C18.856 17.0293 20 15.8853 20 14.476V11.1427C23.3693 11.1427 26.1507 13.524 26.8093 16.7013C26.98 16.6813 27.1533 16.6667 27.3333 16.6667C29.9107 16.6667 32 18.756 32 21.3333C32 23.9107 29.9107 26 27.3333 26C24.756 26 22.6667 23.9107 22.6667 21.3333C22.6667 23.4227 24.756 21.3333 27.3333 21.3333C30.9733 21.3333 32 18.6667 32 18.6667C32 18.6667 30.9733 14.6667 27.3333 14.6667Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <p className="text-gray-600 italic mb-6">
                "The AI chatbot handles routine questions perfectly and knows exactly when to bring us in. Our response
                time went from hours to seconds."
              </p>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-[#0e6537]/20">
                  <AvatarImage src="/placeholder.svg?height=40&width=40&text=DR" alt="David Rodriguez" />
                  <AvatarFallback className="bg-[#0e6537]/10 text-[#0e6537]">DR</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-[#002417]">David Rodriguez</p>
                  <p className="text-xs text-gray-500">Greenfield Developments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tools */}
      <section className="py-16 bg-gradient-to-b from-[#0a5a2f] via-[#0e6537] to-[#157a42]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-12 text-center">Our AI-Powered Solutions</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div
              className="bg-white p-6 rounded-xl border border-[#0e6537]/20 shadow-md hover:shadow-lg transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f5ec] to-[#f0f9f4] flex items-center justify-center mb-4 text-[#0e6537] group-hover:from-[#d8eee1] group-hover:to-[#e6f5ec] transition-all duration-300">
                <BarChart2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#002417] mb-2 group-hover:text-[#0e6537] transition-all duration-300">
                Pricing Prediction
              </h3>
              <p className="text-gray-600 text-sm">AI-powered market analysis for optimal pricing strategies</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-[#0e6537] text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>98% accuracy rate</span>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl border border-[#0e6537]/20 shadow-md hover:shadow-lg transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f5ec] to-[#f0f9f4] flex items-center justify-center mb-4 text-[#0e6537] group-hover:from-[#d8eee1] group-hover:to-[#e6f5ec] transition-all duration-300">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#002417] mb-2 group-hover:text-[#0e6537] transition-all duration-300">
                Conversation Management
              </h3>
              <p className="text-gray-600 text-sm">Intelligent chatbots and automated client engagement</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-[#0e6537] text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>24/7 client support</span>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f5ec] to-[#f0f9f4] flex items-center justify-center mb-4 text-[#0e6537] group-hover:from-[#d8eee1] group-hover:to-[#e6f5ec] transition-all duration-300">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#002417] mb-2 group-hover:text-[#0e6537] transition-all duration-300">
                Marketing Optimization
              </h3>
              <p className="text-gray-600 text-sm">Data-driven campaigns that target the right audience</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-[#0e6537] text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>3x average ROI</span>
                </div>
              </div>
            </div>

            <div
              className="bg-white p-6 rounded-xl border border-[#0e6537]/20 shadow-md hover:shadow-lg transition-all duration-300 group"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#e6f5ec] to-[#f0f9f4] flex items-center justify-center mb-4 text-[#0e6537] group-hover:from-[#d8eee1] group-hover:to-[#e6f5ec] transition-all duration-300">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#002417] mb-2 group-hover:text-[#0e6537] transition-all duration-300">
                Lead Scoring
              </h3>
              <p className="text-gray-600 text-sm">Intelligent prioritization of your most valuable prospects</p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-[#0e6537] text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>85% conversion increase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Logos */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <p className="text-center text-[#002417] mb-8 text-sm uppercase tracking-wider font-medium">
            Trusted by leading real estate companies
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {[1, 2, 3, 4, 5].map((logo) => (
              <div key={logo} className="h-12 w-24 bg-[#0e6537]/5 rounded-md flex items-center justify-center">
                <div className="w-16 h-6 bg-[#0e6537]/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-b from-[#0a5a2f] via-[#0e6537] to-[#157a42]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center" data-aos="fade-up">
            <h2 className="text-3xl font-bold mb-4">
              <span className="text-white">Ready to Transform Your Real Estate Business?</span>
            </h2>
            <p className="text-green-50 mb-8">
              Join the growing number of real estate professionals leveraging AI to achieve unprecedented results.
            </p>
            <Button className="bg-[#0e6537] text-white hover:bg-[#0e6537] px-8 py-3 text-lg">Schedule a Demo</Button>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  )
}

/**
 * Change Log:
 * 5/25/25 - Initial version
 * - Created case studies page with interactive filtering
 * - Added animated statistics and testimonials
 * - Implemented featured success stories section
 * - Added AI tools showcase
 * - Integrated AOS for scroll animations
 */
