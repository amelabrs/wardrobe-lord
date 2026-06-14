'use client';

type Props = {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  small?: boolean;
};

export default function TagChip({ label, selected = false, onToggle, small = false }: Props) {
  const base = small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const color = selected
    ? 'bg-indigo-500 text-white border-indigo-500'
    : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400';

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      className={`${base} ${color} rounded-full border font-medium transition-colors mr-2 mb-2 disabled:cursor-default`}
    >
      {label}
    </button>
  );
}
