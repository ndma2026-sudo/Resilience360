import { useCallback, useEffect, useMemo, useState } from 'react';
import type { HubInventory, MaterialEntry, MaterialHub } from '../data/types';
import { mockHubs, mockInventory } from '../data/mockData';
import { listHubs, listMaterialEntries } from '../services/materialHubService';
import { isSupabaseConfigured, supabase } from '../services/supabase';

type LiveHubDataState = {
  hubs: MaterialHub[];
  entries: MaterialEntry[];
  inventory: HubInventory[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const byUpdatedDateDesc = (left: string, right: string) => {
  const a = new Date(left).getTime();
  const b = new Date(right).getTime();
  return b - a;
};

export function useLiveHubData(): LiveHubDataState {
  const [hubs, setHubs] = useState<MaterialHub[]>([]);
  const [entries, setEntries] = useState<MaterialEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        const fallbackHubs: MaterialHub[] = mockHubs.map((hub) => ({
          id: hub.id,
          name: hub.name,
          location: hub.location,
          district: hub.district,
          latitude: hub.coordinates[0],
          longitude: hub.coordinates[1],
          capacity: hub.capacity,
          status: hub.status,
          stockPercentage: hub.stockPercentage,
          damagePercentage: hub.damagePercentage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        const fallbackEntries: MaterialEntry[] = mockInventory.flatMap((inventoryItem) =>
          inventoryItem.materials.map((entry) => ({
            id: entry.id,
            hubId: inventoryItem.hubId,
            name: entry.name,
            unit: entry.unit,
            opening: entry.opening,
            received: entry.received,
            issued: entry.issued,
            closing: entry.closing,
            damaged: entry.damaged,
            percentageRemaining: entry.percentageRemaining,
            createdAt: inventoryItem.lastUpdated,
            updatedAt: inventoryItem.lastUpdated,
          })),
        );

        setHubs(fallbackHubs);
        setEntries(fallbackEntries);
        return;
      }

      const [nextHubs, nextEntries] = await Promise.all([listHubs(), listMaterialEntries()]);
      setHubs(nextHubs);
      setEntries(nextEntries);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Unable to load live data.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    const channel = supabase
      .channel('material-hubs-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'material_hubs' }, () => {
        void reload();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hub_material_entries' }, () => {
        void reload();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload]);

  const inventory = useMemo<HubInventory[]>(() => {
    return hubs.map((hub) => {
      const hubEntries = entries
        .filter((entry) => entry.hubId === hub.id)
        .sort((left, right) => left.name.localeCompare(right.name));

      const lastUpdated = hubEntries
        .map((entry) => entry.updatedAt ?? entry.createdAt ?? new Date().toISOString())
        .sort(byUpdatedDateDesc)[0] ?? (hub.updatedAt ?? hub.createdAt ?? new Date().toISOString());

      return {
        hubId: hub.id,
        hubName: hub.name,
        materials: hubEntries,
        lastUpdated,
      };
    });
  }, [hubs, entries]);

  return { hubs, entries, inventory, isLoading, error, reload };
}
