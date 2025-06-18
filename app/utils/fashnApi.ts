const FASHN_API_KEY = process.env.NEXT_PUBLIC_FASHN_API_KEY
const API_URL = 'https://api.fashn.ai/v1'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Test function to verify API key
export async function testApiKey(): Promise<boolean> {
  console.log('Testing FASHN API key...')
  console.log('FASHN_API_KEY loaded:', FASHN_API_KEY ? 'Yes' : 'No')
  console.log('API Key length:', FASHN_API_KEY?.length || 0)
  
  if (!FASHN_API_KEY) {
    console.error('API key is missing!')
    return false
  }

  try {
    // Try a simple request to test authentication
    const response = await fetch(`${API_URL}/status/test`, {
      headers: {
        'Authorization': `Bearer ${FASHN_API_KEY}`,
      },
    })
    
    console.log('API Test Response Status:', response.status)
    
    if (response.status === 401) {
      console.error('API Key is invalid or unauthorized')
      return false
    } else if (response.status === 404) {
      console.log('API Key appears valid (404 is expected for test endpoint)')
      return true
    } else {
      console.log('API Key test completed with status:', response.status)
      return response.ok
    }
  } catch (error) {
    console.error('API test failed:', error)
    return false
  }
}

export async function runTryOn(modelImageBase64: string, garmentImageUrl: string): Promise<string> {
  // Debug API key
  console.log('FASHN_API_KEY loaded:', FASHN_API_KEY ? 'Yes' : 'No')
  console.log('API Key length:', FASHN_API_KEY?.length || 0)
  
  if (!FASHN_API_KEY) {
    throw new Error('FASHN API key is not configured. Please set NEXT_PUBLIC_FASHN_API_KEY in your environment variables.')
  }

  const response = await fetch(`${API_URL}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_image: modelImageBase64,
      garment_image: garmentImageUrl,
      category: 'auto',
      mode: 'performance',
    }),
  })

  if (!response.ok) {
    let errorMessage = `Failed to start try-on: ${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = `Failed to start try-on: ${errorData.error || errorData.message || response.statusText}`
    } catch (e) {
      // If we can't parse JSON, use the status text
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.id
}

export async function checkStatus(id: string): Promise<string> {
  if (!FASHN_API_KEY) {
    throw new Error('FASHN API key is not configured. Please set NEXT_PUBLIC_FASHN_API_KEY in your environment variables.')
  }

  let attempts = 0
  while (attempts < 60) { // Poll for up to 2 minutes
    const response = await fetch(`${API_URL}/status/${id}`, {
      headers: {
        'Authorization': `Bearer ${FASHN_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.status === 'completed') {
      return data.output[0]
    }

    if (data.status === 'failed') {
      throw new Error(`Try-on failed: ${data.error || 'Unknown error'}`)
    }

    attempts++
    await sleep(2000)
  }

  throw new Error('Try-on timed out')
} 