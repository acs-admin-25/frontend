import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Query parameter "q" is required and must be at least 2 characters' }, { status: 400 })
    }

    // Parse the query for triple filtering (city, state, country)
    const queryParts = query.split(',').map(part => part.trim())
    const cityQuery = queryParts[0] || ''
    const stateQuery = queryParts[1] || ''
    const countryQuery = queryParts[2] || ''

    // Build the Nominatim API URL - search for the full query first
    const nominatimUrl = new URL('https://nominatim.openstreetmap.org/search')
    nominatimUrl.searchParams.set('q', query)
    nominatimUrl.searchParams.set('format', 'json')
    nominatimUrl.searchParams.set('addressdetails', '1')
    nominatimUrl.searchParams.set('limit', '30') // Get more results for broader matching
    nominatimUrl.searchParams.set('countrycodes', 'us,ca,gb,au,de,fr,es,it,nl')
    nominatimUrl.searchParams.set('featuretype', 'city')

    // Add a User-Agent header (required by Nominatim)
    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'ACS-Contact-Manager/1.0 (https://your-domain.com)',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Nominatim API responded with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Transform and apply progressive triple filtering
    const transformedData = data
      .map((item: any) => {
        const city = (item.address?.city || item.address?.town || item.address?.village || item.name || '').trim()
        const state = (item.address?.state || '').trim()
        const country = (item.address?.country || '').trim()
        const fullAddress = (item.display_name || '').trim()
        
        // Only include results that have a valid city name
        if (!city || city.length === 0) return null
        
        // Progressive triple filtering logic - more inclusive matching
        let score = 0
        let hasAnyMatch = false
        
        // Helper function for progressive matching
        const progressiveMatch = (text: string, query: string): number => {
          if (!query || !text) return 0
          
          const textLower = text.toLowerCase()
          const queryLower = query.toLowerCase()
          
          // Exact start match (highest priority)
          if (textLower.startsWith(queryLower)) {
            return 100
          }
          
          // Word boundary match
          const words = textLower.split(/[\s\-_]+/)
          if (words.some(word => word.startsWith(queryLower))) {
            return 80
          }
          
          // Contains match (anywhere in the text)
          if (textLower.includes(queryLower)) {
            return 60
          }
          
          // Partial word match (for progressive typing)
          if (words.some(word => word.includes(queryLower))) {
            return 40
          }
          
          return 0
        }
        
        // 1. CITY FILTER (highest priority) - but more progressive
        if (cityQuery) {
          const cityScore = progressiveMatch(city, cityQuery)
          if (cityScore > 0) {
            score += cityScore
            hasAnyMatch = true
          }
        } else {
          // If no city query, still include the result
          hasAnyMatch = true
        }
        
        // 2. STATE FILTER (medium priority) - progressive matching
        if (stateQuery && state) {
          const stateScore = progressiveMatch(state, stateQuery)
          score += stateScore * 0.3 // Weight state matches less than city
          if (stateScore > 0) hasAnyMatch = true
        }
        
        // 3. COUNTRY FILTER (lowest priority) - progressive matching
        if (countryQuery && country) {
          const countryScore = progressiveMatch(country, countryQuery)
          score += countryScore * 0.1 // Weight country matches even less
          if (countryScore > 0) hasAnyMatch = true
        }
        
        // If we have any query but no matches at all, exclude the result
        if ((cityQuery || stateQuery || countryQuery) && !hasAnyMatch) {
          return null
        }
        
        return {
          uniqueKey: `${item.place_id}-${item.osm_id}`,
          city,
          state,
          country,
          fullAddress,
          lat: item.lat,
          lon: item.lon,
          score // Include score for sorting
        }
      })
      .filter((item: any) => item !== null) // Remove null results
      .sort((a: any, b: any) => b.score - a.score) // Sort by score (highest first)
      .slice(0, 12) // Return top 12 results for more variety
      .map(({ score, ...item }) => item); // Remove score from final output

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error fetching location suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch location suggestions' },
      { status: 500 }
    )
  }
} 