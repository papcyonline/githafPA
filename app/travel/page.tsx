'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

const mockTrips = [
  {
    id: '1',
    destination: 'Dubai, UAE',
    dates: 'Feb 15 - Feb 20, 2024',
    status: 'upcoming',
    flights: { outbound: 'EK202', inbound: 'EK203' },
    hotel: 'Burj Al Arab',
    transfers: true,
  },
  {
    id: '2',
    destination: 'London, UK',
    dates: 'Mar 10 - Mar 15, 2024',
    status: 'planning',
    flights: null,
    hotel: null,
    transfers: false,
  },
]

const mockRecentBookings = [
  { id: '1', type: 'flight', details: 'EK202 - Dubai', date: 'Jan 20, 2024', amount: '$450' },
  { id: '2', type: 'hotel', details: 'Burj Al Arab - 5 nights', date: 'Jan 20, 2024', amount: '$2,500' },
  { id: '3', type: 'transfer', details: 'Airport Transfer - Dubai', date: 'Jan 20, 2024', amount: '$80' },
]

export default function TravelPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Travel Booking</h1>
            <p className="text-gray-500 mt-1">Book flights, hotels, and airport transfers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#A855F7] hover:bg-[#9333EA] px-4 py-2.5 rounded-full font-semibold transition-all inline-flex items-center gap-2 text-white"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Plan Trip
          </button>
        </div>

        {/* Quick Book Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-6 text-left transition-colors group">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Book Flight</h3>
            <p className="text-sm text-gray-500">Search and book flights worldwide</p>
          </button>

          <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-6 text-left transition-colors group">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Book Hotel</h3>
            <p className="text-sm text-gray-500">Find perfect accommodations</p>
          </button>

          <button className="bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl p-6 text-left transition-colors group">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Airport Transfer</h3>
            <p className="text-sm text-gray-500">Book pickup and drop-off</p>
          </button>
        </div>

        {/* Upcoming Trips */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Trips</h2>
          <div className="space-y-4">
            {mockTrips.map((trip) => (
              <div key={trip.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{trip.destination}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        trip.status === 'upcoming' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {trip.status === 'upcoming' ? 'Upcoming' : 'Planning'}
                      </span>
                    </div>
                    <p className="text-gray-500 mt-1">{trip.dates}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className={`flex items-center gap-1 text-sm ${trip.flights ? 'text-green-600' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        {trip.flights ? 'Flight booked' : 'No flight'}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${trip.hotel ? 'text-green-600' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {trip.hotel || 'No hotel'}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${trip.transfers ? 'text-green-600' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        {trip.transfers ? 'Transfer booked' : 'No transfer'}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Details</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockRecentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        booking.type === 'flight' ? 'bg-blue-100 text-blue-600' :
                        booking.type === 'hotel' ? 'bg-green-100 text-green-600' :
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{booking.details}</td>
                    <td className="px-4 py-3 text-gray-500">{booking.date}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{booking.amount}</td>
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
