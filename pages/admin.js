import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { supabase } from '../lib/supabase'
import { uploadToCloudinary } from '../lib/cloudinary'
import { parseZaloText } from '../lib/parseZalo'

const QUAN = ['Cầu Giấy','Đống Đa','Hai Bà Trưng','Hoàn Kiếm','Tây Hồ','Thanh Xuân','Nam Từ Liêm','Bắc Từ Liêm']
const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'admin123'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [rooms, setRooms] = useState([])
  const [pasteText, setPasteText] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [imgPreviews, setImgPreviews] = useState([])
  const [imgFiles, setImgFiles] = useState([])
  const fileRef = useRef()

  const [form, setForm] = useState({
    ten: '', ma: '', kv: '', dc: '', gia: '', loai: '1 ngủ 1 bếp',
    tang: '', tienich: '', dien: '', nuoc: '', wifi: '', vs: '', luuy: '', mota: '', available: true
  })

  useEffect(() => { if (authed) fetchRooms() }, [authed])

  async function fetchRooms() {
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false })
    if (data) setRooms(data)
  }

  function login() {
    if (pass === ADMIN_PASS) setAuthed(true)
    else alert('Sai mật khẩu')
  }

  function handlePaste() {
    if (!pasteText.trim()) return
    const parsed = parseZaloText(pasteText)
    setForm(f => ({
      ...f,
      ma: parsed.ma || f.ma,
      kv: parsed.kv || f.kv,
      dc: parsed.dc || f.dc,
      tang: parsed.tang || f.tang,
      loai: parsed.loai || f.loai,
      gia: parsed.gia ? String(parsed.gia) : f.gia,
      tienich: parsed.tienich.length ? parsed.tienich.join(', ') : f.tienich,
      dien: parsed.dien || f.dien,
      nuoc: parsed.nuoc || f.nuoc,
      wifi: parsed.wifi || f.wifi,
      vs: parsed.vs || f.vs,
      luuy: parsed.luuy || f.luuy,
      ten: parsed.loai + (parsed.kv ? ` – ${parsed.kv}` : ''),
    }))
    setMsg('Đã điền tự động từ bài đăng!')
    setTimeout(() => setMsg(''), 3000)
  }

  function handleImgChange(e) {
    const files = Array.from(e.target.files)
    setImgFiles(files)
    setImgPreviews(files.map(f => URL.createObjectURL(f)))
  }

  async function saveRoom() {
    if (!form.ten || !form.kv || !form.gia) { alert('Cần điền tên phòng, khu vực, giá'); return }
    setSaving(true)
    setMsg('Đang upload ảnh...')
    let imageUrls = []
    try {
      for (const file of imgFiles) {
        const url = await uploadToCloudinary(file)
        imageUrls.push(url)
      }
      setMsg('Đang lưu phòng...')
      const { error } = await supabase.from('rooms').insert({
        ten: form.ten, ma: form.ma, kv: form.kv, dc: form.dc,
        gia: parseFloat(form.gia), loai: form.loai, tang: form.tang,
        tienich: form.tienich.split(',').map(x => x.trim()).filter(Boolean),
        dien: form.dien, nuoc: form.nuoc, wifi: form.wifi, vs: form.vs,
        luuy: form.luuy, mota: form.mota,
        available: form.available, is_new: true,
        images: imageUrls,
      })
      if (error) throw error
      setMsg('✅ Đã lưu thành công!')
      setForm({ ten:'',ma:'',kv:'',dc:'',gia:'',loai:'1 ngủ 1 bếp',tang:'',tienich:'',dien:'',nuoc:'',wifi:'',vs:'',luuy:'',mota:'',available:true })
      setPasteText('')
      setImgFiles([])
      setImgPreviews([])
      fetchRooms()
    } catch (e) {
      setMsg('❌ Lỗi: ' + e.message)
    }
    setSaving(false)
  }

  async function toggleAvail(id, current) {
    await supabase.from('rooms').update({ available: !current }).eq('id', id)
    fetchRooms()
  }

  async function deleteRoom(id) {
    if (!confirm('Xóa phòng này?')) return
    await supabase.from('rooms').delete().eq('id', id)
    fetchRooms()
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 w-80">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl mx-auto flex items-center justify-center text-white text-xl mb-3">🏠</div>
          <h1 className="font-medium text-gray-800">TrọTốt Admin</h1>
        </div>
        <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Mật khẩu admin" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-emerald-400" />
        <button onClick={login} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium text-sm">Đăng nhập</button>
      </div>
    </div>
  )

  return (
    <>
      <Head><title>Admin – TrọTốt</title></Head>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-gray-800">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-sm">🏠</div>
          TrọTốt <span className="text-gray-300">|</span> <span className="text-sm text-gray-400">Admin</span>
        </div>
        <a href="/" className="text-sm text-emerald-600">← Xem listing</a>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Form */}
        <div className="space-y-3">
          {/* Paste */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <h2 className="font-medium text-gray-800 text-sm mb-3">📋 Paste từ Zalo / Facebook</h2>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)}
              rows={5} placeholder="Dán nội dung bài đăng vào đây..."
              className="w-full text-xs border border-gray-200 rounded-lg p-2.5 bg-gray-50 resize-none outline-none focus:border-emerald-400 leading-relaxed" />
            <button onClick={handlePaste} className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium">
              ✨ Tự động điền form
            </button>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
            <h2 className="font-medium text-gray-800 text-sm">📝 Thông tin phòng</h2>

            {msg && <div className="bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded-lg">{msg}</div>}

            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-400 block mb-1">Tên phòng</label>
                <input value={form.ten} onChange={e => setForm(f=>({...f,ten:e.target.value}))} className="inp" placeholder="Phòng 1N1B – Cầu Giấy" /></div>
              <div><label className="text-xs text-gray-400 block mb-1">Mã phòng</label>
                <input value={form.ma} onChange={e => setForm(f=>({...f,ma:e.target.value}))} className="inp" placeholder="TS192" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-400 block mb-1">Khu vực</label>
                <select value={form.kv} onChange={e => setForm(f=>({...f,kv:e.target.value}))} className="inp">
                  <option value="">Chọn...</option>
                  {QUAN.map(q=><option key={q}>{q}</option>)}
                </select></div>
              <div><label className="text-xs text-gray-400 block mb-1">Giá (triệu/tháng)</label>
                <input value={form.gia} onChange={e => setForm(f=>({...f,gia:e.target.value}))} className="inp" placeholder="5" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-400 block mb-1">Loại phòng</label>
                <select value={form.loai} onChange={e => setForm(f=>({...f,loai:e.target.value}))} className="inp">
                  <option>1 ngủ 1 bếp</option><option>Phòng đơn</option><option>Mini studio</option><option>Căn hộ mini</option>
                </select></div>
              <div><label className="text-xs text-gray-400 block mb-1">Tầng / Thang</label>
                <input value={form.tang} onChange={e => setForm(f=>({...f,tang:e.target.value}))} className="inp" placeholder="Tầng 4 – Thang bộ" /></div>
            </div>
            <div><label className="text-xs text-gray-400 block mb-1">Địa chỉ đầy đủ</label>
              <input value={form.dc} onChange={e => setForm(f=>({...f,dc:e.target.value}))} className="inp" placeholder="Ngõ 169 Doãn Kế Thiện, Cầu Giấy" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">Tiện ích (cách dấu phẩy)</label>
              <input value={form.tienich} onChange={e => setForm(f=>({...f,tienich:e.target.value}))} className="inp" placeholder="máy lạnh, tủ lạnh, bếp" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-xs text-gray-400 block mb-1">Điện</label>
                <input value={form.dien} onChange={e => setForm(f=>({...f,dien:e.target.value}))} className="inp" placeholder="3.800đ/số" /></div>
              <div><label className="text-xs text-gray-400 block mb-1">Nước</label>
                <input value={form.nuoc} onChange={e => setForm(f=>({...f,nuoc:e.target.value}))} className="inp" placeholder="120.000đ/người" /></div>
              <div><label className="text-xs text-gray-400 block mb-1">Wifi</label>
                <input value={form.wifi} onChange={e => setForm(f=>({...f,wifi:e.target.value}))} className="inp" placeholder="100.000đ/phòng" /></div>
              <div><label className="text-xs text-gray-400 block mb-1">Vệ sinh</label>
                <input value={form.vs} onChange={e => setForm(f=>({...f,vs:e.target.value}))} className="inp" placeholder="25.000đ/người" /></div>
            </div>
            <div><label className="text-xs text-gray-400 block mb-1">Lưu ý</label>
              <input value={form.luuy} onChange={e => setForm(f=>({...f,luuy:e.target.value}))} className="inp" placeholder="1 cọc 1 · Gọi trước 30p" /></div>
            <div><label className="text-xs text-gray-400 block mb-1">Mô tả thêm</label>
              <textarea value={form.mota} onChange={e => setForm(f=>({...f,mota:e.target.value}))} rows={2} className="inp resize-none" placeholder="Mô tả phòng..." /></div>

            {/* Upload ảnh */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">Ảnh phòng</label>
              <div onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-gray-200 hover:border-emerald-400 rounded-lg p-4 text-center cursor-pointer transition-colors">
                <div className="text-2xl mb-1">📸</div>
                <div className="text-xs text-gray-400">Bấm để chọn ảnh (chọn nhiều ảnh một lúc)</div>
              </div>
              <input type="file" multiple accept="image/*" ref={fileRef} onChange={handleImgChange} className="hidden" />
              {imgPreviews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-2">
                  {imgPreviews.map((src, i) => (
                    <img key={i} src={src} className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-xs text-gray-500">Trạng thái</span>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.available} onChange={e => setForm(f=>({...f,available:e.target.checked}))}
                  className="accent-emerald-500 w-4 h-4" />
                Còn trống
              </label>
            </div>

            <button onClick={saveRoom} disabled={saving}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-medium text-sm">
              {saving ? 'Đang lưu...' : '💾 Lưu phòng lên listing'}
            </button>
          </div>
        </div>

        {/* RIGHT: List */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <h2 className="font-medium text-gray-800 text-sm mb-3">📋 Danh sách ({rooms.length} phòng)</h2>
          <div className="space-y-2 max-h-[680px] overflow-y-auto">
            {rooms.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">Chưa có phòng nào</div>}
            {rooms.map(r => (
              <div key={r.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium text-sm text-gray-800 leading-snug">{r.ten}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${r.available ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {r.available ? 'Trống' : 'Đã thuê'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mb-2">{r.kv} · {r.gia} tr/tháng · {r.loai}</div>
                <div className="flex gap-2">
                  <button onClick={() => toggleAvail(r.id, r.available)}
                    className="text-xs px-2.5 py-1 border border-emerald-300 text-emerald-600 rounded-lg hover:bg-emerald-50">
                    {r.available ? 'Đánh dấu đã thuê' : 'Còn trống lại'}
                  </button>
                  <button onClick={() => deleteRoom(r.id)}
                    className="text-xs px-2.5 py-1 border border-gray-200 text-gray-400 rounded-lg hover:border-red-300 hover:text-red-400">
                    🗑 Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .inp { width:100%; font-size:13px; border:1px solid #e5e7eb; border-radius:8px; padding:6px 10px; background:#f9fafb; outline:none; }
        .inp:focus { border-color:#10b981; }
      `}</style>
    </>
  )
}
