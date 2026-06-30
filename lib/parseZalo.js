export function parseZaloText(raw) {
  const get = (patterns, str) => {
    for (const p of patterns) {
      const m = str.match(p)
      if (m) return m[1].trim()
    }
    return ''
  }

  // GIA - bat ca "4tr5", "4.5tr", "4,5 trieu"
  let gia = 0
  const giaPatterns = [
    /gi[áa]\s*[:\-]?\s*(\d+)\s*tr\s*(\d)?/i,
    /gi[áa]\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*tri[eệ]u/i,
    /gi[áa]\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*tr/i,
  ]
  for (const p of giaPatterns) {
    const m = raw.match(p)
    if (m) {
      if (m[2]) gia = parseFloat(`${m[1]}.${m[2]}`)
      else gia = parseFloat(m[1].replace(',', '.'))
      break
    }
  }

  const ma = get([/mã\s*[:\-]?\s*(\S+)/i, /code\s*[:\-]?\s*(\S+)/i], raw)

  const dcMatch = raw.match(/(?:địa chỉ|đc)\s*[:\-]?\s*(.+?)(?:\n|$)/i)
  const dc = dcMatch ? dcMatch[1].replace(/[🏡🏠]/g, '').trim() : ''

  const tangMatch = raw.match(/(?:trống|tầng)\s*[:\-]?\s*(.+?)(?:\n|$)/i)
  const tang = tangMatch ? tangMatch[1].trim() : ''

  let loai = ''
  const loaiScanText = raw.toLowerCase()
  if (loaiScanText.includes('1n1k') || loaiScanText.includes('1 ngủ') || loaiScanText.includes('2 ngủ'))
    loai = '1 ngủ 1 bếp'
  else if (loaiScanText.includes('studio')) loai = 'Mini studio'
  else if (loaiScanText.includes('căn hộ')) loai = 'Căn hộ mini'
  else if (loaiScanText.includes('phòng đơn')) loai = 'Phòng đơn'

  const tienich = []
  const checks = [
    [/máy lạnh|điều hòa/i, 'máy lạnh'],
    [/tủ lạnh/i, 'tủ lạnh'],
    [/bếp|nấu ăn/i, 'bếp'],
    [/tủ quần áo|tủ đồ/i, 'tủ quần áo'],
    [/ban công/i, 'ban công'],
    [/thang máy/i, 'thang máy'],
    [/gác lửng/i, 'gác lửng'],
    [/bàn ghế/i, 'bàn ghế'],
    [/nóng lạnh/i, 'nóng lạnh'],
    [/giường/i, 'giường'],
    [/máy giặt/i, 'máy giặt'],
    [/cửa vân tay/i, 'cửa vân tay'],
    [/oto|ô tô|chỗ để xe|chỗ đậu xe/i, 'chỗ để ô tô'],
  ]
  checks.forEach(([re, label]) => { if (re.test(raw)) tienich.push(label) })

  const dienM = raw.match(/điện\s*[:\-]?\s*(\d[\d,.]*\s*k?\/?\s*[^\n,]*)/i)
  const nuocM = raw.match(/nước\s*[:\-]?\s*(\d[\d,.]*\s*k?\/?\s*[^\n,]*)/i)
  const wifiM = raw.match(/(?:net|wifi|internet|mạng)\s*[:\-]?\s*(\d[\d,.]*\s*k?\/?\s*[^\n,]*)/i)
  const vsM = raw.match(/(?:vệ sinh|dvc|dịch vụ chung)\s*[:\-]?\s*(\d[\d,.]*\s*k?\/?\s*[^\n,]*)/i)

  const luuyMatch = raw.match(/(?:lưu ý|điều kiện)[^:\n]*[:\n]\s*([\s\S]+?)(?:\n\n|$)/i)
  const luuy = luuyMatch ? luuyMatch[1].replace(/\n/g, ' · ').replace(/-\s*/g, '').trim() : ''

  const QUAN = ['Cầu Giấy','Đống Đa','Hai Bà Trưng','Hoàn Kiếm','Tây Hồ','Thanh Xuân','Nam Từ Liêm','Bắc Từ Liêm']
  const kv = QUAN.find(k => raw.toLowerCase().includes(k.toLowerCase())) || ''

  // MO TA THEM: luon dump nguyen van bai dang vao day, de khong mat thong tin
  const mota = raw.trim()

  return {
    ma, kv, dc, tang, loai, gia, tienich, mota,
    dien: dienM ? dienM[1].trim() : '',
    nuoc: nuocM ? nuocM[1].trim() : '',
    wifi: wifiM ? wifiM[1].trim() : '',
    vs: vsM ? vsM[1].trim() : '',
    luuy,
  }
}
