import { createBrowserRouter } from "react-router";
import { PublicLayout } from "./layouts/PublicLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/public/HomePage";
import { HubLocations } from "./pages/public/HubLocations";
import { LiveInventory } from "./pages/public/LiveInventory";
import { TrainingPortal } from "./pages/public/TrainingPortal";
import { AboutPage } from "./pages/public/AboutPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { InventoryManagement } from "./pages/admin/InventoryManagement";
import { IssuanceWorkflow } from "./pages/admin/IssuanceWorkflow";
import { DamageMonitoring } from "./pages/admin/DamageMonitoring";
import { Analytics } from "./pages/admin/Analytics";
import { LoginPage } from "./pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "locations", Component: HubLocations },
      { path: "inventory", Component: LiveInventory },
      { path: "training", Component: TrainingPortal },
      { path: "about", Component: AboutPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "inventory", Component: InventoryManagement },
      { path: "issuance", Component: IssuanceWorkflow },
      { path: "damage", Component: DamageMonitoring },
      { path: "analytics", Component: Analytics },
    ],
  },
  {
    path: "/login",
    Component: LoginPage,
  },
]);
