import { useState } from "react";
import { Package, TrendingDown, AlertCircle, Building2 } from "lucide-react";
import { useLiveHubData } from "../../hooks/useLiveHubData";

export function LiveInventory() {
  const { hubs, inventory, isLoading, error } = useLiveHubData();
  const [selectedHub, setSelectedHub] = useState<string>("all");

  const filteredInventory = selectedHub === "all" 
    ? inventory 
    : inventory.filter(inv => inv.hubId === selectedHub);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-gray-600">Loading live inventory...</div>;
  }

  if (error) {
    return <div className="max-w-7xl mx-auto px-4 py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Inventory Dashboard</h1>
        <p className="text-xl text-gray-600">
          Real-time material stock levels across all hubs
        </p>
      </div>

      {/* Hub Filter */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
        <label className="text-sm font-semibold text-gray-700 mb-3 block">
          Filter by Hub
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedHub("all")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedHub === "all"
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Hubs
          </button>
          {hubs.map((hub) => (
            <button
              key={hub.id}
              onClick={() => setSelectedHub(hub.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedHub === hub.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {hub.location}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Cards */}
      <div className="space-y-8">
        {filteredInventory.map((hubInventory) => (
          <div key={hubInventory.hubId} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Hub Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8" />
                  <div>
                    <h2 className="text-2xl font-bold">{hubInventory.hubName}</h2>
                    <p className="text-emerald-100 text-sm">
                      Last Updated: {new Date(hubInventory.lastUpdated).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {Math.round(
                      hubInventory.materials.reduce((sum, m) => sum + m.percentageRemaining, 0) / 
                      hubInventory.materials.length
                    )}%
                  </div>
                  <div className="text-emerald-100 text-sm">Avg Stock</div>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Material</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Opening</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Received</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Issued</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Closing</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Damaged</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">% Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hubInventory.materials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-semibold text-gray-900">{material.name}</div>
                            <div className="text-sm text-gray-500">{material.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">
                        {material.opening.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-semibold">
                        +{material.received.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-600 font-semibold">
                        -{material.issued.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-bold">
                        {material.closing.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`font-semibold ${
                          material.damaged > 100 ? 'text-red-600' : 
                          material.damaged > 50 ? 'text-amber-600' : 
                          'text-gray-600'
                        }`}>
                          {material.damaged.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                material.percentageRemaining >= 75 ? 'bg-green-500' :
                                material.percentageRemaining >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${material.percentageRemaining}%` }}
                            />
                          </div>
                          <span className={`font-bold text-sm ${
                            material.percentageRemaining >= 75 ? 'text-green-600' :
                            material.percentageRemaining >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {material.percentageRemaining}%
                          </span>
                          {material.percentageRemaining < 75 && (
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Alerts */}
            {hubInventory.materials.some(m => m.percentageRemaining < 75) && (
              <div className="bg-amber-50 border-t border-amber-200 p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Stock Alert</p>
                    <p className="text-sm text-amber-800">
                      {hubInventory.materials.filter(m => m.percentageRemaining < 75).length} material(s) 
                      below 75% threshold. Automatic replenishment alert sent to NDMA HQ.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
          <Package className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">
            {inventory.reduce((sum, hub) => sum + hub.materials.length, 0)}
          </div>
          <div className="text-emerald-100">Total Material Types</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <TrendingDown className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">
            {inventory.reduce((sum, hub) => 
              sum + hub.materials.reduce((s, m) => s + m.issued, 0), 0
            ).toLocaleString()}
          </div>
          <div className="text-blue-100">Total Items Issued</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
          <AlertCircle className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">
            {inventory.reduce((sum, hub) => 
              sum + hub.materials.reduce((s, m) => s + m.damaged, 0), 0
            ).toLocaleString()}
          </div>
          <div className="text-purple-100">Total Damaged Items</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white shadow-lg">
          <Building2 className="h-10 w-10 mb-3 opacity-80" />
          <div className="text-3xl font-bold mb-2">{hubs.length}</div>
          <div className="text-orange-100">Active Hubs</div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <Package className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">How to Read This Data</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Opening:</strong> Stock at the beginning of the period</li>
              <li>• <strong>Received:</strong> New materials added to inventory</li>
              <li>• <strong>Issued:</strong> Materials distributed to disaster-affected areas</li>
              <li>• <strong>Closing:</strong> Current available stock</li>
              <li>• <strong>Damaged:</strong> Materials requiring replacement</li>
              <li>• <strong>% Remaining:</strong> Current stock as percentage of optimal level (75% threshold)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
