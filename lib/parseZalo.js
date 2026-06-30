export function parseZaloText(raw) {
  const get = (patterns, str) => {
    for (const p of patterns) {
      const m = str.match(p)
      if (m) return m[1].trim()
    }
    return ''
  }

  const giaMatch = raw.match(/gi[áa]\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*tr/i)
  const gia = giaMatch ? parseFloat(giaMatch[1].replace(',', '.')) : 0

  const ma = get([/mã\s*[:\-]?\s*(\S+)/i, /code\s*[:\-]?\s*(\S+)/i], raw)

  const dcMatch = raw.match(/(?:địa chỉ|đc)\s*[:\-]?\s*(.+?)(?:\n|$)/i)
  const dc = dcMatch ? dcMatch[1].replace(/[🏡🏠]/g, '').trim() : ''

  const tangMatch = raw.match(/(?:trống|tầng)\s*[:\-]?\s*(.+?)(?:\n|$)/i)
  const tang = tangMatch ? tangMatch[1].trim() : ''

  const loaiRaw = raw.match(/phòng\s*[:\-]?\s*(.+?)(?:\n|$)/i)
  const loaiStr = loaiRaw ? loaiRaw[1].toLowerCase() : ''
  let loai = 'Phòng đơn'
  if (loaiStr.includes('1n1k') || loaiStr.includes('1 ngủ') || loaiStr.includes('2 ngủ')) loai = '1 ngủ 1 bếp'
  else if (loaiStr.includes('studio')) loai = 'Mini studio'
  else if (loaiStr.includes('căn hộ')) loai = 'Căn hộ mini'

  const tienich = []
  if (/máy lạnh|điều hòa/i.test(raw)) tienich.push('máy lạnh')
  if (/tủ lạnh/i.test(raw)) tienich.push('tủ lạnh')
  if (/bếp|nấu ăn/i.test(raw)) tienich.push('bếp')
  if (/tủ quần áo|tủ đồ/i.test(raw)) tienich.push('tủ quần áo')
  if (/ban công/i.test(raw)) tienich.push('ban công')
  if (/thang máy/i.test(raw)) tienich.push('thang máy')
  if (/gác lửng/i.test(raw)) tienich.push('gác lửng')
  if (/bàn ghế/i.test(raw)) tienich.push('bàn ghế')

  const dienM = raw.match(/điện\s*[:\-]?\s*(\d[\d,.]+\s*k?\/?\s*[^\n,]+)/i)
  const nuocM = raw.match(/nước\s*[:\-]?\s*(\d[\d,.]+\s*k?\/?\s*[^\n,]+)/i)
  const wifiM = raw.match(/(?:net|wifi|internet)\s*[:\-]?\s*(\d[\d,.]+\s*k?\/?\s*[^\n,]+)/i)
  const vsM = raw.match(/vệ sinh\s*[:\-]?\s*(\d[\d,.]+\s*k?\/?\s*[^\n,]+)/i)

  const luuyMatch = raw.match(/(?:lưu ý|điều kiện)[^:\n]*[:\n]\s*([\s\S]+?)(?:\n\n|$)/i)
  const luuy = luuyMatch ? luuyMatch[1].replace(/\n/g, ' · ').replace(/-\s*/g, '').trim() : ''

  const QUAN = ['Cầu Giấy','Đống Đa','Hai Bà Trưng','Hoàn Kiếm','Tây Hồ','Thanh Xuân','Nam Từ Liêm','Bắc Từ Liêm']
  const kv = QUAN.find(k => raw.toLowerCase().includes(k.toLowerCase())) || ''

  return {
    ma, kv, dc, tang, loai, gia, tienich,
    dien: dienM ? dienM[1].trim() : '',
    nuoc: nuocM ? nuocM[1].trim() : '',
    wifi: wifiM ? wifiM[1].trim() : '',
    vs: vsM ? vsM[1].trim() : '',
    luuy,
  }
}
