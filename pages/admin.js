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
      mota: parsed.mota || f.mota,
      ten: (parsed.loai || 'Phòng trọ') + (parsed.kv ? ` – ${parsed.kv}` : ''),
    }))
    setMsg('Đã điền tự động — kiểm tra lại các ô, phần nào parser không bắt được đã có sẵn trong "Mô tả thêm" để bạn tự bổ sung tay.')
    setTimeout(() => setMsg(''), 6000)
  }

  function handleImgChange(e) {
    const files = Array.from(e.target.files)
    setImgFiles(prev => [...prev, ...files])
    setImgPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function handleImgPaste(e) {
    const items = e.clipboardData?.items
    if (!items) return
    const pastedFiles = []
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) pastedFiles.push(file)
      }
    }
    if (pastedFiles.length > 0) {
      e.preventDefault()
      setImgFiles(prev => [...prev, ...pastedFiles])
      setImgPreviews(prev => [...prev, ...pastedFiles.map(f => URL.createObjectURL(f))])
      setMsg(`Đã dán ${pastedFiles.length} ảnh từ clipboard!`)
      setTimeout(() => setMsg(''), 3000)
    }
  }

  function removeImg(idx) {
    setImgFiles(prev => prev.filter((_, i) => i !== idx))
    setImgPreviews(prev => prev.filter((_, i) => i !== idx))
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
