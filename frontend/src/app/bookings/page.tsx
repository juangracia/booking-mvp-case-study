'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import Alert from '@/components/Alert';
import { RequireAuth } from '@/lib/auth';
import { bookingApi } from '@/lib/api';
import type { Booking } from '@/types';

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingApi.getMyBookings();
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancellingId(id);
    try {
      await bookingApi.cancel(id);
      await loadBookings();
    } catch (err) {
      setError('Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading bookings...</div>
      </div>
    );
  }

  const activeBookings = bookings.filter((b) => b.status === 'ACTIVE');
  const pastBookings = bookings.filter((b) => b.status === 'CANCELLED');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {error && <Alert type="error" message={error} />}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You don&apos;t have any bookings yet.</p>
          <Link href="/resources" className="text-blue-600 hover:text-blue-500">
            Browse resources to create a booking
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {activeBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Active Bookings
              </h2>
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-lg shadow p-6"
                    data-testid={`booking-${booking.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.resource.name}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {format(parseISO(booking.startAt), 'MMM d, yyyy')}
                        </p>
                        <p className="text-gray-600">
                          {format(parseISO(booking.startAt), 'HH:mm')} -{' '}
                          {format(parseISO(booking.endAt), 'HH:mm')} UTC
                        </p>
                        {booking.notes && (
                          <p className="text-gray-500 text-sm mt-2">
                            Notes: {booking.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(booking.id)}
                        isLoading={cancellingId === booking.id}
                        data-testid={`cancel-booking-${booking.id}`}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cancelled Bookings
              </h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gray-50 rounded-lg p-6 opacity-60"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-700">
                          {booking.resource.name}
                        </h3>
                        <p className="text-gray-500 mt-1">
                          {format(parseISO(booking.startAt), 'MMM d, yyyy')}
                        </p>
                        <p className="text-gray-500">
                          {format(parseISO(booking.startAt), 'HH:mm')} -{' '}
                          {format(parseISO(booking.endAt), 'HH:mm')} UTC
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm bg-gray-200 text-gray-600 rounded">
                        Cancelled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <RequireAuth>
      <Layout>
        <BookingsContent />
      </Layout>
    </RequireAuth>
  );
}
