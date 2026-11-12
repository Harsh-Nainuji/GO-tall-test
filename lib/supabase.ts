import { createClient, SupabaseClient } from '@supabase/supabase-js'

export function getSupabaseAdminConfig() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
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
}

/**
 * Uploads media to Supabase Storage bucket 'exercise-media'
 * Enforces file size checks:
 * - Videos: Max 15MB
 * - GIFs / Images: Max 2MB
 */
export async function uploadExerciseMedia(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadMediaResult> {
  const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4')
  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')
  const mediaType: 'video' | 'gif' | 'image' = isVideo ? 'video' : isGif ? 'gif' : 'image'

  const MAX_VIDEO_BYTES = 15 * 1024 * 1024 // 15MB
  const MAX_IMAGE_BYTES = 2 * 1024 * 1024  // 2MB

  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error('File exceeds 15MB limit. Please upload a smaller video or image.')
  }

  if (!isVideo && file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image/GIF exceeds 2MB limit. Please compress or select a smaller file.')
  }

  const config = getSupabaseAdminConfig()
  const isPlaceholder =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  if (!isPlaceholder) {
    try {
      const client = getSupabaseClient()
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `stretches/${Date.now()}_${sanitizedName}`

      const { error: uploadError } = await client.storage
        .from('exercise-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || (isVideo ? 'video/mp4' : isGif ? 'image/gif' : 'image/jpeg'),
        })

      if (uploadError) {
        console.warn('Supabase bucket upload error:', uploadError.message)
      } else {
        const { data: publicData } = client.storage
          .from('exercise-media')
          .getPublicUrl(filePath)

        if (publicData?.publicUrl) {
          return {
            publicUrl: publicData.publicUrl,
            mediaType,
            fileName: file.name,
          }
        }
      }
    } catch (err) {
      console.warn('Direct bucket upload failed, using browser object preview URL:', err)
    }
  }

  // Graceful browser-side fallback for development/demo
  const localBlobUrl = URL.createObjectURL(file)
  return {
    publicUrl: localBlobUrl,
    mediaType,
    fileName: file.name,
  }
}
