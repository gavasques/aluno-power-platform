
<div className="bg-gray-900 text-white p-4 rounded-lg">
  <h3 className="text-lg font-bold mb-4">🔧 System Health Dashboard</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* WebSocket Status */}
    <div className="bg-gray-800 p-3 rounded">
      <h4 className="font-semibold text-blue-400">WebSocket</h4>
      <div className="flex items-center gap-2 mt-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </div>
      {connectionAttempts > 0 && (
        <div className="text-sm text-yellow-400 mt-1">
          Attempts: {connectionAttempts}
        </div>
      )}
      {lastError && (
        <div className="text-sm text-red-400 mt-1">
          Error: {lastError}
        </div>
      )}
    </div>

    {/* API Status */}
    <div className="bg-gray-800 p-3 rounded">
      <h4 className="font-semibold text-blue-400">API Status</h4>
      <div className="space-y-1 mt-2">
        <div className="flex justify-between">
          <span className="text-sm">Agents:</span>
          <span className="text-green-400">✓</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Tools:</span>
          <span className="text-green-400">✓</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Partners:</span>
          <span className="text-green-400">✓</span>
        </div>
      </div>
    </div>

    {/* Last Message */}
    <div className="bg-gray-800 p-3 rounded">
      <h4 className="font-semibold text-blue-400">Last Message</h4>
      {lastMessage ? (
        <div className="text-sm mt-2">
          <div>Type: {lastMessage.type}</div>
          <div>Time: {new Date(lastMessage.timestamp).toLocaleTimeString()}</div>
        </div>
      ) : (
        <div className="text-gray-400 text-sm mt-2">No messages</div>
      )}
    </div>
  </div>

  {/* Console Logs */}
  <div className="mt-4">
    <h4 className="font-semibold text-blue-400 mb-2">Recent Console Logs</h4>
    <div className="bg-black p-2 rounded text-xs max-h-40 overflow-y-auto">
      <div className="text-green-400">[INFO] WebSocket connection initialized</div>
      <div className="text-yellow-400">[WARN] Reconnection attempt #1</div>
      <div className="text-red-400">[ERROR] API call failed: 500</div>
    </div>
  </div>
</div>
