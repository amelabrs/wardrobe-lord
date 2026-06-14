import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import ClothingCard from '@/components/ClothingCard';
import { getAllClothing } from '@/db/queries';
import { type ClothingItem } from '@/types';

export default function WardrobeScreen() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<ClothingItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAllClothing(db).then(setItems);
    }, [db])
  );

  return (
    <View className="flex-1 bg-slate-50">
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-6xl mb-4">👗</Text>
          <Text className="text-slate-700 text-lg font-semibold text-center">Your wardrobe is empty</Text>
          <Text className="text-slate-400 text-sm text-center mt-2">
            Add your first item to start building your digital wardrobe.
          </Text>
          <TouchableOpacity
            className="mt-6 bg-indigo-500 px-6 py-3 rounded-full"
            onPress={() => router.push('/clothing/add')}
          >
            <Text className="text-white font-semibold">Add First Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 6, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <ClothingCard item={item} onPress={() => router.push(`/clothing/${item.id}`)} />
          )}
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-indigo-500 items-center justify-center"
        style={{ elevation: 6, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 }}
        onPress={() => router.push('/clothing/add')}
      >
        <Text className="text-white text-3xl leading-none mt-[-2px]">+</Text>
      </TouchableOpacity>
    </View>
  );
}
