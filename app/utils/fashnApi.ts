const FASHN_API_KEY = process.env.NEXT_PUBLIC_FASHN_API_KEY
const API_URL = 'https://api.fashn.ai/v1'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function runTryOn(modelImageBase64: string, garmentImageUrl: string): Promise<string> {
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
    const errorData = await response.json()
    throw new Error(`Failed to start try-on: ${errorData.error || response.statusText}`)
  }

  const data = await response.json()
  return data.id
}

export async function checkStatus(id: string): Promise<string> {
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