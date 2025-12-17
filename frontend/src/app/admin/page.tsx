'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Alert from '@/components/Alert';
import { RequireAdmin } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import type { Resource, Booking } from '@/types';
import { AxiosError } from 'axios';
import type { ApiError } from '@/types';

function AdminContent() {
  const [activeTab, setActiveTab] = useState<'resources' | 'bookings'>('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [resourceName, setResourceName] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceActive, setResourceActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [filterResourceId, setFilterResourceId] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeTab === 'resources') {
        const data = await adminApi.getAllResources();
        setResources(data);
      } else {
        const params = filterResourceId ? { resourceId: filterResourceId } : undefined;
        const data = await adminApi.getAllBookings(params);
        setBookings(data);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filterResourceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (activeTab === 'bookings' && resources.length === 0) {
      adminApi.getAllResources().then(setResources).catch(() => {});
    }
  }, [activeTab, resources.length]);

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      if (editingResource) {
        await adminApi.updateResource(editingResource.id, {
          name: resourceName,
          description: resourceDescription || undefined,
          active: resourceActive,
        });
        setSuccess('Resource updated successfully');
      } else {
        await adminApi.createResource({
          name: resourceName,
          description: resourceDescription || undefined,
          active: resourceActive,
        });
        setSuccess('Resource created successfully');
      }
      resetResourceForm();
      loadData();
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to save resource');
    } finally {
      setIsSaving(false);
    }
  };

  const resetResourceForm = () => {
    setShowResourceForm(false);
    setEditingResource(null);
    setResourceName('');
    setResourceDescription('');
    setResourceActive(true);
  };

  const startEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setResourceName(resource.name);
    setResourceDescription(resource.description || '');
    setResourceActive(resource.active);
    setShowResourceForm(true);
  };

  const handleCancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await adminApi.cancelBooking(id);
      setSuccess('Booking cancelled successfully');
      loadData();
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Resources
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Bookings
          </button>
        </nav>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : activeTab === 'resources' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Manage Resources</h2>
            {!showResourceForm && (
              <Button onClick={() => setShowResourceForm(true)}>
                Add Resource
              </Button>
            )}
          </div>

          {showResourceForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingResource ? 'Edit Resource' : 'New Resource'}
              </h3>
              <form onSubmit={handleResourceSubmit} className="space-y-4">
                <Input
                  id="name"
                  label="Name"
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={resourceDescription}
                    onChange={(e) => setResourceDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={resourceActive}
                    onChange={(e) => setResourceActive(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Active (visible to users)
                  </label>
                </div>
                <div className="flex space-x-4">
                  <Button type="submit" isLoading={isSaving}>
                    {editingResource ? 'Update' : 'Create'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetResourceForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {resources.map((resource) => (
                  <tr key={resource.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{resource.name}</div>
                      {resource.description && (
                        <div className="text-sm text-gray-500">
                          {resource.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          resource.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {resource.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="secondary"
                        onClick={() => startEditResource(resource)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center space-x-4 mb-6">
            <h2 className="text-lg font-semibold">All Bookings</h2>
            <select
              id="filter-resource"
              aria-label="Filter by resource"
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              value={filterResourceId}
              onChange={(e) => setFilterResourceId(e.target.value)}
            >
              <option value="">All Resources</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {bookings.length === 0 ? (
            <div className="text-gray-500 text-center py-12">
              No bookings found.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {booking.resource.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {booking.user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>{format(parseISO(booking.startAt), 'MMM d, yyyy')}</div>
                        <div>
                          {format(parseISO(booking.startAt), 'HH:mm')} -{' '}
                          {format(parseISO(booking.endAt), 'HH:mm')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            booking.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {booking.status === 'ACTIVE' && (
                          <Button
                            variant="danger"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAdmin>
      <Layout>
        <AdminContent />
      </Layout>
    </RequireAdmin>
  );
}
