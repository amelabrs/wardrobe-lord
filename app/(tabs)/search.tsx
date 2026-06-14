import { FlatList, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import ClothingCard from '@/components/ClothingCard';
import TagChip from '@/components/TagChip';
import { searchClothing } from '@/db/queries';
import { PRESET_TAGS } from '@/constants/tags';
import { type ClothingItem } from '@/types';

export default function SearchScreen() {
  const db = useSQLiteContext();
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [results, setResults] = useState<ClothingItem[]>([]);

  const runSearch = useCallback(async () => {
    const found = await searchClothing(db, query, activeTags);
    setResults(found);
  }, [db, query, activeTags]);

  useFocusEffect(useCallback(() => { runSearch(); }, [runSearch]));
  useEffect(() => { runSearch(); }, [runSearch]);

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white px-4 pt-3 pb-2 border-b border-slate-100">
        <View className="bg-slate-100 rounded-xl flex-row items-center px-3 py-2">
          <Text className="text-slate-400 mr-2">🔍</Text>
          <TextInput
            className="flex-1 text-slate-800 text-base"
            placeholder="Search name or comments…"
            placeholderTextColor="#94a3b8"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text className="text-slate-400 text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerStyle={{ paddingBottom: 4 }}
        >
          {PRESET_TAGS.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              selected={activeTags.includes(tag)}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </ScrollView>
      </View>

      {results.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-400 text-base">
            {query || activeTags.length > 0 ? 'No results found' : 'Search your wardrobe above'}
          </Text>
        </View>
      ) : (
        <>
          <Text className="text-slate-400 text-xs px-4 pt-3 pb-1">
            {results.length} {results.length === 1 ? 'item' : 'items'}
          </Text>
          <FlatList
            data={results}
            keyExtractor={(item) => String(item.id)}
            numColumns={2}
            contentContainerStyle={{ padding: 6, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <ClothingCard item={item} onPress={() => router.push(`/clothing/${item.id}`)} />
            )}
          />
        </>
      )}
    </View>
  );
}
