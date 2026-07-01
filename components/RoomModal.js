import { useState } from 'react'
import Image from 'next/image'

export default function RoomModal({ room: r, onClose, hotline }) {
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = r.images || []

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Images */}
        <div className="relative h-56 bg-gray-100">
          {imgs.length > 0 ? (
            <Image src={imgs[imgIdx]} alt={r.ten} fill className="object-cover rounded-t-2xl" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 rounded-t-2xl gap-2">
              <span className="text-4xl">🏠</span>
              <span className="text-xs">Chưa có ảnh</span>
            </div>
          )}
          {imgs.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {imgs.map((_, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">✕</button>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h2 className="font-medium text-gray-800 text-base leading-snug">{r.ten}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${r.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {r.available ? 'Còn trống' : 'Đã thuê'}
            </span>
          </div>
          <div className="text-xs text-gray-400 mb-2">📍 {r.dc}</div>
          <div className="text-2xl font-medium text-emerald-500 mb-4">
            {r.gia?.toFixed(1)} triệu <span className="text-sm font-normal text-gray-400">/tháng</span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              ['Loại phòng', r.loai || '–'],
              ['Diện tích', r.dien_tich ? `${r.dien_tich} m²` : '–'],
              ['Vị trí', r.tang || '–'],
              ['Mã phòng', r.ma || '–'],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-lg p-2.5">
                <div className="text-xs text-gray-400 mb-0.5">{l}</div>
                <div className="text-sm font-medium text-gray-700">{v}</div>
              </div>
            ))}
          </div>

          {/* Tiện ích */}
          {(r.tienich || []).length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Nội thất & tiện ích</div>
              <div className="flex flex-wrap gap-1.5">
                {(r.tienich || []).map(t => (
                  <span key={t} className="text-xs bg-gray-50 border border-gray-100 rounded-full px-2.5 py-1 text-gray-600">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Dịch vụ */}
          {r.dich_vu && (
            <div className="mb-4 bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">Phí dịch vụ</div>
              <ul className="text-sm text-gray-500 space-y-0.5">
                {r.dich_vu.split(' · ').map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Lưu ý */}
          {r.luuy && (
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700 mb-4">
              ⚠️ {r.luuy}
            </div>
          )}

          {/* Mô tả */}
          {r.mota && (
            <div className="mb-4">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Mô tả đầy đủ</div>
              <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{r.mota}</p>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-2">
            <a href={`tel:${hotline.replace(/\s/g,'')}`}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-center py-3 rounded-xl font-medium flex items-center justify-center gap-2">
              📞 {hotline}
            </a>
            <a href={`https://zalo.me/${hotline.replace(/\s/g,'')}`} target="_blank" rel="noreferrer"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-xl font-medium flex items-center justify-center gap-2">
              💬 Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
