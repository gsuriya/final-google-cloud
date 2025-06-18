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

  console.log('Starting try-on with:', {
    modelImageLength: modelImageBase64.length,
    garmentImageUrl,
    apiUrl: `${API_URL}/run`
  })

  const requestBody = {
    model_image: modelImageBase64,
    garment_image: garmentImageUrl,
    category: 'auto',
    mode: 'performance',
  }

  let response
  try {
    response = await fetch(`${API_URL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FASHN_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    })
    console.log('Try-on API response status:', response.status)
  } catch (networkError) {
    console.error('Network error during try-on request:', networkError)
    throw new Error(`Network error: ${networkError instanceof Error ? networkError.message : 'Failed to connect to FASHN API'}`)
  }

  if (!response.ok) {
    let errorMessage = `Failed to start try-on: ${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      console.error('API Error Response:', errorData)
      errorMessage = `Failed to start try-on: ${errorData.error || errorData.message || errorData.detail || response.statusText}`
    } catch (e) {
      // If we can't parse JSON, use the status text
      console.error('Failed to parse error response:', e)
    }
    throw new Error(errorMessage)
  }

  let data
  try {
    data = await response.json()
    console.log('Try-on API response data:', data)
  } catch (parseError) {
    console.error('Failed to parse try-on response:', parseError)
    throw new Error('Failed to parse response from FASHN API')
  }

  if (!data.id) {
    console.error('No job ID in response:', data)
    throw new Error('No job ID returned from FASHN API')
  }

  console.log('Try-on job started with ID:', data.id)
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
      let errorMessage = `Failed to check status: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        console.error('Status Check Error Response:', errorData)
        errorMessage = `Failed to check status: ${errorData.error || errorData.message || errorData.detail || response.statusText}`
      } catch (e) {
        console.error('Failed to parse status error response:', e)
      }
      throw new Error(errorMessage)
    }

    const data = await response.json()
    console.log('Status check response:', data)

    if (data.status === 'completed') {
      if (!data.output || !data.output[0]) {
        throw new Error('Try-on completed but no output image was generated')
      }
      return data.output[0]
    }

    if (data.status === 'failed') {
      throw new Error(`Try-on failed: ${data.error || data.message || 'Unknown error'}`)
    }

    attempts++
    await sleep(2000)
  }

  throw new Error('Try-on timed out')
}
