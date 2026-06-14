import { Image, Text, TouchableOpacity, View } from 'react-native';
import { type ClothingItem } from '@/types';

type Props = {
  item: ClothingItem;
  onPress: () => void;
};

function formatLastWorn(date: string | null): string {
  if (!date) return 'Never worn';
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (diff === 0) return 'Worn today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

export default function ClothingCard({ item, onPress }: Props) {
  const firstPhoto = item.photo_uris[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 m-1.5 rounded-xl bg-white overflow-hidden"
      style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 }}
    >
      {firstPhoto ? (
        <Image source={{ uri: firstPhoto }} className="w-full aspect-square bg-slate-100" resizeMode="cover" />
      ) : (
        <View className="w-full aspect-square bg-slate-100 items-center justify-center">
          <Text className="text-4xl">👗</Text>
        </View>
      )}
      <View className="p-2">
        <Text className="text-slate-800 font-semibold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-slate-400 text-xs mt-0.5">{formatLastWorn(item.last_worn_date)}</Text>
        {item.tags.length > 0 && (
          <Text className="text-indigo-400 text-xs mt-0.5" numberOfLines={1}>
            {item.tags.slice(0, 3).join(' · ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
