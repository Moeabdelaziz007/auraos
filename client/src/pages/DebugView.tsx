import { useState, useEffect } from 'react';

const DebugView = () => {
  const [events, setEvents] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    let eventSource: EventSource;

    if (isStreaming) {
      eventSource = new EventSource('/api/events');

      eventSource.onmessage = (event) => {
        setEvents((prevEvents) => [JSON.parse(event.data), ...prevEvents]);
      };
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isStreaming]);

  const toggleStreaming = () => {
    setIsStreaming((prevIsStreaming) => !prevIsStreaming);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug View</h1>
      <button className="btn btn-primary mb-4" onClick={toggleStreaming}>
        {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
      </button>

      <div className="border rounded-lg p-4 bg-gray-100">
        <h2 className="text-lg font-semibold mb-2">Event Stream</h2>
        <div className="max-h-96 overflow-y-auto">
          {events.map((event, index) => (
            <pre key={index} className="bg-white p-2 rounded-md mb-2">
              {JSON.stringify(event, null, 2)}
            </pre>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugView;
