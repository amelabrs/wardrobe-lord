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
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import TagChip from '@/components/TagChip';
import { addClothing, getAllLocations } from '@/db/queries';
import { PRESET_TAGS } from '@/constants/tags';
import { type Location } from '@/types';

async function saveImageLocally(uri: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}wardrobe/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const filename = `${Date.now()}_${uri.split('/').pop()}`;
  const dest = `${dir}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export default function AddClothingScreen() {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [comments, setComments] = useState('');
  const [locationId, setLocationId] = useState<number | null>(null);
  const [lastWorn, setLastWorn] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getAllLocations(db).then(setLocations);
    }, [db])
  );

  async function pickImage(useCamera: boolean) {
    if (photos.length >= 5) {
      Alert.alert('Limit reached', 'You can add up to 5 photos.');
      return;
    }
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access in Settings.');
      return;
    }
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
    if (t && !selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTag('');
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this item.');
      return;
    }
    setSaving(true);
    try {
      await addClothing(db, {
        name: name.trim(),
        photo_uris: photos,
        tags: selectedTags,
        comments: comments.trim(),
        location_id: locationId,
        last_worn_date: lastWorn || null,
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Could not save item.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

        {/* Photos */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {photos.map((uri, i) => (
            <View key={i} className="mr-2 relative">
              <Image source={{ uri }} className="w-24 h-24 rounded-xl bg-slate-200" resizeMode="cover" />
              <TouchableOpacity
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
                onPress={() => setPhotos((p) => p.filter((_, j) => j !== i))}
              >
                <Text className="text-white text-xs font-bold">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 && (
            <View className="flex-row">
              <TouchableOpacity
                className="w-24 h-24 rounded-xl bg-slate-200 items-center justify-center mr-2"
                onPress={() => pickImage(false)}
              >
                <Text className="text-3xl">🖼️</Text>
                <Text className="text-slate-500 text-xs mt-1">Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-24 h-24 rounded-xl bg-slate-200 items-center justify-center"
                onPress={() => pickImage(true)}
              >
                <Text className="text-3xl">📷</Text>
                <Text className="text-slate-500 text-xs mt-1">Camera</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Name */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Name *</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 text-slate-800 text-base mb-4 border border-slate-200"
          placeholder="e.g. Blue Linen Shirt"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        {/* Tags */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Tags</Text>
        <View className="flex-row flex-wrap mb-2">
          {PRESET_TAGS.map((tag) => (
            <TagChip key={tag} label={tag} selected={selectedTags.includes(tag)} onPress={() => toggleTag(tag)} />
          ))}
        </View>
        {selectedTags.filter((t) => !PRESET_TAGS.includes(t)).map((tag) => (
          <TagChip key={tag} label={tag} selected onPress={() => toggleTag(tag)} />
        ))}
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

        {/* Comments */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Comments</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 text-slate-800 text-base mb-4 border border-slate-200"
          placeholder="Notes about this item…"
          placeholderTextColor="#94a3b8"
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ minHeight: 80 }}
        />

        {/* Location */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Store In</Text>
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

        {/* Last worn */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Last Worn</Text>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 mr-2"
            onPress={() => setLastWorn(new Date().toISOString().split('T')[0])}
          >
            <Text className="text-slate-700">Today</Text>
          </TouchableOpacity>
          <TextInput
            className="flex-1 bg-white rounded-xl px-4 py-3 text-slate-800 text-base border border-slate-200"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={lastWorn}
            onChangeText={setLastWorn}
            keyboardType="numeric"
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          className={['rounded-2xl py-4 items-center', saving ? 'bg-indigo-300' : 'bg-indigo-500'].join(' ')}
          onPress={save}
          disabled={saving}
        >
          <Text className="text-white font-bold text-base">{saving ? 'Saving…' : 'Save Item'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
