
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  PlayCircle,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap,
  LayoutDashboard,
  Search,
  Award,
  Play,
  Video,
  PanelLeftClose,
  Download,
} from "lucide-react";
import { courses } from "../data/demoData.js";
import { createCourseCertificate, downloadCourseCertificate } from "../utils/courseCertificate.js";
import {
  COURSE_PROGRESS_EVENT,
  formatVideoTime,
  getCourseProgressPercent,
  getWatchedSeconds,
  mergeWatchedRanges,
  readCourseProgress,
  saveCourseProgress,
} from "../utils/courseProgress.js";

let youtubeIframeApiPromise;

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeIframeApiPromise) return youtubeIframeApiPromise;

  youtubeIframeApiPromise = new Promise((resolve, reject) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => reject(new Error("Unable to load the YouTube player."));
      document.head.appendChild(script);
    }
  }).catch((error) => {
    youtubeIframeApiPromise = null;
    throw error;
  });

  return youtubeIframeApiPromise;
}

function YouTubeCoursePlayer({ course, onProgress, onError, onDuration }) {
  const playerContainerRef = useRef(null);

  useEffect(() => {
    onError("");
    let player;
    let playbackTimer;
    let cancelled = false;
    let lastPlaybackTime = null;

    const stopTracking = () => {
      window.clearInterval(playbackTimer);
      playbackTimer = undefined;
      lastPlaybackTime = null;
    };

    loadYouTubeIframeApi()
      .then((youtube) => {
        if (cancelled || !playerContainerRef.current) return;

        const videoId = course.embedUrl.split("/").pop();
        player = new youtube.Player(playerContainerRef.current, {
          width: "100%",
          height: "100%",
          videoId,
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
          },
          events: {
            onReady: (event) => {
              const duration = event.target.getDuration();
              if (duration > 0) {
                onDuration(duration);
                onProgress(course.id, { duration });
              }
            },
            onStateChange: (event) => {
              if (event.data === youtube.PlayerState.PLAYING) {
                stopTracking();
                const duration = event.target.getDuration();
                if (duration > 0) {
                  onDuration(duration);
                  onProgress(course.id, { duration });
                }
                lastPlaybackTime = event.target.getCurrentTime();
                playbackTimer = window.setInterval(() => {
                  const currentTime = event.target.getCurrentTime();
                  const duration = event.target.getDuration();
                  const previousTime = lastPlaybackTime;

                  if (
                    previousTime !== null &&
                    currentTime >= previousTime &&
                    currentTime - previousTime <= 2.5 &&
                    duration > 0
                  ) {
                    onProgress(course.id, {
                      duration,
                      watchedRange: [previousTime, Math.min(currentTime, duration)],
                    });
                  }

                  lastPlaybackTime = currentTime;
                }, 1000);
              } else {
                stopTracking();
              }
            },
            onError: (event) => {
              stopTracking();
              onError(`This YouTube video could not be played (error ${event.data}).`);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) {
          onError("Unable to load the YouTube player. Check your connection and try again.");
        }
      });

    return () => {
      cancelled = true;
      stopTracking();
      player?.destroy();
    };
  }, [course, onDuration, onError, onProgress]);

  return (
    <div className="h-full w-full">
      <div ref={playerContainerRef} className="h-full w-full" />
    </div>
  );
}

export default function LearnLms() {
  const [searchParams] = useSearchParams();
  const requestedCourseId = searchParams.get("course");
  const requestedCourseIndex = courses.findIndex(
    (item) => String(item.id) === requestedCourseId
  );
  const [selectedCourse, setSelectedCourse] = useState(
    requestedCourseIndex >= 0 ? requestedCourseIndex : 0
  );
  const [progressRecords, setProgressRecords] = useState({});
  const [progressError, setProgressError] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [playerDuration, setPlayerDuration] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const refreshProgress = () => {
      try {
        setProgressRecords(readCourseProgress());
        setProgressError("");
      } catch {
        setProgressError("Unable to read saved course progress from this browser.");
      }
    };

    refreshProgress();
    window.addEventListener("storage", refreshProgress);
    window.addEventListener(COURSE_PROGRESS_EVENT, refreshProgress);
    return () => {
      window.removeEventListener("storage", refreshProgress);
      window.removeEventListener(COURSE_PROGRESS_EVENT, refreshProgress);
    };
  }, []);

  useEffect(() => {
    if (requestedCourseIndex >= 0) {
      setSelectedCourse(requestedCourseIndex);
    }
  }, [requestedCourseIndex]);

  const course = courses[selectedCourse];
  const courseRecord = progressRecords[String(course.id)] || {};
  const isCompleted = Boolean(courseRecord.completed);
  const watchedSeconds = Math.min(
    Number(courseRecord.duration) || playerDuration,
    getWatchedSeconds(courseRecord.watchedRanges)
  );
  const videoDuration = Number(courseRecord.duration) || playerDuration;
  const coursePercent = getCourseProgressPercent(courseRecord);
  const completedCount = Object.values(progressRecords).filter(
    (record) => record.completed
  ).length;
  const progress = Math.round(
    (completedCount / courses.length) * 100
  );

  const recordCourseProgress = useCallback((courseId, updates) => {
    try {
      const currentRecords = readCourseProgress();
      const existing = currentRecords[String(courseId)] || {};
      const savedUpdates = { ...updates };

      if (updates.watchedRange) {
        savedUpdates.watchedRanges = mergeWatchedRanges(
          existing.watchedRanges,
          updates.watchedRange
        );
        delete savedUpdates.watchedRange;
      }

      const nextRecords = saveCourseProgress(courseId, savedUpdates);
      setProgressRecords(nextRecords);
      setProgressError("");
    } catch {
      setProgressError("Unable to save video progress in this browser.");
    }
  }, []);

  const markComplete = () => {
    try {
      const savedProfile = localStorage.getItem("campushub-profile");
      const profile = savedProfile ? JSON.parse(savedProfile) : {};
      const learnerName =
        profile.fullName?.trim() ||
        localStorage.getItem("campushub-username") ||
        "CampusHub Learner";
      const completedAt = new Date().toISOString();
      const certificateId = `CH-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
      const nextRecords = saveCourseProgress(course.id, {
        completed: true,
        certificate: { id: certificateId, learnerName, completedAt },
      });

      setProgressRecords(nextRecords);
      setProgressError("");
    } catch {
      setProgressError("Unable to save course completion. Please try again.");
    }
  };

  const downloadCertificate = () => {
    try {
      const certificate = courseRecord.certificate;
      if (!certificate) {
        throw new Error("Complete the course before downloading its certificate.");
      }

      const pdf = createCourseCertificate({
        learnerName: certificate.learnerName,
        courseTitle: course.title,
        completedAt: certificate.completedAt,
        certificateId: certificate.id,
      });
      downloadCourseCertificate(pdf, course.title);
      setProgressError("");
    } catch {
      setProgressError("Unable to create the course certificate. Please try again.");
    }
  };

  const filteredCourses = courses.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const nextCourse = () => {
    if (selectedCourse < courses.length - 1) {
      setSelectedCourse((prev) => prev + 1);
    }
  };

  const previousCourse = () => {
    if (selectedCourse > 0) {
      setSelectedCourse((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-5 md:px-8">

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                CampusHub
              </h1>
              <p className="text-[11px] text-slate-500">
                Learning Academy
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/portal/lms")}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
        >
          <ArrowLeft size={16} />
          Back to home
        </button>
      </header>

      <div className="flex">

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="fixed bottom-0 left-0 top-[72px] z-30 flex w-[280px] flex-col border-r border-slate-200 bg-white md:sticky md:top-[72px] md:h-[calc(100vh-72px)]">

            <div className="border-b border-slate-100 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold text-slate-800">
                  My Learning
                </h2>
                <PanelLeftClose
                  size={19}
                  className="cursor-pointer text-slate-400"
                  onClick={() => setSidebarOpen(false)}
                />
              </div>

              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>

            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                <LayoutDashboard size={17} />
                LEARNING PROGRAMS
              </div>

              <div className="space-y-2">
                {filteredCourses.map((item) => {
                  const originalIndex = courses.findIndex(
                    (c) => c.id === item.id
                  );

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCourse(originalIndex)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                        selectedCourse === originalIndex
                          ? "border border-orange-200 bg-orange-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} text-white`}
                      >
                        <PlayCircle size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {progressRecords[String(item.id)]?.completed
                            ? "Completed"
                            : `${getCourseProgressPercent(progressRecords[String(item.id)] || {})}% watched`}
                        </p>
                      </div>

                      {progressRecords[String(item.id)]?.completed && (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-green-500"
                        />
                      )}
                    </button>
                  );
                })}

                {filteredCourses.length === 0 && (
                  <p className="py-5 text-center text-sm text-slate-400">
                    No courses found.
                  </p>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-auto border-t border-slate-100 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">
                  Overall Progress
                </span>
                <span className="text-sm font-bold text-orange-600">
                  {progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {completedCount} of {courses.length} courses completed
              </p>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-4 md:p-8">

          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <BookOpen size={16} />
            <span>Learning</span>
            <ChevronRight size={15} />
            <span className="font-medium text-orange-600">
              {course.title}
            </span>
          </div>

          {/* Welcome Section */}
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Welcome to your Learning Hub
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Learn new skills, watch lessons and grow your career.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
              <Award className="text-orange-500" size={23} />
              <div>
                <p className="text-xs text-slate-500">
                  Courses completed
                </p>
                <p className="font-bold text-slate-800">
                  {completedCount}/{courses.length}
                </p>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-md bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">
                    COURSE {course.id}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                      <CheckCircle2 size={14} />
                      Completed
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-slate-900">
                  {course.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Video size={17} />
                Video Lesson
              </div>
            </div>

            {/* YouTube Embed */}
            <div className="bg-black">
              <div className="aspect-video w-full">
                <YouTubeCoursePlayer
                  key={course.id}
                  course={course}
                  onProgress={recordCourseProgress}
                  onError={setPlayerError}
                  onDuration={setPlayerDuration}
                />
              </div>
            </div>

            {/* Video Controls */}
            <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-slate-800">
                  {course.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Course {selectedCourse + 1} of {courses.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {videoDuration
                    ? `${formatVideoTime(watchedSeconds)} / ${formatVideoTime(videoDuration)} watched (${coursePercent}%)`
                    : "Play the video to track your progress."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={previousCourse}
                  disabled={selectedCourse === 0}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                  Previous
                </button>

                <button
                  onClick={markComplete}
                  disabled={isCompleted}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
                >
                  <CheckCircle2 size={17} />
                  {isCompleted ? "Completed" : "Mark Complete"}
                </button>

                {isCompleted && (
                  <button
                    onClick={downloadCertificate}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Award size={17} />
                    Certificate
                    <Download size={15} />
                  </button>
                )}

                <button
                  onClick={nextCourse}
                  disabled={selectedCourse === courses.length - 1}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
            {(progressError || playerError) && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {progressError || playerError}
              </p>
            )}
          </div>

          {/* Course Details */}
          <div className="mt-7 grid gap-5 lg:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                About This Course
              </h3>

              <p className="text-sm leading-7 text-slate-600">
                {course.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <BookOpen className="mb-2 text-orange-500" size={21} />
                  <p className="text-sm font-bold text-slate-800">
                    {course.lessons}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Learning material
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <Clock className="mb-2 text-orange-500" size={21} />
                  <p className="text-sm font-bold text-slate-800">
                    Self Paced
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Learn anytime
                  </p>
                </div>
              </div>
            </div>

            {/* Course List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 font-bold text-slate-900">
                Course Content
              </h3>

              <div className="space-y-3">
                {courses.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedCourse(index)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      selectedCourse === index
                        ? "border-orange-300 bg-orange-50"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      {progressRecords[String(item.id)]?.completed ? (
                        <CheckCircle2
                          size={19}
                          className="text-green-500"
                        />
                      ) : (
                        <Play size={17} className="text-orange-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Video lesson
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-200 py-5 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} CampusHub Learning Academy.
            Keep learning, keep growing.
          </div>

        </main>
      </div>
    </div>
  );
}
