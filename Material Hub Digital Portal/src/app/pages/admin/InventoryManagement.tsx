import { useState } from "react";
import { Plus, Search, AlertCircle, TrendingDown, Edit, Package } from "lucide-react";
import { mockInventory, mockHubs } from "../../data/mockData";

export function InventoryManagement() {
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredInventory = selectedHub === "all" 
    ? mockInventory 
    : mockInventory.filter(inv => inv.hubId === selectedHub);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Update and monitor material stock levels</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Stock Entry</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Hub</label>
            <select
              value={selectedHub}
              onChange={(e) => setSelectedHub(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value="all">All Hubs</option>
              {mockHubs.map((hub) => (
                <option key={hub.id} value={hub.id}>{hub.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Materials</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by material name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Tables */}
      <div className="space-y-6">
        {filteredInventory.map((hubInventory) => (
          <div key={hubInventory.hubId} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {/* Hub Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{hubInventory.hubName}</h2>
                  <p className="text-emerald-100 text-sm">
                    Last Updated: {new Date(hubInventory.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {Math.round(
                      hubInventory.materials.reduce((sum, m) => sum + m.percentageRemaining, 0) / 
                      hubInventory.materials.length
                    )}%
                  </div>
                  <div className="text-emerald-100 text-sm">Avg Stock Level</div>
                </div>
              </div>
            </div>

            {/* Table */}
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
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hubInventory.materials
                    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((material) => (
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
                        <td className="px-6 py-4 text-right">
                          <span className="text-emerald-600 font-semibold">
                            +{material.received.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-blue-600 font-semibold">
                            -{material.issued.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-900 font-bold">
                            {material.closing.toLocaleString()}
                          </span>
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
                          <div className="flex items-center justify-end space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  material.percentageRemaining >= 75 ? 'bg-green-500' :
                                  material.percentageRemaining >= 50 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${material.percentageRemaining}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${
                              material.percentageRemaining >= 75 ? 'text-green-600' :
                              material.percentageRemaining >= 50 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {material.percentageRemaining}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
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
                    <p className="text-sm font-semibold text-amber-900">Low Stock Alert</p>
                    <p className="text-sm text-amber-800">
                      {hubInventory.materials.filter(m => m.percentageRemaining < 75).length} material(s) 
                      below 75% threshold. Replenishment required.
                    </p>
                  </div>
                  <button className="ml-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-semibold">
                    Create Replenishment Order
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-10 w-10 text-emerald-600" />
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {mockInventory.reduce((sum, hub) => 
              sum + hub.materials.reduce((s, m) => s + m.closing, 0), 0
            ).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Stock Items</div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-10 w-10 text-blue-600" />
            <div className="text-emerald-600 text-sm font-semibold">↑ This Month</div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {mockInventory.reduce((sum, hub) => 
              sum + hub.materials.reduce((s, m) => s + m.received, 0), 0
            ).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Items Received</div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-10 w-10 text-purple-600" />
            <div className="text-blue-600 text-sm font-semibold">↓ This Month</div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {mockInventory.reduce((sum, hub) => 
              sum + hub.materials.reduce((s, m) => s + m.issued, 0), 0
            ).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Items Issued</div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
            <div className="text-red-600 text-sm font-semibold">⚠ Alert</div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {mockInventory.reduce((sum, hub) => 
              sum + hub.materials.reduce((s, m) => s + m.damaged, 0), 0
            ).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Damaged Items</div>
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add Stock Entry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hub</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  {mockHubs.map((hub) => (
                    <option key={hub.id} value={hub.id}>{hub.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Material</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Bamboo Poles</option>
                  <option>EPS Panels</option>
                  <option>CGI Sheets</option>
                  <option>Chick Mats</option>
                  <option>Tarpaulin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity Received</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                <input
                  type="text"
                  placeholder="Supplier name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Stock entry added successfully!');
                  setShowAddModal(false);
                }}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
