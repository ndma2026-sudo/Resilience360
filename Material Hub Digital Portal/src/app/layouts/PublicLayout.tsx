import { Outlet, Link, useLocation } from "react-router";
import { Building2, MapPin, Package, GraduationCap, Info } from "lucide-react";

export function PublicLayout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-emerald-600 to-blue-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">NMHDP</h1>
                <p className="text-xs text-gray-600">National Material Hub Portal</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link
                to="/locations"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/locations') 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Hub Locations</span>
              </Link>
              <Link
                to="/inventory"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/inventory') 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="h-4 w-4" />
                <span>Live Inventory</span>
              </Link>
              <Link
                to="/training"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/training') 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Training</span>
              </Link>
              <Link
                to="/about"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/about') 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Info className="h-4 w-4" />
                <span>About</span>
              </Link>
            </nav>

            <Link
              to="/login"
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Admin Login
            </Link>

            <a
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ← Back to Resilience Home
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden border-t border-gray-200 px-4 py-2 flex overflow-x-auto space-x-2">
          <Link
            to="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
              isActive('/') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>Home</span>
          </Link>
          <Link
            to="/locations"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
              isActive('/locations') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Locations</span>
          </Link>
          <Link
            to="/inventory"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
              isActive('/inventory') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Inventory</span>
          </Link>
          <Link
            to="/training"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
              isActive('/training') 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Training</span>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold mb-4">About NMHDP</h3>
              <p className="text-gray-400 text-sm">
                National Material Hub Digital Portal - Facilitating disaster preparedness, 
                community resilience, and transparent material distribution across Pakistan.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/locations" className="text-gray-400 hover:text-white">Hub Locations</Link></li>
                <li><Link to="/inventory" className="text-gray-400 hover:text-white">Live Inventory</Link></li>
                <li><Link to="/training" className="text-gray-400 hover:text-white">Training Programs</Link></li>
                <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                National Disaster Management Authority<br />
                Prime Minister's Office, Islamabad<br />
                Email: info@ndma.gov.pk
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 NDMA Pakistan. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
