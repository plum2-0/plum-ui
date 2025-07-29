import { createTokenEncryption } from './crypto'
import { getProject, updateProjectRedditCredentials } from './project-utils'

interface RedditTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
  refresh_token?: string
}

/**
 * Refresh Reddit access token using refresh token
 */
export async function refreshRedditToken(projectId: string): Promise<string> {
  const project = await getProject(projectId)
  
  if (!project?.source?.reddit?.refresh_token) {
    throw new Error('No Reddit refresh token found')
  }
  
  const encryption = createTokenEncryption()
  const refreshToken = encryption.decrypt(project.source.reddit.refresh_token)
  
  const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  
  if (!clientId || !clientSecret) {
    throw new Error('Reddit OAuth credentials not configured')
  }
  
  const tokenUrl = 'https://www.reddit.com/api/v1/access_token'
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Plum2.0/1.0'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh Reddit token: ${error}`)
  }
  
  const tokens: RedditTokenResponse = await response.json()
  
  // Encrypt and update tokens
  const encryptedAccessToken = encryption.encrypt(tokens.access_token)
  const encryptedRefreshToken = tokens.refresh_token 
    ? encryption.encrypt(tokens.refresh_token) 
    : project.source.reddit.refresh_token // Keep existing if not provided
  
  // Update project with new tokens
  await updateProjectRedditCredentials(projectId, {
    accessToken: encryptedAccessToken,
    refreshToken: encryptedRefreshToken,
    expiresAt: Date.now() + (tokens.expires_in * 1000),
    username: project.source.reddit.username || ''
  })
  
  return tokens.access_token
}

/**
 * Get valid Reddit access token, refreshing if necessary
 */
export async function getValidRedditToken(projectId: string): Promise<string> {
  const project = await getProject(projectId)
  
  if (!project?.source?.reddit?.oauth_token) {
    throw new Error('No Reddit credentials found')
  }
  
  const encryption = createTokenEncryption()
  const currentTime = Date.now()
  const expiresAt = project.source.reddit.oauth_token_expires_at || 0
  
  // Check if token is expired or about to expire (5 minutes buffer)
  if (expiresAt < currentTime + (5 * 60 * 1000)) {
    // Refresh the token
    return await refreshRedditToken(projectId)
  }
  
  // Token is still valid
  return encryption.decrypt(project.source.reddit.oauth_token)
}

/**
 * Make authenticated Reddit API request
 */
export async function redditApiRequest(
  projectId: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getValidRedditToken(projectId)
  
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `https://oauth.reddit.com${endpoint}`
  
  return fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'User-Agent': 'Plum2.0/1.0',
      ...options.headers
    }
  })
}