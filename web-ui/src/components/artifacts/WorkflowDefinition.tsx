import { useState, useEffect } from 'react';
import { FileCode, Copy, Check, Download } from 'lucide-react';
import { CodeViewer } from '../shared/CodeViewer';
import { apiClient } from '../../api/client';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';

interface WorkflowDefinitionProps {
  workflowId: string;
}

export function WorkflowDefinition({ workflowId }: WorkflowDefinitionProps) {
  const [definition, setDefinition] = useState<string>('');
  const [workflowName, setWorkflowName] = useState<string>('');
  const [format, setFormat] = useState<string>('json');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadWorkflowDefinition();
  }, [workflowId]);

  const loadWorkflowDefinition = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getWorkflowDefinition(workflowId);
      setDefinition(data.definition);
      setWorkflowName(data.name);
      setFormat(data.format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow definition');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(definition);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([definition], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowId}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {workflowName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              PEG Workflow Definition ({format.toUpperCase()})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Definition Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <CodeViewer
          code={definition}
          language={format}
          maxHeight="600px"
          showLineNumbers={true}
        />
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              About PEG Workflows
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This workflow definition describes the data collection pipeline using the PEG (Pipeline Execution Graph) engine.
              It defines actors (connectors), steps (operations), and dependencies between them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

