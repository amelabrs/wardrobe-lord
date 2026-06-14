import { Image, Text, TouchableOpacity, View } from 'react-native';
import { type Location } from '@/types';

type Props = {
  location: Location;
  clothingCount?: number;
  onPress: () => void;
};

export default function LocationCard({ location, clothingCount, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-xl mx-4 mb-3 overflow-hidden"
      style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }}
    >
      {location.photo_uri ? (
        <Image
          source={{ uri: location.photo_uri }}
          className="w-20 h-20 bg-slate-100"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 bg-slate-100 items-center justify-center">
          <Text className="text-3xl">📦</Text>
        </View>
      )}
      <View className="flex-1 px-4">
        <Text className="text-slate-800 font-semibold text-base">{location.name}</Text>
        {location.description ? (
          <Text className="text-slate-500 text-sm mt-0.5" numberOfLines={2}>
            {location.description}
          </Text>
        ) : null}
        {clothingCount !== undefined && (
          <Text className="text-indigo-400 text-xs mt-1">
            {clothingCount} {clothingCount === 1 ? 'item' : 'items'}
          </Text>
        )}
      </View>
      <Text className="text-slate-300 text-lg pr-4">›</Text>
    </TouchableOpacity>
  );
}
