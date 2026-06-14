import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import LocationCard from '@/components/LocationCard';
import { getAllLocations, getClothingByLocation } from '@/db/queries';
import { type Location } from '@/types';

export default function LocationsScreen() {
  const db = useSQLiteContext();
  const [locations, setLocations] = useState<Location[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const locs = await getAllLocations(db);
        setLocations(locs);
        const countMap: Record<number, number> = {};
        await Promise.all(
          locs.map(async (loc) => {
            const items = await getClothingByLocation(db, loc.id);
            countMap[loc.id] = items.length;
          })
        );
        setCounts(countMap);
      }
      load();
    }, [db])
  );

  return (
    <View className="flex-1 bg-slate-50">
      {locations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-4">📦</Text>
          <Text className="text-slate-700 text-lg font-semibold text-center">No locations yet</Text>
          <Text className="text-slate-400 text-sm text-center mt-2">
            Add storage locations like "loft", "right box", or "blue bag" with a photo so you can find your clothes easily.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-indigo-500 px-6 py-3 rounded-full"
            onPress={() => router.push('/location/add')}
          >
            <Text className="text-white font-semibold">Add Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <LocationCard
              location={item}
              clothingCount={counts[item.id]}
              onPress={() => router.push(`/location/${item.id}`)}
            />
          )}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-500 items-center justify-center"
        style={{ elevation: 6, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}
        onPress={() => router.push('/location/add')}
      >
        <Text className="text-white text-3xl leading-none mt-[-2px]">+</Text>
      </TouchableOpacity>
    </View>
  );
}
