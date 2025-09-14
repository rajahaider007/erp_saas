import React, { useState } from 'react';
import { Code, Database, AlertCircle, Server } from 'lucide-react';

const DebugPanel = ({ lastSubmittedData, errors = {}, requestStatus, responseData }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-8 border rounded-lg overflow-hidden">
      <div
        className="bg-gray-800 text-white p-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Code className="w-5 h-5 mr-2" />
          <span>Debug Information</span>
        </div>
        <span>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-black font-semibold mb-2 flex items-center">
                <Database className="w-4 h-4 mr-1" />
                Last Submitted Data
              </h3>
              <pre className="bg-black text-white p-3 rounded border text-sm overflow-auto max-h-40">
                {JSON.stringify(lastSubmittedData || {}, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-black font-semibold mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                Validation Errors
              </h3>
              <pre className="bg-black text-white p-3 rounded border text-sm overflow-auto max-h-40">
                {Object.keys(errors).length > 0 ? JSON.stringify(errors, null, 2) : 'No validation errors'}
              </pre>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2 flex items-center">
              <Server className="w-4 h-4 mr-1" />
              Request Status
            </h3>
            <div className="bg-black text-white p-3 rounded border text-sm">
              <p><strong>Status:</strong> {requestStatus || 'Not sent'}</p>
              {responseData && (
                <>
                  <p><strong>Response:</strong></p>
                  <pre className="mt-1 overflow-auto max-h-32">{JSON.stringify(responseData, null, 2)}</pre>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;


