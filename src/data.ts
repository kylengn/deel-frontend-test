/**
 * Interface for fruit data from the Fruityvice API
 */
interface FruitData {
  id: number;
  name: string;
  family: string;
  order: string;
  genus: string;
  nutritions: {
    calories: number;
    fat: number;
    sugar: number;
    carbohydrates: number;
    protein: number;
  };
}

/**
 * Cache for storing fetched fruits to avoid repeated API calls
 */
let fruitsCache: string[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * CORS proxy to handle cross-origin requests
 * Using a public CORS proxy to bypass CORS restrictions
 */
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const API_BASE_URL = '/api/fruit'; // Use proxy from package.json

/**
 * Fetches all fruits from the Fruityvice API
 * @returns Promise resolving to an array of fruit names
 */
async function fetchAllFruits(): Promise<string[]> {
  try {
    // Try direct API call first (using proxy from package.json)
    const response = await fetch(`${API_BASE_URL}/all`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const fruits: FruitData[] = await response.json();
    return fruits.map(fruit => fruit.name);
  } catch (error) {
    console.log('Direct API call failed, trying CORS proxy...', error);
    
    try {
      // Fallback to CORS proxy
      const proxyResponse = await fetch(`${CORS_PROXY}${encodeURIComponent(`https://www.fruityvice.com${API_BASE_URL}/all`)}`);
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy HTTP error! status: ${proxyResponse.status}`);
      }
      
      const fruits: FruitData[] = await proxyResponse.json();
      return fruits.map(fruit => fruit.name);
    } catch (proxyError) {
      console.error('CORS proxy also failed:', proxyError);
      // Fallback to a basic list if both API and proxy fail
      return [
        'Apple', 'Banana', 'Orange', 'Strawberry', 'Grape', 
        'Pineapple', 'Mango', 'Peach', 'Pear', 'Cherry',
        'Apricot', 'Avocado', 'Blackberry', 'Blueberry', 'Coconut',
        'Cranberry', 'Date', 'Dragonfruit', 'Durian', 'Fig',
        'Grapefruit', 'Guava', 'Kiwi', 'Lemon', 'Lime',
        'Lychee', 'Melon', 'Nectarine', 'Papaya', 'Plum',
        'Pomegranate', 'Raspberry', 'Tangerine', 'Watermelon'
      ];
    }
  }
}

/**
 * Fetches fruits from the Fruityvice API with caching for performance.
 * The cache is valid for 5 minutes to avoid excessive API calls.
 * @returns Promise resolving to an array of fruit names
 */
async function getFruitsWithCache(): Promise<string[]> {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (fruitsCache && (now - lastFetchTime) < CACHE_DURATION) {
    return fruitsCache;
  }
  
  // Fetch fresh data from API
  fruitsCache = await fetchAllFruits();
  lastFetchTime = now;
  
  return fruitsCache;
}

/**
 * Fetches fruit suggestions from the Fruityvice API based on the provided query.
 * This function uses the cached fruit list and filters it client-side for better performance.
 * 
 * @param query The search term provided by the user.
 * @returns A promise resolving to the list of matching fruits.
 */
export async function fetchFruits(query: string): Promise<string[]> {
  try {
    const lowerQuery = query.trim().toLowerCase();
    
    if (!lowerQuery) {
      return [];
    }
    
    // Get fruits from cache or API
    const allFruits = await getFruitsWithCache();
    
    // Filter fruits that match the query
    const results = allFruits.filter((fruit) =>
      fruit.toLowerCase().includes(lowerQuery)
    );
    
    return results;
  } catch (error) {
    console.error('Error in fetchFruits:', error);
    return [];
  }
}

/**
 * Fetches detailed information about a specific fruit from the Fruityvice API
 * @param fruitName The name of the fruit to fetch details for
 * @returns Promise resolving to the fruit data or null if not found
 */
export async function fetchFruitDetails(fruitName: string): Promise<FruitData | null> {
  try {
    // Try direct API call first (using proxy from package.json)
    const response = await fetch(`${API_BASE_URL}/${encodeURIComponent(fruitName)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Fruit not found
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const fruitData: FruitData = await response.json();
    return fruitData;
  } catch (error) {
    console.log('Direct API call failed for fruit details, trying CORS proxy...', error);
    
    try {
      // Fallback to CORS proxy
      const proxyResponse = await fetch(`${CORS_PROXY}${encodeURIComponent(`https://www.fruityvice.com${API_BASE_URL}/${encodeURIComponent(fruitName)}`)}`);
      
      if (!proxyResponse.ok) {
        if (proxyResponse.status === 404) {
          return null; // Fruit not found
        }
        throw new Error(`Proxy HTTP error! status: ${proxyResponse.status}`);
      }
      
      const fruitData: FruitData = await proxyResponse.json();
      return fruitData;
    } catch (proxyError) {
      console.error('CORS proxy also failed for fruit details:', proxyError);
      return null;
    }
  }
}