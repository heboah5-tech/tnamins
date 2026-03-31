export function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white/80 backdrop-blur-sm">
      <img src="/tameeni-logo.webp" alt="تأميني" className="w-14 h-14 rounded-2xl object-contain" />
      <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#1976d2] animate-spin" />
      <p className="text-sm font-medium text-gray-500">جاري التحميل...</p>
    </div>
  );
}
