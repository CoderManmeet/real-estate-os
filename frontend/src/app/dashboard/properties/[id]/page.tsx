'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bed, Bath, Ruler, MapPin, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { Property } from '@/types/property';
import { PropertyDocument } from '@/types/document';
import { getPropertyRequest } from '@/lib/api/property-api';
import { listDocumentsRequest, deleteDocumentRequest } from '@/lib/api/document-api';
import { DocumentUpload } from '@/components/documents/document-upload';
import { DocumentList } from '@/components/documents/document-list';

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [propertyData, docsData] = await Promise.all([
        getPropertyRequest(params.id),
        listDocumentsRequest(params.id),
      ]);
      setProperty(propertyData);
      setDocuments(docsData);
    } catch {
      toast.error('Property not found');
      router.push('/dashboard/properties');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDeleteDocument(id: string) {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocumentRequest(id);
      toast.success('Document deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete document');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!property) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <MapPin size={13} /> {property.address}, {property.city}, {property.state}
          </p>
        </div>
        <Link
          href={`/dashboard/properties/${property.id}/edit`}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Pencil size={14} /> Edit
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
          {formatPrice(property.price)}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1"><Bed size={14} /> {property.bedrooms}</span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
          )}
          {property.areaSqft != null && (
            <span className="flex items-center gap-1"><Ruler size={14} /> {property.areaSqft} sqft</span>
          )}
        </div>
        {property.description && (
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{property.description}</p>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Documents</h2>
        <DocumentUpload propertyId={property.id} onUploaded={fetchData} />
        <div className="mt-4">
          <DocumentList documents={documents} onDelete={handleDeleteDocument} />
        </div>
      </div>
    </div>
  );
}