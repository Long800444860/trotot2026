export async function uploadToCloudinary(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
    { method: 'POST', body: formData }
  )
  const data = await res.json()
  if (!data.secure_url) throw new Error('Upload ảnh thất bại')
  return data.secure_url
}
