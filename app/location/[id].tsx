import {
  Alert,
  FlatList,
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
import ClothingCard from '@/components/ClothingCard';
import { deleteLocation, getClothingByLocation, getLocationById, updateLocation } from '@/db/queries';
import { type ClothingItem, type Location } from '@/types';

async function saveImageLocally(uri: string): Promise<string> {
  const dir = `${FileSystem.documentDirectory}wardrobe/locations/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const filename = `${Date.now()}_${uri.split('/').pop()}`;
  const dest = `${dir}${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export default function LocationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const [location, setLocation] = useState<Location | null>(null);
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [loc, items] = await Promise.all([
          getLocationById(db, Number(id)),
          getClothingByLocation(db, Number(id)),
        ]);
        if (loc) {
          setLocation(loc);
          setName(loc.name);
          setPhoto(loc.photo_uri);
          setDescription(loc.description);
        }
        setClothes(items);
      }
      load();
    }, [db, id])
  );

  async function pickImage(useCamera: boolean) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      const saved = await saveImageLocally(result.assets[0].uri);
      setPhoto(saved);
    }
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Name required'); return; }
    await updateLocation(db, Number(id), { name: name.trim(), photo_uri: photo, description: description.trim() });
    const updated = await getLocationById(db, Number(id));
    setLocation(updated);
    setEditing(false);
  }

  async function handleDelete() {
    Alert.alert('Delete Location', `Remove "${location?.name}"? Clothes stored here will become unassigned.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLocation(db, Number(id));
          router.back();
        },
      },
    ]);
  }

  if (!location) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: editing ? 'Edit Location' : location.name,
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

          {/* Photo */}
          {editing ? (
            <View className="px-4 pt-4 mb-4">
              {photo ? (
                <View className="relative">
                  <Image source={{ uri: photo }} className="w-full h-48 rounded-2xl bg-slate-200" resizeMode="cover" />
                  <View className="absolute top-2 right-2 flex-row">
                    <TouchableOpacity className="bg-white rounded-full w-8 h-8 items-center justify-center mr-1 shadow" onPress={() => pickImage(false)}>
                      <Text>🖼️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-white rounded-full w-8 h-8 items-center justify-center shadow" onPress={() => pickImage(true)}>
                      <Text>📷</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className="flex-row">
                  <TouchableOpacity className="flex-1 h-36 rounded-2xl bg-slate-200 items-center justify-center mr-2" onPress={() => pickImage(false)}>
                    <Text className="text-4xl">🖼️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 h-36 rounded-2xl bg-slate-200 items-center justify-center" onPress={() => pickImage(true)}>
                    <Text className="text-4xl">📷</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            photo && (
              <Image source={{ uri: photo }} className="w-full h-52 bg-slate-200" resizeMode="cover" />
            )
          )}

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
              <Text className="text-slate-800 text-2xl font-bold mb-3">{location.name}</Text>
            )}

            {/* Description */}
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Description</Text>
            {editing ? (
              <TextInput
                className="bg-white rounded-xl px-4 py-3 text-slate-800 text-base mb-4 border border-slate-200"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 72 }}
              />
            ) : (
              <Text className="text-slate-700 mb-6">{location.description || 'No description'}</Text>
            )}

            {/* Clothes stored here */}
            {!editing && (
              <>
                <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
                  Stored Here ({clothes.length})
                </Text>
                {clothes.length === 0 ? (
                  <Text className="text-slate-400 text-sm mb-6">No items stored here yet.</Text>
                ) : (
                  <View className="flex-row flex-wrap mb-6">
                    {clothes.map((item) => (
                      <View key={item.id} className="w-1/2 p-0">
                        <ClothingCard item={item} onPress={() => router.push(`/clothing/${item.id}`)} />
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  className="border border-red-300 rounded-2xl py-4 items-center"
                  onPress={handleDelete}
                >
                  <Text className="text-red-500 font-semibold">Delete Location</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
