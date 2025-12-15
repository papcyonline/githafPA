'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockReservations = [
  {
    id: '1',
    restaurant: 'La Petite Maison',
    date: 'Feb 14, 2024',
    time: '7:30 PM',
    guests: 2,
    status: 'confirmed',
    type: 'dinner',
  },
  {
    id: '2',
    restaurant: 'Nobu Dubai',
    date: 'Feb 20, 2024',
    time: '8:00 PM',
    guests: 4,
    status: 'pending',
    type: 'dinner',
  },
  {
    id: '3',
    restaurant: 'The Maine',
    date: 'Feb 25, 2024',
    time: '1:00 PM',
    guests: 6,
    status: 'confirmed',
    type: 'lunch',
  },
]

const favoriteRestaurants = [
  { id: '1', name: 'La Petite Maison', cuisine: 'French', rating: 4.8, priceRange: '$$$$' },
  { id: '2', name: 'Zuma', cuisine: 'Japanese', rating: 4.7, priceRange: '$$$$' },
  { id: '3', name: 'Nusr-Et', cuisine: 'Steakhouse', rating: 4.5, priceRange: '$$$$' },
  { id: '4', name: 'Tresind Studio', cuisine: 'Indian', rating: 4.9, priceRange: '$$$$' },
]

export default function ReservationsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Reservations</h1>
            <p className="text-gray-500 mt-1">Book restaurant tables and manage reservations</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Reservation
          </button>
        </div>

        {/* Quick Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Find a Restaurant</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Restaurant or Cuisine</label>
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Time</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>7:00 PM</option>
                <option>7:30 PM</option>
                <option>8:00 PM</option>
                <option>8:30 PM</option>
                <option>9:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Guests</label>
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>2 people</option>
                <option>3 people</option>
                <option>4 people</option>
                <option>5 people</option>
                <option>6+ people</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reservations</h2>
          <div className="space-y-4">
            {mockReservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{reservation.restaurant}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          reservation.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {reservation.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {reservation.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {reservation.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {reservation.guests} guests
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">
                      Modify
                    </button>
                    <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Restaurants */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Favorite Restaurants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer">
                <div className="w-full h-24 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-3">
                  <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-gray-600">{restaurant.rating}</span>
                  </div>
                  <span className="text-sm text-gray-400">{restaurant.priceRange}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
