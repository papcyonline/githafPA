'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockRecentRides = [
  { id: '1', service: 'Uber', from: 'Home', to: 'Airport', date: 'Jan 20, 2024', amount: '$45', status: 'completed' },
  { id: '2', service: 'Careem', from: 'Office', to: 'Dubai Mall', date: 'Jan 18, 2024', amount: '$25', status: 'completed' },
  { id: '3', service: 'Private', from: 'Hotel', to: 'Business Center', date: 'Jan 15, 2024', amount: '$60', status: 'completed' },
]

const savedLocations = [
  { id: '1', name: 'Home', address: '123 Main Street, Downtown' },
  { id: '2', name: 'Office', address: '456 Business Park, Tech City' },
  { id: '3', name: 'Airport', address: 'International Airport Terminal 3' },
]

export default function TransportPage() {
  const [showBooking, setShowBooking] = useState(false)

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Transport</h1>
            <p className="text-gray-500 mt-1">Book Uber, Careem, or private chauffeur</p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Book Ride
          </button>
        </div>

        {/* Service Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button className="bg-black hover:bg-gray-900 text-white rounded-xl p-6 text-left transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">U</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">Uber</h3>
            <p className="text-sm text-gray-300">Quick and reliable rides</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-white/10 rounded">UberX</span>
              <span className="px-2 py-1 bg-white/10 rounded">Comfort</span>
              <span className="px-2 py-1 bg-white/10 rounded">Black</span>
            </div>
          </button>

          <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl p-6 text-left transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold">C</span>
            </div>
            <h3 className="font-semibold text-lg mb-1">Careem</h3>
            <p className="text-sm text-green-100">Popular in Middle East</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-white/10 rounded">Go</span>
              <span className="px-2 py-1 bg-white/10 rounded">Business</span>
              <span className="px-2 py-1 bg-white/10 rounded">Kids</span>
            </div>
          </button>

          <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl p-6 text-left transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-lg mb-1">Private Chauffeur</h3>
            <p className="text-sm text-purple-100">Premium service</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-white/10 rounded">Hourly</span>
              <span className="px-2 py-1 bg-white/10 rounded">Daily</span>
              <span className="px-2 py-1 bg-white/10 rounded">Events</span>
            </div>
          </button>
        </div>

        {/* Quick Book */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Book</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Pickup Location</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter pickup location"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-2">Drop-off Location</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Enter destination"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Search Rides
            </button>
          </div>
        </div>

        {/* Saved Locations */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Saved Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedLocations.map((location) => (
              <div key={location.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-purple-300 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{location.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{location.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Rides */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Rides</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Service</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Route</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockRecentRides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        ride.service === 'Uber' ? 'bg-gray-900 text-white' :
                        ride.service === 'Careem' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {ride.service}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      <span className="text-gray-500">{ride.from}</span>
                      <span className="mx-2">→</span>
                      <span>{ride.to}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{ride.date}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{ride.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
