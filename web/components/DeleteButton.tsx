'use client';

type Props = {
  action: () => Promise<void>;
  message: string;
  label?: string;
};

export default function DeleteButton({ action, message, label = 'Delete' }: Props) {
  async function handleClick() {
    if (!confirm(message)) return;
    await action();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full border border-red-200 text-red-500 py-3 rounded-2xl font-semibold hover:bg-red-50 transition-colors"
    >
      {label}
    </button>
  );
}
