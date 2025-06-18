"use client"

import { useState, useEffect, use } from 'react'
import CameraCapture from '../../components/CameraCapture'
import { runTryOn, checkStatus, testApiKey } from '../../utils/fashnApi'
import { useProducts } from '../../context/ProductContext'

export default function TryOnPage({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = use(params)
  const { products } = useProducts()
  const [product, setProduct] = useState<any>(null)
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)
  const [testingApi, setTestingApi] = useState(false)

  // Find the product from the context
  useEffect(() => {
    if (products.length > 0) {
      const foundProduct = products.find(p => p.id === decodeURIComponent(resolvedParams.productId))
      setProduct(foundProduct)
    }
  }, [products, resolvedParams.productId])

  // Test API key on component mount
  useEffect(() => {
    const testApi = async () => {
      setTestingApi(true)
      const isValid = await testApiKey()
      setApiKeyValid(isValid)
      setTestingApi(false)
    }
    testApi()
  }, [])

  // Debug logging
  console.log('Try-on page loaded with:', { productId: resolvedParams.productId, product })

  const handleTestApiKey = async () => {
    setTestingApi(true)
    const isValid = await testApiKey()
    setApiKeyValid(isValid)
    setTestingApi(false)
  }

  const handleCapture = async (imageBase64: string) => {
    setCapturedImage(imageBase64)
    setLoading(true)
    setError(null)
    setResultImage(null)

    try {
      if (!product?.image) {
        throw new Error("Garment image URL is missing.")
      }
      const jobId = await runTryOn(imageBase64, product.image)
      const finalImage = await checkStatus(jobId)
      setResultImage(finalImage)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setResultImage(null)
    setError(null)
  }

  return (
    <div className="min-h-screen relative pb-20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
      
      <div className="relative z-10 p-4">
        <h1 className="text-3xl font-bold text-center mb-8 gradient-text">Virtual Try-On</h1>
        
        {/* API Key Test */}
        <div className="glass-card rounded-2xl p-4 mb-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">API Status:</p>
              <p className={`text-sm font-semibold ${
                apiKeyValid === null ? 'text-yellow-400' : 
                apiKeyValid ? 'text-green-400' : 'text-red-400'
              }`}>
                {testingApi ? 'Testing...' : 
                 apiKeyValid === null ? 'Not tested' :
                 apiKeyValid ? '✅ API Key Valid' : '❌ API Key Invalid'}
              </p>
            </div>
            <button
              onClick={handleTestApiKey}
              disabled={testingApi}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white text-sm font-semibold disabled:opacity-50"
            >
              {testingApi ? 'Testing...' : 'Test API Key'}
            </button>
          </div>
        </div>
        
        {/* Debug Info */}
        <div className="glass-card rounded-2xl p-4 mb-4 max-w-2xl mx-auto">
          <p className="text-sm text-gray-400">Debug Info:</p>
          <p className="text-sm text-white">Product ID: {resolvedParams.productId}</p>
          <p className="text-sm text-white">Product Found: {product ? 'Yes' : 'No'}</p>
          <p className="text-sm text-white">Product Name: {product?.description || 'Loading...'}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4 gradient-text text-center">Selected Garment</h2>
            {product?.image ? (
              <img 
                src={product.image} 
                alt="Garment" 
                className="rounded-2xl w-full max-h-96 object-cover border border-white/10" 
              />
            ) : (
              <div className="rounded-2xl w-full h-96 bg-white/5 border border-white/10 flex items-center justify-center">
                <p className="text-gray-400">{products.length === 0 ? 'Loading product...' : 'Product not found'}</p>
              </div>
            )}
          </div>
          
          <div className="glass-card rounded-3xl p-6">
            <h2 className="text-xl font-semibold mb-4 gradient-text text-center">Your Photo</h2>
            <CameraCapture 
              onCapture={handleCapture}
              onRetake={handleRetake}
              capturedImage={capturedImage}
            />
          </div>
        </div>
        
        {loading && (
          <div className="text-center mt-8">
            <div className="glass-card rounded-3xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg mb-2">Processing your virtual try-on...</p>
              <p className="text-gray-400 text-sm">This may take a few moments</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-center mt-8">
            <div className="glass-card rounded-3xl p-6 max-w-md mx-auto border border-red-500/30">
              <p className="text-red-400 mb-4">❌ {error}</p>
              <button 
                onClick={handleRetake}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {resultImage && (
          <div className="text-center mt-8">
            <div className="glass-card rounded-3xl p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 gradient-text">✨ Your Virtual Try-On Result</h2>
              <img 
                src={resultImage} 
                alt="Try-on result" 
                className="rounded-2xl w-full max-h-96 object-cover border border-white/10 mb-4" 
              />
              <p className="text-gray-400 text-sm">How does it look? Share it with friends!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
