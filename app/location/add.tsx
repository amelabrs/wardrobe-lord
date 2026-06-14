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
import { useState } from 'react';
import { addLocation } from '@/db/queries';

async function saveImageLocally(uri: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}wardrobe/locations/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const filename = `${Date.now()}_${uri.split('/').pop()}`;
  const dest = `${dir}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export default function AddLocationScreen() {
  const db = useSQLiteContext();
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  async function pickImage(useCamera: boolean) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access in Settings.');
      return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const saved = await saveImageLocally(result.assets[0].uri);
      setPhoto(saved);
    }
  }

  async function save() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter a name for this location.');
      return;
    }
    setSaving(true);
    try {
      await addLocation(db, { name: name.trim(), photo_uri: photo, description: description.trim() });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save location.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">

        {/* Photo */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Location Photo</Text>
        {photo ? (
          <View className="relative mb-4">
            <Image source={{ uri: photo }} className="w-full h-48 rounded-2xl bg-slate-200" resizeMode="cover" />
            <TouchableOpacity
              className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
              onPress={() => setPhoto(null)}
            >
              <Text className="text-white font-bold">✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row mb-4">
            <TouchableOpacity
              className="flex-1 h-36 rounded-2xl bg-slate-200 items-center justify-center mr-2"
              onPress={() => pickImage(false)}
            >
              <Text className="text-4xl">🖼️</Text>
              <Text className="text-slate-500 text-sm mt-2">Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 h-36 rounded-2xl bg-slate-200 items-center justify-center"
              onPress={() => pickImage(true)}
            >
              <Text className="text-4xl">📷</Text>
              <Text className="text-slate-500 text-sm mt-2">Camera</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Name */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Location Name *</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 text-slate-800 text-base mb-4 border border-slate-200"
          placeholder="e.g. Loft, Right Box, Blue Bag"
          placeholderTextColor="#94a3b8"
          value={name}
          onChangeText={setName}
        />

        {/* Description */}
        <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Description</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 text-slate-800 text-base mb-6 border border-slate-200"
          placeholder="Where exactly is this? e.g. Top shelf in the bedroom cupboard"
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ minHeight: 80 }}
        />

        <TouchableOpacity
          className={['rounded-2xl py-4 items-center', saving ? 'bg-indigo-300' : 'bg-indigo-500'].join(' ')}
          onPress={save}
          disabled={saving}
        >
          <Text className="text-white font-bold text-base">{saving ? 'Saving…' : 'Save Location'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
