import { useState, useEffect } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import RoomCard from '../components/RoomCard'
import RoomModal from '../components/RoomModal'

const QUAN = ['Cầu Giấy','Đống Đa','Hai Bà Trưng','Hoàn Kiếm','Tây Hồ','Thanh Xuân','Nam Từ Liêm','Bắc Từ Liêm']
const TIENICH_TAGS = ['máy giặt','tủ lạnh','điều hòa','tivi','bếp','nóng lạnh','ban công','thang máy','chỗ để xe']
const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE || '0901 234 567'

export default function Home() {
  const [rooms, setRooms] = useState([])
  const [filtered, setFiltered] = useState([])
  const [kv, setKv] = useState('')
  const [gia, setGia] = useState('')
  const [dienTich, setDienTich] = useState('')
  const [loai, setLoai] = useState('')
  const [tags, setTags] = useState([])
  const [sort, setSort] = useState('new')
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchRooms() }, [])

  async function fetchRooms() {
    const { data } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) { setRooms(data); setFiltered(data) }
  }

  useEffect(() => {
    let list = [...rooms]
    if (kv) list = list.filter(r => r.kv === kv)
    if (gia) {
      const [mn, mx] = gia.split('-').map(Number)
      list = list.filter(r => r.gia >= mn && r.gia <= mx)
    }
    if (dienTich) {
      const [mn, mx] = dienTich.split('-').map(Number)
      list = list.filter(r => !r.dien_tich || (r.dien_tich >= mn && r.dien_tich <= mx))
    }
    if (loai) list = list.filter(r => r.loai === loai)
    tags.forEach(t => { list = list.filter(r => (r.tienich || []).includes(t)) })
    if (sort === 'price-asc') list.sort((a, b) => a.gia - b.gia)
    else if (sort === 'price-desc') list.sort((a, b) => b.gia - a.gia)
    setFiltered(list)
  }, [rooms, kv, gia, dienTich, loai, tags, sort])

  function toggleTag(t) {
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  function resetFilters() {
    setKv(''); setGia(''); setDienTich(''); setLoai(''); setTags([])
  }

  const hasFilter = kv || gia || dienTich || loai || tags.length > 0

  return (
    <>
      <Head>
        <title>TrọTốt – Tìm phòng trọ</title>
        <meta name="description" content="Tìm phòng trọ tại Hà Nội – cập nhật liên tục" />
      </Head>

      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-gray-800">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">🏠</div>
          TrọTốt
        </div>
        <a href={`tel:${HOTLINE.replace(/\s/g,'')}`} className="text-emerald-600 font-medium text-sm flex items-center gap-1">
          📞 {HOTLINE}
        </a>
      </header>

      <div className="bg-emerald-500 px-4 pt-6 pb-5">
        <h1 className="text-white text-xl font-medium mb-1">Tìm phòng trọ phù hợp</h1>
        <p className="text-emerald-100 text-xs mb-4">Danh sách cập nhật liên tục · Liên hệ trực tiếp tư vấn viên</p>
        <div className="bg-white rounded-xl p-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Khu vực</label>
            <select value={kv} onChange={e => setKv(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
              <option value="">Tất cả</option>
              {QUAN.map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Mức giá</label>
            <select value={gia} onChange={e => setGia(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
              <option value="">Tất cả</option>
              <option value="0-3">Dưới 3 triệu</option>
              <option value="3-5">3–5 triệu</option>
              <option value="5-8">5–8 triệu</option>
              <option value="8-99">Trên 8 triệu</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Diện tích</label>
            <select value={dienTich} onChange={e => setDienTich(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
              <option value="">Tất cả</option>
              <option value="0-20">Dưới 20m²</option>
              <option value="20-30">20–30m²</option>
              <option value="30-45">30–45m²</option>
              <option value="45-999">Trên 45m²</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Loại phòng</label>
            <select value={loai} onChange={e => setLoai(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
              <option value="">Tất cả</option>
              <option>Phòng đơn</option>
              <option>1 ngủ 1 bếp</option>
              <option>Mini studio</option>
              <option>Căn hộ mini</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap mt-3">
          {TIENICH_TAGS.map(t => (
            <button key={t} onClick={() => toggleTag(t)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${tags.includes(t) ? 'bg-white text-emerald-600 border-white font-medium' : 'border-emerald-300 text-emerald-100'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Tìm thấy {filtered.length} phòng</span>
            {hasFilter && (
              <button onClick={resetFilters} className="text-xs text-emerald-600 underline underline-offset-2">
                Xóa bộ lọc
              </button>
            )}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1">
            <option value="new">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">🏚️</div>
              Không có phòng phù hợp. Thử điều chỉnh bộ lọc.
            </div>
          )}
          {filtered.map(r => (
            <RoomCard key={r.id} room={r} onOpen={() => setSelected(r)} hotline={HOTLINE} />
          ))}
        </div>
      </main>

      {selected && <RoomModal room={selected} onClose={() => setSelected(null)} hotline={HOTLINE} />}
    </>
  )
}
