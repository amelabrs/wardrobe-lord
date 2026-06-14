import { Text, TouchableOpacity } from 'react-native';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
};

export default function TagChip({ label, selected = false, onPress, small = false }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className={[
        'rounded-full border mr-2 mb-2',
        small ? 'px-2 py-0.5' : 'px-3 py-1',
        selected
          ? 'bg-indigo-500 border-indigo-500'
          : 'bg-white border-slate-300',
      ].join(' ')}
    >
      <Text
        className={[
          'font-medium',
          small ? 'text-xs' : 'text-sm',
          selected ? 'text-white' : 'text-slate-600',
        ].join(' ')}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
