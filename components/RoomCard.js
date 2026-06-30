import Image from 'next/image'

export default function RoomCard({ room: r, onOpen, hotline }) {
  return (
    <div onClick={onOpen} className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-400 transition-colors">
      {/* Thumbnail */}
      <div className="relative h-44 bg-gray-100">
        {r.images && r.images.length > 0 ? (
          <Image src={r.images[0]} alt={r.ten} fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
            <span className="text-3xl">🏠</span>
            <span className="text-xs">Chưa có ảnh</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {r.available ? 'Còn trống' : 'Đã thuê'}
          </span>
          {r.is_new && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Mới</span>}
        </div>
        {r.images && r.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            📷 {r.images.length}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="font-medium text-gray-800 text-sm mb-1 leading-snug">{r.ten}</div>
        <div className="text-xs text-gray-400 mb-2">📍 {r.kv} · {r.tang}</div>
        <div className="text-lg font-medium text-emerald-500 mb-2">
          {r.gia.toFixed(1)} triệu <span className="text-xs font-normal text-gray-400">/tháng</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {(r.tienich || []).slice(0, 4).map(t => (
            <span key={t} className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 text-gray-500">{t}</span>
          ))}
          {(r.tienich || []).length > 4 && (
            <span className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 text-gray-500">+{r.tienich.length - 4}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={e => { e.stopPropagation(); onOpen() }} className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            Xem chi tiết
          </button>
          <a href={`tel:${hotline.replace(/\s/g,'')}`} onClick={e => e.stopPropagation()}
            className="flex-1 text-xs py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-center font-medium">
            📞 Liên hệ
          </a>
        </div>
      </div>
    </div>
  )
}
