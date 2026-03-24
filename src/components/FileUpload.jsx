import { useState, useRef } from 'react'
import { Upload, X, Image, Video, Loader2 } from 'lucide-react'
import { uploadFile, uploadFiles } from '../services/dataService'

/**
 * Reusable file upload component.
 * Supports single or multiple files, image or video, with preview.
 *
 * Props:
 *   onUpload(urls)    - callback with array of uploaded URLs
 *   multiple          - allow multiple files (default: false)
 *   accept            - "image", "video", or "both" (default: "image")
 *   maxFiles          - max files for multiple (default: 5)
 *   label             - label text (default: "Upload")
 *   existingUrls      - array of already uploaded URLs to show
 */
export default function FileUpload({ onUpload, multiple = false, accept = 'image', maxFiles = 5, label = 'Upload', existingUrls = [] }) {
  const [previews, setPreviews] = useState(existingUrls.map(url => ({ url, uploaded: true })))
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const acceptTypes = accept === 'image' ? 'image/*' : accept === 'video' ? 'video/*' : 'image/*,video/*'

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const totalAllowed = multiple ? maxFiles - previews.length : 1
    const toUpload = files.slice(0, totalAllowed)

    // Show local previews immediately
    const localPreviews = toUpload.map(file => ({
      url: URL.createObjectURL(file),
      uploaded: false,
      file,
      type: file.type.startsWith('video') ? 'video' : 'image',
    }))

    if (!multiple) {
      setPreviews(localPreviews)
    } else {
      setPreviews(prev => [...prev, ...localPreviews])
    }

    // Upload to server
    setUploading(true)
    setError(null)
    try {
      const uploadedUrls = []
      for (const file of toUpload) {
        const result = await uploadFile(file)
        uploadedUrls.push(result.url)
      }

      // Update previews with server URLs
      if (!multiple) {
        setPreviews(uploadedUrls.map(url => ({ url, uploaded: true })))
      } else {
        setPreviews(prev => {
          const updated = [...prev]
          let urlIdx = 0
          for (let i = 0; i < updated.length; i++) {
            if (!updated[i].uploaded && urlIdx < uploadedUrls.length) {
              updated[i] = { url: uploadedUrls[urlIdx], uploaded: true }
              urlIdx++
            }
          }
          return updated
        })
      }

      const allUrls = multiple
        ? [...existingUrls, ...uploadedUrls]
        : uploadedUrls
      onUpload(allUrls)
    } catch (err) {
      setError('Upload failed. Please try again.')
    }
    setUploading(false)

    // Reset input
    if (inputRef.current) inputRef.current.value = ''
  }

  const removePreview = (index) => {
    const updated = previews.filter((_, i) => i !== index)
    setPreviews(updated)
    onUpload(updated.filter(p => p.uploaded).map(p => p.url))
  }

  return (
    <div className="file-upload-wrapper">
      {/* Previews */}
      {previews.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {previews.map((preview, i) => (
            <div key={i} style={{ position: 'relative', width: 100, height: 100, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e5e5' }}>
              {preview.type === 'video' ? (
                <div style={{ width: '100%', height: '100%', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={24} style={{ color: '#737373' }} />
                </div>
              ) : (
                <img src={preview.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {!preview.uploaded && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={20} style={{ color: 'white', animation: 'spin 1s linear infinite' }} />
                </div>
              )}
              <button
                onClick={() => removePreview(i)}
                style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {(multiple ? previews.length < maxFiles : previews.length === 0) && (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          style={{
            padding: '20px',
            border: '2px dashed #d4d4d4',
            borderRadius: 8,
            textAlign: 'center',
            cursor: uploading ? 'wait' : 'pointer',
            background: '#fafafa',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#2D6A4F'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#d4d4d4'}
        >
          {uploading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#737373' }}>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13 }}>Uploading...</span>
            </div>
          ) : (
            <>
              <Upload size={24} style={{ color: '#737373', marginBottom: 6 }} />
              <div style={{ fontSize: 13, color: '#525252', fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>
                {accept === 'image' ? 'JPG, PNG, WebP' : accept === 'video' ? 'MP4, MOV, WebM' : 'Images or Videos'} — Max 10MB
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        multiple={multiple}
        onChange={handleFiles}
        style={{ display: 'none' }}
      />

      {error && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 6 }}>{error}</div>}
    </div>
  )
}
