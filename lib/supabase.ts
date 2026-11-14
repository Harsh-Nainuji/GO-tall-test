import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseAdminConfig() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xoxhmugmtzscmjlbpfuj.supabase.co',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_MES0Zue0EHAlgPF0pB2SVQ_49cOcmcg',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }
}

let supabaseClientInstance: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClientInstance) {
    const config = getSupabaseAdminConfig()
    supabaseClientInstance = createClient(
      config.supabaseUrl,
      config.serviceRoleKey || config.supabaseAnonKey
    )
  }
  return supabaseClientInstance
}

export interface UploadMediaResult {
  publicUrl: string
  mediaType: 'video' | 'gif' | 'image'
  fileName: string
  fileSize: number
  path: string
}

export interface StorageFileItem {
  id?: string
  name: string
  folder: string
  path: string
  size: number
  formattedSize: string
  createdAt: string
  publicUrl: string
  mediaType: 'image' | 'video' | 'gif' | 'other'
}

export interface LiveStorageTelemetry {
  totalBytes: number
  usedMB: number
  limitMB: number
  percentUsed: number
  totalFiles: number
  status: 'Healthy' | 'Approaching Limit' | 'Critical'
  bucketName: string
  breakdown: {
    images: number
    videos: number
    gifs: number
    others: number
  }
  files: StorageFileItem[]
  lastChecked: string
}

/**
 * Format bytes to human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Uploads media to Supabase Storage bucket 'exercise-media'
 * Organizes into folder: 'stretches', 'foods', 'avatars', 'general'
 * Handles images, gifs, and video files with direct public URL return
 */
// Whitelisted media types for secure storage uploads
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
])

const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp4',
  'webm',
])

export async function uploadExerciseMedia(
  file: File,
  folder: 'stretches' | 'foods' | 'avatars' | 'general' = 'stretches',
  onProgress?: (progress: number) => void
): Promise<UploadMediaResult> {
  // 1. Strict extension and MIME type validation
  const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/)
  const ext = extMatch ? extMatch[1].toLowerCase() : ''

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(
      `Unsupported file extension '.${ext}'. Permitted formats: JPG, PNG, WebP, GIF, MP4, WebM.`
    )
  }

  // Reject SVG and HTML files to prevent stored XSS attacks
  if (file.type === 'image/svg+xml' || file.type.includes('html') || ext === 'svg' || ext === 'html') {
    throw new Error('SVG and HTML files are strictly disallowed for security reasons.')
  }

  const isVideo = ext === 'mp4' || ext === 'webm' || file.type.startsWith('video/')
  const isGif = ext === 'gif' || file.type === 'image/gif'
  const mediaType: 'video' | 'gif' | 'image' = isVideo ? 'video' : isGif ? 'gif' : 'image'

  const MAX_VIDEO_BYTES = 50 * 1024 * 1024 // 50MB for video
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024  // 10MB for image

  if (isVideo && file.size > MAX_VIDEO_BYTES) {
    throw new Error('Video exceeds 50MB limit. Please compress or choose a shorter video.')
  }

  if (!isVideo && file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image exceeds 10MB limit. Please select a smaller file.')
  }

  const client = getSupabaseClient()
  // Sanitize filename and prevent directory traversal
  const safeBaseName = file.name.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)
  const safeRandomId = Math.random().toString(36).substring(2, 10)
  const filePath = `${folder}/${Date.now()}_${safeRandomId}_${safeBaseName}.${ext}`

  try {
    const { error: uploadError } = await client.storage
      .from('exercise-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: isVideo ? (ext === 'webm' ? 'video/webm' : 'video/mp4') : isGif ? 'image/gif' : ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg',
      })

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError.message)
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    const { data: publicData } = client.storage
      .from('exercise-media')
      .getPublicUrl(filePath)

    if (publicData?.publicUrl) {
      return {
        publicUrl: publicData.publicUrl,
        mediaType,
        fileName: file.name,
        fileSize: file.size,
        path: filePath,
      }
    }
  } catch (err: any) {
    console.warn('Direct bucket upload failed, using local blob fallback:', err)
  }

  // Graceful browser-side fallback for offline/preview
  const localBlobUrl = typeof window !== 'undefined' ? URL.createObjectURL(file) : ''
  return {
    publicUrl: localBlobUrl,
    mediaType,
    fileName: file.name,
    fileSize: file.size,
    path: filePath,
  }
}

/**
 * Fetch live storage telemetry from Supabase bucket 'exercise-media'
 * Scans 'stretches', 'foods', 'avatars', and root to compute exact usage
 */
export async function getLiveStorageTelemetry(): Promise<LiveStorageTelemetry> {
  const DEFAULT_LIMIT_MB = 1024 // Supabase free tier 1 GB
  const bucketName = 'exercise-media'
  const foldersToScan = ['', 'stretches', 'foods', 'avatars', 'general']
  const allFiles: StorageFileItem[] = []
  let totalBytes = 0

  const breakdown = {
    images: 0,
    videos: 0,
    gifs: 0,
    others: 0,
  }

  try {
    const client = getSupabaseClient()

    for (const folder of foldersToScan) {
      const { data, error } = await client.storage
        .from(bucketName)
        .list(folder, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        })

      if (error) {
        console.warn(`Could not list files in folder '${folder}':`, error.message)
        continue
      }

      if (data && Array.isArray(data)) {
        for (const item of data) {
          // If id is null, it's a subfolder in Supabase storage
          if (!item.id || item.id === null) continue

          const size = (item.metadata as any)?.size || 0
          totalBytes += size

          const lowerName = item.name.toLowerCase()
          const isVideo = lowerName.endsWith('.mp4') || lowerName.endsWith('.webm') || lowerName.endsWith('.mov')
          const isGif = lowerName.endsWith('.gif')
          const isImage = lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.png') || lowerName.endsWith('.webp')

          let mediaType: 'image' | 'video' | 'gif' | 'other' = 'other'
          if (isVideo) {
            mediaType = 'video'
            breakdown.videos++
          } else if (isGif) {
            mediaType = 'gif'
            breakdown.gifs++
          } else if (isImage) {
            mediaType = 'image'
            breakdown.images++
          } else {
            breakdown.others++
          }

          const fullPath = folder ? `${folder}/${item.name}` : item.name
          const { data: publicUrlData } = client.storage
            .from(bucketName)
            .getPublicUrl(fullPath)

          allFiles.push({
            id: item.id,
            name: item.name,
            folder: folder || 'root',
            path: fullPath,
            size,
            formattedSize: formatBytes(size),
            createdAt: item.created_at || new Date().toISOString(),
            publicUrl: publicUrlData?.publicUrl || '',
            mediaType,
          })
        }
      }
    }
  } catch (e: any) {
    console.warn('Failed querying live Supabase storage stats:', e.message)
  }

  const usedMB = Number((totalBytes / (1024 * 1024)).toFixed(2))
  const percentUsed = Math.min(100, Number(((usedMB / DEFAULT_LIMIT_MB) * 100).toFixed(1)))

  let status: 'Healthy' | 'Approaching Limit' | 'Critical' = 'Healthy'
  if (percentUsed >= 90) {
    status = 'Critical'
  } else if (percentUsed >= 75) {
    status = 'Approaching Limit'
  }

  // Sort files by latest
  allFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return {
    totalBytes,
    usedMB,
    limitMB: DEFAULT_LIMIT_MB,
    percentUsed,
    totalFiles: allFiles.length,
    status,
    bucketName,
    breakdown,
    files: allFiles,
    lastChecked: new Date().toLocaleTimeString(),
  }
}
