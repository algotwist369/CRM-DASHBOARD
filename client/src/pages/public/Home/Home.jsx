
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaUsers,
} from 'react-icons/fa'
import SearchPlaceholder from './SearchPlaceholder'
import BusinessExplorer from './BusinessExplorer'
import SkeletonHome from './SkeletonHome'
import LazySection from '../../../components/common/LazySection/LazySection'


import {
  FiStar,
  FiUsers,
} from "react-icons/fi";
import {
  GiLotus,
  GiMuscleUp,
  GiHeartInside,
} from "react-icons/gi";
import { MdSpa, MdFaceRetouchingNatural } from "react-icons/md";

// Constants


const FEATURES_DATA = [
  {
    icon: FaCalendarAlt,
    title: 'Online Booking System',
    description: 'Appointment Scheduling System - Book appointments instantly with our location-based platform for spas, salons, hotels & gyms'
  },
  {
    icon: FaClock,
    title: 'Nearby Search & Business Finder',
    description: 'Location-Based Service with real-time availability. Find local businesses near you and schedule visits in seconds'
  },
  {
    icon: FaUsers,
    title: 'Business Management ',
    description: 'Comprehensive  Dashboard for Spa Management, Salon Management, Hotel Management & Gym Management Software'
  }
]

const SERVICES_DATA = [
  { id: 1, title: "Full Body Massage", icon: <MdSpa /> },
  { id: 2, title: "Aromatherapy", icon: <GiLotus /> },
  { id: 3, title: "Deep Tissue", icon: <GiMuscleUp /> },
  { id: 4, title: "Facial Care", icon: <MdFaceRetouchingNatural /> },
  { id: 5, title: "Couple Spa", icon: <GiHeartInside /> },
]

const HERO_IMAGES = [
  { src: "home/full_body.png", title: "Full Body" },
  { src: "home/aroma.png", title: "Aromatherapy" },
  { src: "home/deep_tissue.png", title: "Deep Tissue" },
  { src: "home/spa_and_relaxatiion.png", title: "Spa & Relaxation" },
  { src: "home/Facial_&_Skin_Care.png", title: "Facial & Skin Care" },
  { src: "home/cople.png", title: "Couple Spa" },
  { src: "home/wellness_theropy.png", title: "Wellness Therapy" },
  { src: "home/luxary_spa.png", title: "Luxury Spa" },
]



const Home = () => {
  const navigate = useNavigate()
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start lg:items-center">

          {/* LEFT */}
          <div className="space-y-5 sm:space-y-6">

            {/* Heading */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 leading-tight">
                Professional spa services
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-500">
                Top spa and massage therapists near you
              </p>
            </div>

            {/* Search */}
            <div className="w-full max-w-xl">
              <button
                type='button'
                onClick={() => navigate('/search')}
                className="
                          relative w-full
                          flex items-center
                          pl-11 pr-4
                          py-3 sm:py-3.5
                          bg-white
                          border border-gray-300
                          rounded-md
                          text-sm sm:text-base
                          text-gray-500
                          hover:border-gray-400
                          focus:outline-none
                          transition
                          min-h-[44px]
                          text-left
                        "
              >
                <FaSearch className="absolute left-4 text-gray-400 text-sm sm:text-base" />
                <SearchPlaceholder />
              </button>
            </div>

            {/* Services (desktop only) */}
            <div className="hidden md:block bg-white rounded-xl border divide-y">
              {SERVICES_DATA.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition"
                >
                  <div className="text-xl text-gray-700">
                    {item.icon}
                  </div>
                  <span className="text-gray-800 font-medium">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 pt-2">
              <div className="flex items-center gap-3">
                <FiStar className="text-gray-800 text-lg" />
                <div>
                  <p className="font-semibold text-sm">4.8 / 5</p>
                  <p className="text-xs text-gray-500">Avg rating</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiUsers className="text-gray-800 text-lg" />
                <div>
                  <p className="font-semibold text-sm">12M+</p>
                  <p className="text-xs text-gray-500">Happy users</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div
              className="
          grid grid-cols-12 gap-2
          sm:grid-cols-3 sm:gap-3
          lg:gap-4
        "
            >
              {HERO_IMAGES.map((item, index) => {
                const mobileColSpan =
                  index < 3 ? "col-span-4" : index < 5 ? "col-span-6" : "col-span-4";

                return (
                  <div
                    key={index}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(item.title)}`)}
                    className={`
                relative overflow-hidden rounded-lg border bg-white cursor-pointer hover:shadow-md transition-all duration-200
                ${mobileColSpan}
                sm:col-span-1
              `}
                    style={{ height: 120 }}
                  >
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Mobile text always visible */}
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                      <span
                        className="text-white text-xs font-semibold truncate whitespace-nowrap w-full"
                        title={item.title}
                      >
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Badge */}
            <div className="absolute -bottom-6 left-4 bg-white px-3 py-2 rounded-md shadow flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l2.4 7.4H22l-6 4.3 2.3 7.3L12 16.6 5.7 21l2.3-7.3-6-4.3h7.6L12 2z" />
              </svg>
              <span className="text-xs font-medium">
                Trusted Professionals
              </span>
            </div>
          </div>

        </div>
      </section>

      <div className="min-h-screen bg-gray-100 overflow-x-hidden">
        {/* Businesses Section - Now handled by BusinessExplorer */}
        <LazySection fallback={<SkeletonHome />}>
          <BusinessExplorer />
        </LazySection>

        {/* Features Section */}
        <div className="bg-white border-t border-gray-200 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              {FEATURES_DATA.map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div key={idx} className="px-2">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="text-primary-600 text-lg sm:text-xl" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
