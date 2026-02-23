import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { TrainingPrograms } from "./pages/TrainingPrograms";
import { CourseDetail } from "./pages/CourseDetail";
import { Certification } from "./pages/Certification";
import { KnowledgeRepository } from "./pages/KnowledgeRepository";
import { Assessments } from "./pages/Assessments";
import { ProgressAnalytics } from "./pages/ProgressAnalytics";
import { AdminSettings } from "./pages/AdminSettings";
import { Auth } from "./pages/Auth";
import { MyCourses } from "./pages/MyCourses";

const normalizedBaseName = (() => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname || '/';
    const normalizedPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const lastSlashIndex = normalizedPath.lastIndexOf('/');

    if (lastSlashIndex > 0) {
      return normalizedPath.slice(0, lastSlashIndex);
    }

    return '/';
  }

  const configuredBase = String(import.meta.env.BASE_URL || '/').trim();
  if (!configuredBase || configuredBase === './') return '/';
  return configuredBase.endsWith('/') ? configuredBase.slice(0, -1) : configuredBase;
})();

export const router = createBrowserRouter([
  {
    path: "/auth",
    Component: Auth,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "training", Component: TrainingPrograms },
      { path: "training/:id", Component: CourseDetail },
      { path: "my-courses", Component: MyCourses },
      { path: "certification", Component: Certification },
      { path: "knowledge", Component: KnowledgeRepository },
      { path: "assessments", Component: Assessments },
      { path: "analytics", Component: ProgressAnalytics },
      { path: "admin", Component: AdminSettings },
    ],
  },
], {
  basename: normalizedBaseName,
});