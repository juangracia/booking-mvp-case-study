'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, addHours, parseISO, startOfDay } from 'date-fns';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Alert from '@/components/Alert';
import { RequireAuth } from '@/lib/auth';
import { resourceApi, bookingApi } from '@/lib/api';
import type { Resource, AvailabilitySlot } from '@/types';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

function ResourceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;

  const [resource, setResource] = useState<Resource | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadResource();
  }, [resourceId]);

  useEffect(() => {
    if (resource) {
      loadAvailability();
    }
  }, [selectedDate, resource]);

  const loadResource = async () => {
    try {
      const data = await resourceApi.getById(resourceId);
      setResource(data);
    } catch (err) {
      setError('Failed to load resource');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const data = await resourceApi.getAvailability(resourceId, selectedDate);
      setAvailability(data);
    } catch (err) {
      console.error('Failed to load availability');
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsBooking(true);

    const startAt = new Date(`${selectedDate}T${startTime}:00.000Z`).toISOString();
    const endAt = new Date(`${selectedDate}T${endTime}:00.000Z`).toISOString();

    try {
      await bookingApi.create({
        resourceId,
        startAt,
        endAt,
        notes: notes || undefined,
      });
      setSuccess('Booking created successfully!');
      setNotes('');
      loadAvailability();
      setTimeout(() => {
        router.push('/bookings');
      }, 1500);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message || 'Failed to create booking'
      );
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        Resource not found
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-gray-600 hover:text-gray-900 mb-6"
      >
        &larr; Back to resources
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{resource.name}</h1>
        {resource.description && (
          <p className="text-gray-600">{resource.description}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Check Availability
          </h2>
          <Input
            id="date"
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={format(new Date(), 'yyyy-MM-dd')}
          />

          {availability.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Booked slots on {format(parseISO(selectedDate), 'MMM d, yyyy')}:
              </h3>
              <div className="space-y-2">
                {availability.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-red-50 text-red-800 px-3 py-2 rounded text-sm"
                  >
                    {format(parseISO(slot.startAt), 'HH:mm')} -{' '}
                    {format(parseISO(slot.endAt), 'HH:mm')}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-green-600">
              No bookings on this date - fully available!
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create Booking
          </h2>

          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleBooking} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="startTime"
                label="Start Time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <Input
                id="endTime"
                label="End Time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your booking..."
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isBooking}
              data-testid="create-booking-button"
            >
              Create Booking
            </Button>

            <p className="text-xs text-gray-500">
              Note: Maximum booking duration is 8 hours. All times are in UTC.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResourceDetailPage() {
  return (
    <RequireAuth>
      <Layout>
        <ResourceDetailContent />
      </Layout>
    </RequireAuth>
  );
}
