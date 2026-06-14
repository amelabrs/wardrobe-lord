import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import TagChip from '@/components/TagChip';
import { deleteClothing, getAllLocations, getClothingById, markAsWornToday, updateClothing } from '@/db/queries';
import { PRESET_TAGS } from '@/constants/tags';
import { type ClothingItem, type Location } from '@/types';

async function saveImageLocally(uri: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}wardrobe/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const filename = `${Date.now()}_${uri.split('/').pop()}`;
  const dest = `${dir}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

function formatLastWorn(date: string | null): string {
  if (!date) return 'Never worn';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff === 0) return 'Worn today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
  return `${Math.floor(diff / 30)} months ago`;
}

export default function ClothingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [comments, setComments] = useState('');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [lastWorn, setLastWorn] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [clothing, locs] = await Promise.all([
          getClothingById(db, Number(id)),
          getAllLocations(db),
        ]);
        if (clothing) {
          setItem(clothing);
          setName(clothing.name);
          setPhotos(clothing.photo_uris);
          setSelectedTags(clothing.tags);
          setComments(clothing.comments);
          setLocationId(clothing.location_id);
          setLastWorn(clothing.last_worn_date || '');
        }
        setLocations(locs);
      }
      load();
    }, [db, id])
  );

  async function pickImage(useCamera: boolean) {
    if (photos.length >= 5) return;
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const saved = await saveImageLocally(result.assets[0].uri);
      setPhotos((prev) => [...prev, saved]);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase();
    if (t && !selectedTags.includes(t)) setSelectedTags((prev) => [...prev, t]);
    setCustomTag('');
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    await updateClothing(db, Number(id), {
      name: name.trim(),
      photo_uris: photos,
      tags: selectedTags,
      comments: comments.trim(),
      location_id: locationId,
      last_worn_date: lastWorn || null,
    });
    const updated = await getClothingById(db, Number(id));
    setItem(updated);
    setEditing(false);
  }

  async function handleMarkWorn() {
    await markAsWornToday(db, Number(id));
    const updated = await getClothingById(db, Number(id));
    setItem(updated);
    setLastWorn(updated?.last_worn_date || '');
  }

  async function handleDelete() {
    Alert.alert('Delete Item', `Remove "${item?.name}" from your wardrobe?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteClothing(db, Number(id));
          router.back();
        },
      },
    ]);
  }

  if (!item) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: editing ? 'Edit' : item.name,
          headerRight: () => (
            <TouchableOpacity onPress={() => (editing ? handleSave() : setEditing(true))}>
              <Text className="text-indigo-500 font-semibold text-base mr-1">
                {editing ? 'Save' : 'Edit'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

          {/* Photos */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-white" contentContainerStyle={{ padding: 16 }}>
            {photos.map((uri, i) => (
              <View key={i} className="mr-2 relative">
                <Image source={{ uri }} className="w-32 h-32 rounded-xl bg-slate-200" resizeMode="cover" />
                {editing && (
                  <TouchableOpacity
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
                    onPress={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                  >
                    <Text className="text-white text-xs font-bold">✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {editing && photos.length < 5 && (
              <View className="flex-row">
                <TouchableOpacity
                  className="w-32 h-32 rounded-xl bg-slate-100 items-center justify-center mr-2"
                  onPress={() => pickImage(false)}
                >
                  <Text className="text-3xl">🖼️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-32 h-32 rounded-xl bg-slate-100 items-center justify-center"
                  onPress={() => pickImage(true)}
                >
                  <Text className="text-3xl">📷</Text>
                </TouchableOpacity>
              </View>
            )}
            {photos.length === 0 && !editing && (
              <View className="w-32 h-32 rounded-xl bg-slate-100 items-center justify-center">
                <Text className="text-5xl">👗</Text>
              </View>
            )}
          </ScrollView>

          <View className="px-4 pt-4">

            {/* Name */}
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Name</Text>
            {editing ? (
              <TextInput
                className="bg-white rounded-xl px-4 py-3 text-slate-800 text-base mb-4 border border-slate-200"
                value={name}
                onChangeText={setName}
              />
            ) : (
              <Text className="text-slate-800 text-xl font-bold mb-4">{item.name}</Text>
            )}

            {/* Last worn */}
            {!editing && (
              <View className="flex-row items-center mb-4">
                <View className="flex-1">
                  <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Last Worn</Text>
                  <Text className="text-slate-700">{formatLastWorn(item.last_worn_date)}</Text>
                </View>
                <TouchableOpacity
                  className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5"
                  onPress={handleMarkWorn}
                >
                  <Text className="text-indigo-600 font-medium text-sm">Worn today</Text>
                </TouchableOpacity>
              </View>
            )}
            {editing && (
              <>
                <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Last Worn</Text>
                <View className="flex-row items-center mb-4">
                  <TouchableOpacity
                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 mr-2"
                    onPress={() => setLastWorn(new Date().toISOString().split('T')[0])}
                  >
                    <Text className="text-slate-700">Today</Text>
                  </TouchableOpacity>
                  <TextInput
                    className="flex-1 bg-white rounded-xl px-4 py-3 text-slate-800 border border-slate-200"
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#94a3b8"
                    value={lastWorn}
                    onChangeText={setLastWorn}
                  />
                </View>
              </>
            )}

            {/* Location */}
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Location</Text>
            {!editing ? (
              <Text className="text-slate-700 mb-4">{item.location_name || 'Not assigned'}</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <TouchableOpacity
                  className={['rounded-xl px-4 py-2.5 mr-2 border', locationId === null ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-200'].join(' ')}
                  onPress={() => setLocationId(null)}
                >
                  <Text className={locationId === null ? 'text-white font-medium' : 'text-slate-600'}>None</Text>
                </TouchableOpacity>
                {locations.map((loc) => (
                  <TouchableOpacity
                    key={loc.id}
                    className={['rounded-xl px-4 py-2.5 mr-2 border', locationId === loc.id ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-slate-200'].join(' ')}
                    onPress={() => setLocationId(loc.id)}
                  >
                    <Text className={locationId === loc.id ? 'text-white font-medium' : 'text-slate-600'}>{loc.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Tags */}
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Tags</Text>
            {!editing ? (
              <View className="flex-row flex-wrap mb-4">
                {item.tags.length > 0
                  ? item.tags.map((tag) => <TagChip key={tag} label={tag} selected small />)
                  : <Text className="text-slate-400 text-sm">No tags</Text>}
              </View>
            ) : (
              <>
                <View className="flex-row flex-wrap mb-2">
                  {PRESET_TAGS.map((tag) => (
                    <TagChip key={tag} label={tag} selected={selectedTags.includes(tag)} onPress={() => toggleTag(tag)} />
                  ))}
                  {selectedTags.filter((t) => !PRESET_TAGS.includes(t)).map((tag) => (
                    <TagChip key={tag} label={tag} selected onPress={() => toggleTag(tag)} />
                  ))}
                </View>
                <View className="flex-row items-center mb-4">
                  <TextInput
                    className="flex-1 bg-white rounded-xl px-4 py-3 text-slate-800 text-sm border border-slate-200 mr-2"
                    placeholder="Add custom tag…"
                    placeholderTextColor="#94a3b8"
                    value={customTag}
                    onChangeText={setCustomTag}
                    onSubmitEditing={addCustomTag}
                    returnKeyType="done"
                  />
                  <TouchableOpacity className="bg-indigo-500 rounded-xl px-4 py-3" onPress={addCustomTag}>
                    <Text className="text-white font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Comments */}
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Comments</Text>
            {!editing ? (
              <Text className="text-slate-700 mb-6">{item.comments || 'No comments'}</Text>
            ) : (
              <TextInput
                className="bg-white rounded-xl px-4 py-3 text-slate-800 text-base mb-6 border border-slate-200"
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 80 }}
              />
            )}

            {/* Delete */}
            {!editing && (
              <TouchableOpacity
                className="border border-red-300 rounded-2xl py-4 items-center"
                onPress={handleDelete}
              >
                <Text className="text-red-500 font-semibold">Delete Item</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
