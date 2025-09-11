import React, { useState, useEffect, useRef } from "react";
import { MdDownload, MdCheck, MdError, MdHourglassBottom } from "react-icons/md";
import axios from "axios";
import { isLoggedIn } from "../../utils";
import { Url as NodeUrl } from "../../config/config";
const POLLING_INTERVAL = 3000; // 30 seconds
const token = isLoggedIn("userLogin");
const applications = [
  {
    id: 1,
    title: "Single Camera Assembly Verification",
    description: "AI-powered assembly verification using a single camera vision system. Ensures precise assembly quality and reduces manual inspection effort.",
    image: "https://via.placeholder.com/400x250.png?text=Camera+Verification",
  },
  {
    id: 2,
    title: "Multi-Camera Inspection",
    description: "Combines multiple cameras for high-accuracy inspection. Ideal for 360° product checks and environments needing redundant vision inputs.",
    image: "https://via.placeholder.com/400x250.png?text=Multi+Camera",
  },
  {
    id: 3,
    title: "Defect Detection System",
    description: "Automates real-time defect detection in the production line, reducing errors and improving throughput in critical manufacturing systems.",
    image: "https://via.placeholder.com/400x250.png?text=Defect+Detection",
  },
];

const Application = ({ state, url, userData, username, task, project, version }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [buildStatus, setBuildStatus] = useState(null); // 'started', 'running', 'done', 'error'
  const [error, setError] = useState(null);
  const [buildResult, setBuildResult] = useState(null);
  const pollingRef = useRef(null);

  // Key in localStorage to store task info for this specific project
  const localStorageKey = `dockerBuild_${username}_${task}_${project}_${version}`;

  useEffect(() => {
    // On mount: check if there's an existing build task for this project
    const savedBuildData = localStorage.getItem(localStorageKey);
    if (savedBuildData) {
      try {
        const buildData = JSON.parse(savedBuildData);
        setTaskId(buildData.taskId);
        setBuildStatus(buildData.status || 'running');

        // If not done, start polling
        if (buildData.status !== 'done' && buildData.status !== 'error') {
          startPolling(buildData.taskId);
        }
      } catch (err) {
        console.error('Error parsing saved build data:', err);
        localStorage.removeItem(localStorageKey);
      }
    }

    return () => {
      stopPolling();
    };
  }, []);

  const startPolling = (id) => {
    if (pollingRef.current) return; // already polling

    // Initial fetch
    fetchStatus(id);

    pollingRef.current = setInterval(() => {
      fetchStatus(id);
    }, POLLING_INTERVAL);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchStatus = async (id) => {
    try {
      const res = await axios.get(`${url}status/${id}`);
      const { status, result, error: apiError } = res.data;

      setBuildStatus(status);

      if (status === 'done') {
        stopPolling();
        setBuildResult(result);

        // Update localStorage
        const buildData = { taskId: id, status: 'done', result };
        localStorage.setItem(localStorageKey, JSON.stringify(buildData));

        // Notify user
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Docker Build Complete', {
            body: 'Your application is ready for download!',
            icon: '/favicon.ico'
          });
        }

      } else if (status === 'error') {
        stopPolling();
        setError(apiError || 'Build failed with unknown error');

        // Update localStorage
        const buildData = { taskId: id, status: 'error', error: apiError };
        localStorage.setItem(localStorageKey, JSON.stringify(buildData));

      } else {
        // Update status in localStorage for running builds
        const buildData = { taskId: id, status };
        localStorage.setItem(localStorageKey, JSON.stringify(buildData));
      }

    } catch (err) {
      console.error('Error fetching build status:', err);
      if (err.response?.status === 404) {
        // Task not found, clean up
        localStorage.removeItem(localStorageKey);
        setTaskId(null);
        setBuildStatus(null);
        stopPolling();
      }
    }
  };

  const handleDownload = async (appTitle) => {
    if (!username || !task || !project || !version) {
      alert('Missing required project information');
      return;
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    setError(null);

    try {
      const response = await axios.post(`${url}/build-image-pri`, {
        username,
        task,
        project,
        version,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { task_id, status } = response.data;

      setTaskId(task_id);
      setBuildStatus('started');

      // Save to localStorage
      const buildData = { taskId: task_id, status: 'started' };
      localStorage.setItem(localStorageKey, JSON.stringify(buildData));

      // Start polling
      startPolling(task_id);

      alert(`Build started for ${appTitle}. This may take 20-30 minutes. You'll be notified when ready.`);

    } catch (err) {
      console.error('Error starting build:', err);
      setError(err.response?.data?.message || 'Failed to start build. Please try again.');
    }
  };

const handleDirectDownload = async () => {
  if (buildResult.zip_filename && buildStatus === 'done') {
    const { data } = await axios.get(`${NodeUrl}projects/get-download-url/${encodeURIComponent(buildResult.zip_filename)}`, {
      headers: {
        Authorization: `Bearer ${token}`, // your auth token
      },
      params: { 
        username, 
        task, 
        project, 
        version 
      } 
    });
    const downloadUrl = `${url}${data.url}`;
    console.log("downloadUrl", downloadUrl);
    window.location.href = downloadUrl;
  }
};



  const clearBuildStatus = () => {
    localStorage.removeItem(localStorageKey);
    setTaskId(null);
    setBuildStatus(null);
    setError(null);
    setBuildResult(null);
    stopPolling();
  };

  const getStatusIcon = () => {
    switch (buildStatus) {
      case 'started':
      case 'running':
        return <MdHourglassBottom className="animate-spin" size={18} />;
      case 'done':
        return <MdCheck size={18} />;
      case 'error':
        return <MdError size={18} />;
      default:
        return <MdDownload size={18} />;
    }
  };

  const getStatusText = () => {
    switch (buildStatus) {
      case 'started':
        return 'Build Starting...';
      case 'running':
        return 'Building...';
      case 'done':
        return 'Ready to Download';
      case 'error':
        return 'Build Failed';
      default:
        return 'Download';
    }
  };

  const getButtonClass = () => {
    const baseClass = "mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ";

    switch (buildStatus) {
      case 'started':
      case 'running':
        return baseClass + "bg-yellow-500 text-white cursor-not-allowed";
      case 'done':
        return baseClass + "bg-green-600 text-white hover:bg-green-700";
      case 'error':
        return baseClass + "bg-red-600 text-white hover:bg-red-700";
      default:
        return baseClass + "bg-blue-600 text-white hover:bg-blue-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-10">
        Applications
      </h1>

      {/* Status Banner */}
      {(buildStatus || error) && (
        <div className="mb-6 p-4 rounded-lg border max-w-2xl mx-auto">
          {error ? (
            <div className="flex items-center justify-between text-red-600">
              <div className="flex items-center gap-2">
                <MdError size={20} />
                <span className="font-medium">Build Error: {error}</span>
              </div>
              <button
                onClick={clearBuildStatus}
                className="text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
              >
                Clear
              </button>
            </div>
          ) : buildStatus === 'done' ? (
            <div className="flex items-center justify-between text-green-600">
              <div className="flex items-center gap-2">
                <MdCheck size={20} />
                <span className="font-medium">Build Complete! Your application is ready for download.</span>
              </div>
              <button
                onClick={clearBuildStatus}
                className="text-sm bg-green-100 hover:bg-green-200 px-3 py-1 rounded"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-yellow-600">
              <div className="flex items-center gap-2">
                <MdHourglassBottom className="animate-spin" size={20} />
                <span className="font-medium">Build in progress... This may take 20-30 minutes.</span>
              </div>
              <button
                onClick={clearBuildStatus}
                className="text-sm bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {applications.map((app) => {
          const isSelected = selectedApp === app.id;
          return (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app.id)}
              className={`cursor-pointer bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 ${isSelected
                ? "ring-4 ring-blue-500 shadow-2xl scale-105"
                : "hover:shadow-xl"
                }`}
            >
              <img
                src={app.image}
                alt={app.title}
                className="h-40 w-full object-cover"
              />
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-800">
                  {app.title}
                </h2>
                <p className="text-gray-600 text-sm mt-2">{app.description}</p>

                {/* Show download button only if selected */}
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (buildStatus === 'done') {
                        handleDirectDownload();
                      } else if (!buildStatus || buildStatus === 'error') {
                        handleDownload(app.title);
                      }
                    }}
                    className={getButtonClass()}
                    disabled={buildStatus === 'started' || buildStatus === 'running'}
                  >
                    {getStatusIcon()}
                    {getStatusText()}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Application;
