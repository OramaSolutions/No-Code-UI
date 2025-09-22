import React, { useState, useEffect, useRef } from "react";
import { MdDownload, MdCheck, MdError, MdHourglassBottom } from "react-icons/md";
import axios from "axios";
import { isLoggedIn } from "../../utils";
import { Url as NodeUrl } from "../../config/config";
const POLLING_INTERVAL = 30000; // 30 seconds
const token = isLoggedIn("userLogin");
const applications = [
  {
    id: 1,
    title: "Single Camera AI defectdetection System",
    description: "AI-powered defectdetection and assembly verification using a single camera vision system. Ensures precise assembly quality and reduces manual inspection effort.",
    image: "https://via.placeholder.com/400x250.png?text=Camera+Verification",
  },
];

const Application = ({ state, url, userData, username, task, project, version }) => {
  const [selectedApp, setSelectedApp] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [buildStatus, setBuildStatus] = useState(null); // 'started', 'running', 'done', 'error'
  const [error, setError] = useState(null);
  const [buildResult, setBuildResult] = useState(null);
  const pollingRef = useRef(null);
  const projectId = state?.projectId;
  // Key in localStorage to store task info for this specific project

// 1) Define a full shape for persisted build session
const localStorageKey = `dockerBuild_${username}_${task}_${project}_${version}`;

const persistSession = (data) => {
  const now = Date.now();
  const base = {
    username,
    projectId,
    task,
    project,
    version,
  };
  localStorage.setItem(
    localStorageKey,
    JSON.stringify({ ...base, lastUpdated: now, ...data })
  );
};

const readSession = () => {
  const raw = localStorage.getItem(localStorageKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(localStorageKey);
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem(localStorageKey);
};

// 2) On mount: restore and resume polling strictly from persisted data
useEffect(() => {
  const saved = readSession();
  if (saved) {
    setTaskId(saved.taskId || null);
    setBuildStatus(saved.status || null);
    setBuildResult(saved.result || null);
    // If we have a task that isn't done/error, resume polling
    if (saved.taskId && saved.status !== 'done' && saved.status !== 'error') {
      startPolling(saved.taskId, saved); // pass saved payload
    }
  }
  return () => stopPolling();
  
}, []);

// 3) startPolling now accepts the persisted payload so it never depends on volatile props
const startPolling = (id, persisted) => {
  if (pollingRef.current) return;
  fetchStatus(id, persisted);
  pollingRef.current = setInterval(() => {
    fetchStatus(id, persisted);
  }, POLLING_INTERVAL);
};
const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

// 4) fetchStatus strictly uses persisted identity data, not transient component state
const fetchStatus = async (id, persistedOverride) => {
  const persisted = persistedOverride || readSession();
  if (!id || !persisted) {
    stopPolling(); // stop timer if context missing [web:46]
    clearSession();
    setTaskId(null);
    setBuildStatus(null);
    return;
  }

  try {
    const res = await axios.post(
      `${url}status/${id}`,
      {
        username: persisted.username,
        projectId: persisted.projectId,
        task: persisted.task,
        name: persisted.project, // if API expects 'name' [web:60]
        version: persisted.version,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { status, result, error: apiError } = res.data || {};

    // Accept only known statuses; otherwise treat as error
    if (status === 'done') {
      setBuildStatus('done');
      stopPolling(); // end polling on completion [web:46]
      setBuildResult(result);
      persistSession({ taskId: id, status: 'done', result });
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Docker Build Complete', {
          body: 'Your application is ready for download!',
          icon: '/favicon.ico',
        });
      }
      return;
    }

    if (status === 'running' || status === 'started') {
      setBuildStatus(status);
      persistSession({ taskId: id, status }); // keep session current [web:60]
      return;
    }

    // status === 'error' OR unexpected/invalid payloads
    const msg = apiError || 'Unexpected status from server';
    setBuildStatus('error');
    setError(msg);
    persistSession({ taskId: id, status: 'error', error: msg });
    stopPolling(); // stop on any error [web:46]
  } catch (err) {
    // Consolidated Axios error handling
    let msg = 'Request failed';
    if (err.response) {
      // Server responded with non-2xx
      msg = err.response.data?.message || `Server error: ${err.response.status}`; // show server message if present [web:60]
    } else if (err.request) {
      // Request made but no response (network/CORS/timeout)
      msg = 'Network error. Please check connection and try again.'; // user-friendly network error [web:56]
    } else {
      // Something else setting up request
      msg = err.message || 'Unexpected error occurred'; // generic fallback [web:60]
    }

    setBuildStatus('error');
    setError(msg);
    persistSession({ taskId: id, status: 'error', error: msg });
    stopPolling(); // ensure interval is cleared on errors [web:46]

    // Optional: special case for 404 task not found -> cleanup session
    if (err.response?.status === 404) {
      clearSession();
      setTaskId(null);
      setBuildStatus(null);
    }
  }
};


// 5) On build start: persist everything upfront
const handleDownload = async (appTitle) => {
  if (!username || !task || !project || !version) {
    alert('Missing required project information');
    return;
  }

  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  setError(null);

  try {
    console.log('token', token)
    const response = await axios.post(
      `${url}build-image-pri`,
      { username, projectId, task, project, version },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const { task_id } = response.data;
    setTaskId(task_id);
    setBuildStatus('started');

    // Persist full context immediately
    persistSession({
      taskId: task_id,
      status: 'started',
      result: null,
      error: null,
    });

    startPolling(task_id, readSession());
    alert(`Build started for ${appTitle}. This may take 20-30 minutes. You'll be notified when ready.`);
  } catch (err) {
    console.error('Error starting build:', err);
    setError(err.response?.data?.message || 'Failed to start build. Please try again.');
  }
};

// 6) Direct download should read from persisted result if state is empty
const handleDirectDownload = async () => {
  const session = readSession();
  const _result = buildResult || session?.result;
  const _status = buildStatus || session?.status;

  if (_result?.zip_filename && _status === 'done') {
    const { data } = await axios.get(
      `${NodeUrl}projects/get-download-url/${encodeURIComponent(_result.zip_filename)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          username: session?.username || username,
          task: session?.task || task,
          project: session?.project || project,
          version: session?.version || version,
          projectId: session?.projectId || projectId,
        },
      }
    );
    const downloadUrl = `${url}${data.url}`;
    window.location.href = downloadUrl;
  } else {
    alert('Build is not ready to download yet.');
  }
};

// 7) Clear: wipe storage and state
const clearBuildStatus = () => {
  clearSession();
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
              <div className="p-2">
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
