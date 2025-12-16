'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { RequireAuth } from '@/lib/auth';
import { resourceApi } from '@/lib/api';
import type { Resource } from '@/types';

function ResourcesContent() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const data = await resourceApi.getAll();
      setResources(data);
    } catch (err) {
      setError('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-500">Loading resources...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Available Resources</h1>

      {resources.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          No resources available at the moment.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={`/resources/${resource.id}`}
              className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              data-testid={`resource-card-${resource.id}`}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {resource.name}
              </h2>
              {resource.description && (
                <p className="text-gray-600 text-sm">{resource.description}</p>
              )}
              <div className="mt-4 text-blue-600 text-sm font-medium">
                View availability &rarr;
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <RequireAuth>
      <Layout>
        <ResourcesContent />
      </Layout>
    </RequireAuth>
  );
}
