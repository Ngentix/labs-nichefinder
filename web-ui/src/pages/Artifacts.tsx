import { useState, useEffect } from 'react';
import { Package, FileCode, RefreshCw } from 'lucide-react';
import { ArtifactList } from '../components/artifacts/ArtifactList';
import { ArtifactPreview } from '../components/artifacts/ArtifactPreview';
import { WorkflowDefinition } from '../components/artifacts/WorkflowDefinition';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorMessage } from '../components/shared/ErrorMessage';
import { apiClient } from '../api/client';

interface Artifact {
  id: string;
  filename: string;
  size: number;
  source: string;
  execution_id: string;
  created_at: string;
  mime_type: string;
}

type Tab = 'artifacts' | 'workflow';

export function Artifacts() {
  const [activeTab, setActiveTab] = useState<Tab>('artifacts');
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const workflowId = 'homeassistant-analysis';

  useEffect(() => {
    loadArtifacts();
  }, []);

  const loadArtifacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response: any = await apiClient.getArtifacts();
      setArtifacts(response.artifacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load artifacts');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (artifact: Artifact) => {
    setSelectedArtifact(artifact);
  };

  const handleDownload = (artifact: Artifact) => {
    // Download will be handled by the preview modal
    setSelectedArtifact(artifact);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Artifacts & Workflow
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Browse raw data artifacts and workflow definitions
          </p>
        </div>
        {activeTab === 'artifacts' && (
          <button
            onClick={loadArtifacts}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('artifacts')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'artifacts'
            ? 'border-primary text-primary dark:text-primary'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          <Package className="w-5 h-5" />
          <span className="font-medium">Data Artifacts</span>
          {artifacts.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
              {artifacts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'workflow'
            ? 'border-primary text-primary dark:text-primary'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
        >
          <FileCode className="w-5 h-5" />
          <span className="font-medium">Workflow Definition</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'artifacts' && (
        <>
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          )}

          {error && <ErrorMessage message={error} />}

          {!loading && !error && (
            <ArtifactList
              artifacts={artifacts}
              onPreview={handlePreview}
              onDownload={handleDownload}
            />
          )}
        </>
      )}

      {activeTab === 'workflow' && (
        <WorkflowDefinition workflowId={workflowId} />
      )}

      {/* Preview Modal */}
      {selectedArtifact && (
        <ArtifactPreview
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
        />
      )}
    </div>
  );
}

