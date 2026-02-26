import { useMemo, useState } from "react";
import { Plus, Search, AlertCircle, TrendingDown, Edit, Package, Trash2, Building2 } from "lucide-react";
import type { MaterialEntry, MaterialHub } from "../../data/types";
import { useLiveHubData } from "../../hooks/useLiveHubData";
import { createHub, createMaterialEntry, deleteHub, deleteMaterialEntry, updateHub, updateMaterialEntry } from "../../services/materialHubService";

type HubFormState = {
  id?: string;
  name: string;
  location: string;
  district: string;
  latitude: string;
  longitude: string;
  capacity: string;
  status: MaterialHub['status'];
};

type EntryFormState = {
  id?: string;
  hubId: string;
  name: string;
  unit: string;
  opening: string;
  received: string;
  issued: string;
  damaged: string;
};

const defaultHubForm: HubFormState = {
  name: '',
  location: '',
  district: '',
  latitude: '0',
  longitude: '0',
  capacity: '0',
  status: 'ready',
};

const defaultEntryForm: EntryFormState = {
  hubId: '',
  name: '',
  unit: 'pieces',
  opening: '0',
  received: '0',
  issued: '0',
  damaged: '0',
};

export function InventoryManagement() {
  const { hubs, inventory, isLoading, error, reload } = useLiveHubData();
  const [selectedHub, setSelectedHub] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showHubModal, setShowHubModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [hubForm, setHubForm] = useState<HubFormState>(defaultHubForm);
  const [entryForm, setEntryForm] = useState<EntryFormState>(defaultEntryForm);

  const filteredInventory = useMemo(
    () => (selectedHub === 'all' ? inventory : inventory.filter((inv) => inv.hubId === selectedHub)),
    [inventory, selectedHub],
  );

  const openCreateHubModal = () => {
    setHubForm(defaultHubForm);
    setShowHubModal(true);
    setActionError(null);
  };

  const openEditHubModal = (hub: MaterialHub) => {
    setHubForm({
      id: hub.id,
      name: hub.name,
      location: hub.location,
      district: hub.district,
      latitude: String(hub.latitude),
      longitude: String(hub.longitude),
      capacity: String(hub.capacity),
      status: hub.status,
    });
    setShowHubModal(true);
    setActionError(null);
  };

  const openCreateEntryModal = (hubId?: string) => {
    setEntryForm({ ...defaultEntryForm, hubId: hubId ?? hubs[0]?.id ?? '' });
    setShowEntryModal(true);
    setActionError(null);
  };

  const openEditEntryModal = (entry: MaterialEntry) => {
    setEntryForm({
      id: entry.id,
      hubId: entry.hubId,
      name: entry.name,
      unit: entry.unit,
      opening: String(entry.opening),
      received: String(entry.received),
      issued: String(entry.issued),
      damaged: String(entry.damaged),
    });
    setShowEntryModal(true);
    setActionError(null);
  };

  const handleSaveHub = async () => {
    setIsSaving(true);
    setActionError(null);

    try {
      const payload = {
        name: hubForm.name.trim(),
        location: hubForm.location.trim(),
        district: hubForm.district.trim(),
        latitude: Number(hubForm.latitude),
        longitude: Number(hubForm.longitude),
        capacity: Number(hubForm.capacity),
        status: hubForm.status,
        stockPercentage: 0,
        damagePercentage: 0,
      };

      if (hubForm.id) {
        await updateHub(hubForm.id, payload);
      } else {
        await createHub(payload);
      }

      setShowHubModal(false);
      await reload();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Unable to save hub.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHub = async (hubId: string) => {
    if (!window.confirm('Delete this hub and all its inventory entries?')) return;

    setIsSaving(true);
    setActionError(null);

    try {
      await deleteHub(hubId);
      await reload();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Unable to delete hub.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEntry = async () => {
    setIsSaving(true);
    setActionError(null);

    try {
      const payload = {
        hubId: entryForm.hubId,
        name: entryForm.name.trim(),
        unit: entryForm.unit.trim(),
        opening: Number(entryForm.opening),
        received: Number(entryForm.received),
        issued: Number(entryForm.issued),
        damaged: Number(entryForm.damaged),
      };

      if (entryForm.id) {
        await updateMaterialEntry(entryForm.id, payload);
      } else {
        await createMaterialEntry(payload);
      }

      setShowEntryModal(false);
      await reload();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Unable to save inventory entry.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!window.confirm('Delete this inventory entry?')) return;

    setIsSaving(true);
    setActionError(null);

    try {
      await deleteMaterialEntry(entryId);
      await reload();
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Unable to delete inventory entry.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-600">Loading inventory...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const totalStock = inventory.reduce((sum, hub) => sum + hub.materials.reduce((s, m) => s + m.closing, 0), 0);
  const totalReceived = inventory.reduce((sum, hub) => sum + hub.materials.reduce((s, m) => s + m.received, 0), 0);
  const totalIssued = inventory.reduce((sum, hub) => sum + hub.materials.reduce((s, m) => s + m.issued, 0), 0);
  const totalDamaged = inventory.reduce((sum, hub) => sum + hub.materials.reduce((s, m) => s + m.damaged, 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Live CRUD for hubs and material entries</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openCreateHubModal}
            className="flex items-center space-x-2 px-5 py-3 border border-emerald-600 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <Building2 className="h-5 w-5" />
            <span>Add Hub</span>
          </button>
          <button
            onClick={() => openCreateEntryModal(selectedHub !== 'all' ? selectedHub : undefined)}
            className="flex items-center space-x-2 px-5 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {actionError && <p className="text-red-600">{actionError}</p>}

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Hub</label>
            <select
              value={selectedHub}
              onChange={(event) => setSelectedHub(event.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="all">All Hubs</option>
              {hubs.map((hub) => (
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
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {filteredInventory.map((hubInventory) => {
          const hub = hubs.find((item) => item.id === hubInventory.hubId);

          return (
            <div key={hubInventory.hubId} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{hubInventory.hubName}</h2>
                    <p className="text-emerald-100 text-sm">Last Updated: {new Date(hubInventory.lastUpdated).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {hub && (
                      <button
                        onClick={() => openEditHubModal(hub)}
                        className="px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm"
                      >
                        Edit Hub
                      </button>
                    )}
                    <button
                      onClick={() => openCreateEntryModal(hubInventory.hubId)}
                      className="px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 text-sm"
                    >
                      Add Entry
                    </button>
                    <button
                      onClick={() => handleDeleteHub(hubInventory.hubId)}
                      className="px-3 py-2 bg-red-500/80 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Delete Hub
                    </button>
                  </div>
                </div>
              </div>

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
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Remaining</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {hubInventory.materials
                      .filter((material) => material.name.toLowerCase().includes(searchTerm.toLowerCase()))
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
                          <td className="px-6 py-4 text-right text-gray-700">{material.opening.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-emerald-600 font-semibold">+{material.received.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-blue-600 font-semibold">-{material.issued.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-gray-900 font-bold">{material.closing.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-red-600 font-semibold">{material.damaged.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`font-bold ${material.percentageRemaining >= 75 ? 'text-green-600' : material.percentageRemaining >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {material.percentageRemaining}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => openEditEntryModal(material)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(material.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {hubInventory.materials.some((m) => m.percentageRemaining < 75) && (
                <div className="bg-amber-50 border-t border-amber-200 p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">{hubInventory.materials.filter((m) => m.percentageRemaining < 75).length} material(s) are below threshold.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-10 w-10 text-emerald-600" />
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalStock.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Stock Items</div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalReceived.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Items Received</div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalIssued.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Items Issued</div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900 mb-2">{totalDamaged.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Damaged Items</div>
        </div>
      </div>

      {showHubModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{hubForm.id ? 'Edit Hub' : 'Add Material Hub'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input value={hubForm.name} onChange={(e) => setHubForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Hub name" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input value={hubForm.location} onChange={(e) => setHubForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input value={hubForm.district} onChange={(e) => setHubForm((prev) => ({ ...prev, district: e.target.value }))} placeholder="District" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="number" value={hubForm.capacity} onChange={(e) => setHubForm((prev) => ({ ...prev, capacity: e.target.value }))} placeholder="Capacity" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="number" step="0.0001" value={hubForm.latitude} onChange={(e) => setHubForm((prev) => ({ ...prev, latitude: e.target.value }))} placeholder="Latitude" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="number" step="0.0001" value={hubForm.longitude} onChange={(e) => setHubForm((prev) => ({ ...prev, longitude: e.target.value }))} placeholder="Longitude" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <select value={hubForm.status} onChange={(e) => setHubForm((prev) => ({ ...prev, status: e.target.value as MaterialHub['status'] }))} className="px-4 py-3 border border-gray-300 rounded-lg md:col-span-2">
                <option value="ready">Ready</option>
                <option value="moderate">Moderate</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowHubModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">Cancel</button>
              <button onClick={() => void handleSaveHub()} disabled={isSaving} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg">{isSaving ? 'Saving...' : 'Save Hub'}</button>
            </div>
          </div>
        </div>
      )}

      {showEntryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{entryForm.id ? 'Edit Inventory Entry' : 'Add Inventory Entry'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select value={entryForm.hubId} onChange={(e) => setEntryForm((prev) => ({ ...prev, hubId: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg">
                {hubs.map((hub) => (
                  <option key={hub.id} value={hub.id}>{hub.name}</option>
                ))}
              </select>
              <input value={entryForm.name} onChange={(e) => setEntryForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Material name" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input value={entryForm.unit} onChange={(e) => setEntryForm((prev) => ({ ...prev, unit: e.target.value }))} placeholder="Unit" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="number" value={entryForm.opening} onChange={(e) => setEntryForm((prev) => ({ ...prev, opening: e.target.value }))} placeholder="Opening" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="number" value={entryForm.received} onChange={(e) => setEntryForm((prev) => ({ ...prev, received: e.target.value }))} placeholder="Received" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="number" value={entryForm.issued} onChange={(e) => setEntryForm((prev) => ({ ...prev, issued: e.target.value }))} placeholder="Issued" className="px-4 py-3 border border-gray-300 rounded-lg" />
              <input type="number" value={entryForm.damaged} onChange={(e) => setEntryForm((prev) => ({ ...prev, damaged: e.target.value }))} placeholder="Damaged" className="px-4 py-3 border border-gray-300 rounded-lg" />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setShowEntryModal(false)} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg">Cancel</button>
              <button onClick={() => void handleSaveEntry()} disabled={isSaving} className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg">{isSaving ? 'Saving...' : 'Save Entry'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
