const { sqrt, pow, sin, cos, PI } = Math;
let { innerHeight: height, innerWidth: width } = window;

// Animation state
const animation = {
  progress: 0,
  isAnimating: false
};

// Mouse interaction state
const mouse = {
  isDown: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  rotation: [0, 0]
};

// Map settings
const mapSettings = {
  projection: 'orthographic',
  colorTheme: 'ocean',
  zoom: 500,
  routeType: 'direct',
  animationSpeed: 1.0,
  showLabels: true
};

// Color themes
const colorThemes = {
  ocean: {
    water: '#1e3a8a',
    waterStroke: '#1e40af',
    land: '#f3f4f6',
    landStroke: '#d1d5db'
  },
  satellite: {
    water: '#0f172a',
    waterStroke: '#1e293b',
    land: '#22c55e',
    landStroke: '#16a34a'
  },
  dark: {
    water: '#111827',
    waterStroke: '#374151',
    land: '#4b5563',
    landStroke: '#6b7280'
  },
  classic: {
    water: '#bfdbfe',
    waterStroke: '#3b82f6',
    land: '#fef3c7',
    landStroke: '#f59e0b'
  }
};

// Globe setup
const canvas = document.getElementById("c");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");
const data = mapData.features;

let projection = d3
  .geoOrthographic()
  .scale(mapSettings.zoom)
  .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath(projection, ctx);

// Country coordinates (main ports)
const countryCoords = {
  'Türkiye': [28.9784, 41.0082], // Istanbul
  'Rusya': [30.3141, 59.9311], // St. Petersburg
  'Mısır': [31.2357, 30.0444], // Alexandria
  'Bulgaristan': [27.9147, 43.1956], // Varna
  'Gürcistan': [41.6168, 41.6401], // Batumi
  'Romanya': [28.6596, 44.1598], // Constanta
  'Ukrayna': [30.7326, 46.4775], // Odessa
  'Yunanistan': [23.6362, 37.9755], // Piraeus
  'Lübnan': [35.5018, 33.8938], // Beirut
  'Suriye': [35.7381, 35.1981], // Latakia
  'İtalya': [12.2946, 43.7593], // Livorno
  'Fas': [-6.8498, 33.9716], // Casablanca
  'İspanya': [-5.9844, 43.3614], // Santander
  'Fransa': [5.3698, 43.2965], // Marseille
  'Cezayir': [3.0588, 36.7753], // Algiers
  'Tunus': [10.1658, 36.8190], // Tunis
  'Libya': [13.1913, 32.8872], // Tripoli
  'Senegal': [-17.3996, 14.6928], // Dakar
  'Nijerya': [3.3792, 6.5244], // Lagos
  'Benin': [2.3158, 6.4969], // Cotonou
  'Fildişi Sahilleri': [-4.0413, 5.3364], // Abidjan
  'Gana': [-0.1969, 5.6037], // Tema
  'ABD': [-74.0059, 40.7128], // New York
  'Ürdün': [35.9106, 29.5320], // Aqaba
  'Suudi Arabistan': [39.1925, 21.4858], // Jeddah
  'Hindistan': [72.8777, 19.0760] // Mumbai
};

// Predefined sea routes with waypoints for realistic maritime navigation - DEEP WATER ONLY
const seaRoutes = {
  // COMPLETELY FIXED: All Turkey routes now use proper maritime navigation
  // Mediterranean Sea Routes - STRICTLY MARITIME PATHS FROM ISTANBUL
  
  'Türkiye-İtalya': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale Boğazı approach
    [26.0, 39.5], // Çanakkale Boğazı (Dardanelles)
    [25.0, 39.0], // Ege Denizi entry (Aegean Sea)
    [23.5, 37.5], // Deep Aegean (avoiding all islands)
    [21.0, 36.5], // Deep central Mediterranean
    [18.0, 37.0], // Deep Ionian Sea
    [15.0, 38.0], // Deep Tyrrhenian Sea
    [12.4964, 41.9028] // Italian port approach
  ],
  
  'Türkiye-Yunanistan': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [25.0, 38.5], // Deep Aegean entry
    [24.0, 37.8], // Deep Aegean waters
    [23.7275, 37.9755] // Piraeus approach
  ],
  
  'Türkiye-Fransa': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [24.0, 38.0], // Deep Aegean
    [21.0, 36.8], // Deep central Mediterranean
    [17.0, 37.0], // Deep Med waters
    [13.0, 37.5], // Deep Tyrrhenian
    [9.0, 38.5], // Deep western Med
    [6.0, 40.0], // Deep Gulf of Lion
    [5.3698, 43.2965] // Marseille
  ],
  
  'Türkiye-İspanya': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [24.0, 38.0], // Deep Aegean
    [20.0, 36.8], // Deep central Med
    [16.0, 36.5], // Deep Med waters
    [12.0, 37.0], // Deep Tyrrhenian
    [8.0, 37.5], // Deep western Med
    [4.0, 38.0], // Deep Balearic Sea
    [0.0, 39.0], // Deep Spanish waters
    [-2.0, 41.0] // Spanish port approach
  ],
  
  'Türkiye-Fas': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [24.0, 38.0], // Deep Aegean
    [20.0, 36.5], // Deep central Med
    [15.0, 36.0], // Deep Med waters
    [10.0, 36.5], // Deep western Med
    [5.0, 36.2], // Deep Balearic
    [0.0, 35.8], // Deep Alboran Sea
    [-3.0, 35.6], // Deep Gibraltar approach
    [-5.8, 35.9], // Gibraltar Strait deep channel
    [-8.0, 34.5], // Deep Atlantic Morocco
    [-6.8498, 33.9716] // Casablanca
  ],
  
  'Türkiye-Mısır': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale Boğazı approach
    [26.0, 39.5], // Çanakkale Boğazı (Dardanelles)
    [25.0, 38.5], // Ege Denizi (Aegean Sea)
    [24.0, 36.5], // Deep Aegean waters
    [26.0, 35.0], // Eastern Mediterranean entry
    [29.0, 34.0], // Deep eastern Med
    [31.0, 32.0], // Deep Egyptian approach
    [31.2357, 30.0444] // Alexandria
  ],
  
  'Türkiye-Lübnan': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [25.0, 38.5], // Deep Aegean entry
    [24.0, 36.5], // Deep Aegean waters
    [26.0, 35.5], // Eastern Mediterranean
    [30.0, 35.0], // Deep eastern Med
    [33.0, 34.5], // Deep Levantine approach
    [35.5018, 33.8938] // Beirut
  ],
  
  'Türkiye-Suriye': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [25.0, 38.5], // Deep Aegean entry
    [24.0, 36.5], // Deep Aegean waters
    [26.0, 35.8], // Eastern Mediterranean
    [30.0, 36.0], // Deep eastern Med
    [33.5, 35.5], // Deep Syrian approach
    [35.7381, 35.1981] // Latakia
  ],
  
  'Türkiye-Libya': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [24.0, 38.0], // Deep Aegean
    [21.0, 36.5], // Deep central Med
    [17.0, 35.5], // Deep central Med
    [14.0, 34.5], // Deep Libyan waters
    [13.1913, 32.8872] // Tripoli
  ],

  // Black Sea Routes - DEEP CENTRAL WATERS ONLY
  'Türkiye-Rusya': [
    [28.9784, 41.0082], // Istanbul
    [29.1, 41.2], // Bosphorus (unavoidable narrow passage)
    [30.5, 42.0], // Deep Black Sea entry
    [33.0, 43.0], // Deep central Black Sea
    [36.0, 44.0], // Deep eastern Black Sea
    [39.6916, 47.2357] // Rostov-on-Don
  ],
  
  'Türkiye-Bulgaristan': [
    [28.9784, 41.0082], // Istanbul
    [29.1, 41.2], // Bosphorus
    [28.5, 42.2], // Deep western Black Sea
    [28.0, 43.0], // Deep Bulgarian waters
    [27.9147, 43.1956] // Varna
  ],
  
  'Türkiye-Romanya': [
    [28.9784, 41.0082], // Istanbul
    [29.1, 41.2], // Bosphorus
    [29.5, 42.5], // Deep central Black Sea
    [29.0, 43.8], // Deep Romanian waters
    [28.6596, 44.1598] // Constanta
  ],

  'Türkiye-Gürcistan': [
    [28.9784, 41.0082], // Istanbul
    [29.1, 41.2], // Bosphorus
    [31.5, 41.8], // Deep eastern Black Sea
    [35.0, 41.9], // Deep Georgian waters
    [41.6168, 41.6401] // Batumi
  ],

  'Türkiye-Ukrayna': [
    [28.9784, 41.0082], // Istanbul
    [29.1, 41.2], // Bosphorus
    [30.0, 42.8], // Deep central Black Sea
    [30.5, 44.5], // Deep Ukrainian waters
    [30.7326, 46.4775] // Odessa
  ],

  // West Africa Routes - DEEP ATLANTIC ONLY
  'Fas-Senegal': [
    [-6.8498, 33.9716], // Casablanca
    [-10.0, 30.0], // Deep Atlantic Morocco
    [-12.0, 25.0], // Deep Atlantic
    [-15.0, 20.0], // Deep Atlantic
    [-16.0, 15.0], // Deep Senegalese waters
    [-17.3996, 14.6928] // Dakar
  ],

  // FIXED: IMS Red Sea & Indian Ocean - PROPER DEEP WATER CHANNELS
  'Türkiye-Ürdün': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [25.0, 38.5], // Deep Aegean entry
    [24.0, 36.0], // Deep Aegean waters
    [26.0, 34.5], // Eastern Mediterranean
    [30.0, 33.0], // Deep eastern Med
    [33.0, 31.5], // Deep Levantine approach
    [35.0, 30.2], // Red Sea approach
    [35.9106, 29.5320] // Aqaba
  ],
  
  'Ürdün-Suudi Arabistan': [
    [35.9106, 29.5320], // Aqaba
    [36.0, 27.0], // Deep Red Sea north
    [37.0, 24.0], // Deep Red Sea central
    [38.5, 22.0], // Deep Red Sea central-south
    [39.1925, 21.4858] // Jeddah
  ],
  
  'Suudi Arabistan-Hindistan': [
    [39.1925, 21.4858], // Jeddah
    [40.5, 18.0], // Deep Red Sea south
    [42.8, 15.0], // Bab el-Mandeb deep channel
    [47.0, 13.0], // Deep Arabian Sea west
    [52.0, 12.0], // Deep Arabian Sea central
    [58.0, 13.0], // Deep Arabian Sea central-east
    [65.0, 15.0], // Deep Arabian Sea east
    [70.0, 17.0], // Deep Indian waters approach
    [72.8777, 19.0760] // Mumbai
  ],

  // FIXED: SPX Spain-Morocco route - PROPER STRAIT NAVIGATION
  'İspanya-Fas': [
    [-5.9844, 43.3614], // Santander (original Spanish port)
    [-6.5, 40.0], // Deep Spanish Atlantic waters
    [-7.0, 37.0], // Deep approach to Gibraltar
    [-5.8, 35.9], // Gibraltar Strait deep channel
    [-6.2, 35.0], // Deep Morocco approach
    [-6.8498, 33.9716] // Casablanca
  ],

  // Atlantic Routes - DEEP OCEAN NAVIGATION
  'Fransa-Fas': [
    [5.3698, 43.2965], // Marseille
    [2.0, 40.0], // Deep Gulf of Lion
    [-2.0, 37.0], // Deep Spanish waters
    [-5.0, 36.0], // Gibraltar approach
    [-5.8, 35.8], // Gibraltar Strait
    [-7.0, 34.0], // Deep Atlantic
    [-6.8498, 33.9716] // Casablanca
  ],

  'İspanya-Cezayir': [
    [-2.0, 41.0], // Barcelona
    [0.0, 38.0], // Deep Balearic Sea
    [2.0, 36.5], // Deep Algerian waters
    [3.0588, 36.7753] // Algiers
  ],

  // Additional Mediterranean routes - ALL VIA PROPER MARITIME PATHS
  'Türkiye-Tunus': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [24.0, 38.0], // Deep Aegean
    [20.0, 36.5], // Deep central Med
    [15.0, 36.2], // Deep Med waters
    [11.0, 36.8], // Deep Tunisian waters
    [10.1658, 36.8190] // Tunis
  ],

  'Türkiye-Cezayir': [
    [28.9784, 41.0082], // Istanbul
    [26.2, 40.1], // Çanakkale approach
    [26.0, 39.5], // Çanakkale Boğazı
    [24.0, 38.0], // Deep Aegean
    [20.0, 36.8], // Deep central Med
    [15.0, 36.5], // Deep Med waters
    [8.0, 36.8], // Deep Algerian approach
    [3.0588, 36.7753] // Algiers
  ],

  // West Africa circular routes - STAYING IN DEEP ATLANTIC
  'Senegal-Nijerya': [
    [-17.3996, 14.6928], // Dakar
    [-15.0, 10.0], // Deep Atlantic
    [-10.0, 8.0], // Deep Gulf of Guinea
    [-5.0, 6.0], // Deep Gulf waters
    [0.0, 5.5], // Deep Nigerian waters
    [3.3792, 6.5244] // Lagos
  ],

  'Nijerya-Benin': [
    [3.3792, 6.5244], // Lagos
    [2.5, 6.2], // Deep Gulf waters
    [2.3158, 6.4969] // Cotonou
  ],

  'Benin-Fildişi Sahilleri': [
    [2.3158, 6.4969], // Cotonou
    [-1.0, 5.5], // Deep Gulf waters
    [-3.0, 5.2], // Deep Ivory Coast waters
    [-4.0413, 5.3364] // Abidjan
  ],

  'Fildişi Sahilleri-Gana': [
    [-4.0413, 5.3364], // Abidjan
    [-2.0, 5.5], // Deep Gulf waters
    [-0.1969, 5.6037] // Tema
  ],

  'Gana-Fas': [
    [-0.1969, 5.6037], // Tema
    [-5.0, 8.0], // Deep Atlantic
    [-10.0, 15.0], // Deep Atlantic
    [-12.0, 25.0], // Deep Atlantic
    [-8.0, 30.0], // Deep Morocco approach
    [-6.8498, 33.9716] // Casablanca
  ],

  // FIXED: North America Routes - PROPER DEEP ATLANTIC CROSSING FROM TURKEY
  'Türkiye-ABD': [
    [28.9784, 41.0082], // Istanbul
    [25.0, 38.0], // Deep Aegean 
    [20.0, 36.0], // Deep Mediterranean
    [10.0, 36.0], // Deep western Med
    [0.0, 35.5], // Deep Alboran
    [-5.8, 35.8], // Gibraltar Strait deep channel
    [-15.0, 35.0], // Deep Eastern Atlantic
    [-25.0, 35.0], // Mid Atlantic Ridge
    [-40.0, 35.0], // Deep western Atlantic
    [-60.0, 37.0], // US coast approach (deep)
    [-74.0059, 40.7128] // New York
  ],

  // Reverse routes (all with proper ocean paths)
  'Hindistan-Suudi Arabistan': [
    [72.8777, 19.0760], // Mumbai
    [70.0, 17.0], // Deep Indian waters
    [65.0, 15.0], // Deep Arabian Sea east
    [58.0, 13.0], // Deep Arabian Sea central-east
    [52.0, 12.0], // Deep Arabian Sea central
    [47.0, 13.0], // Deep Arabian Sea west
    [42.8, 15.0], // Bab el-Mandeb deep channel
    [40.5, 18.0], // Deep Red Sea south
    [39.1925, 21.4858] // Jeddah
  ],

  'Suudi Arabistan-Ürdün': [
    [39.1925, 21.4858], // Jeddah
    [38.5, 22.0], // Deep Red Sea central-south
    [37.0, 24.0], // Deep Red Sea central
    [36.0, 27.0], // Deep Red Sea north
    [35.9106, 29.5320] // Aqaba
  ],

  'Ürdün-Mısır': [
    [35.9106, 29.5320], // Aqaba
    [34.0, 30.5], // Deep Red Sea approach
    [32.5, 31.5], // Deep eastern Med approach
    [31.0, 32.0], // Deep Egyptian waters
    [31.2357, 30.0444] // Alexandria
  ],

  'Mısır-Türkiye': [
    [31.2357, 30.0444], // Alexandria
    [31.0, 32.0], // Deep Egyptian waters
    [29.0, 34.0], // Deep eastern Med
    [26.0, 35.0], // Eastern Mediterranean
    [24.0, 36.5], // Deep Aegean waters
    [25.0, 38.5], // Ege Denizi (Aegean Sea)
    [26.0, 39.5], // Çanakkale Boğazı (Dardanelles)
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'ABD-Türkiye': [
    [-74.0059, 40.7128], // New York
    [-60.0, 37.0], // Deep US waters
    [-40.0, 35.0], // Deep western Atlantic
    [-25.0, 35.0], // Mid Atlantic Ridge
    [-15.0, 35.0], // Deep Eastern Atlantic
    [-5.8, 35.8], // Gibraltar Strait deep channel
    [0.0, 35.5], // Deep Alboran
    [8.0, 36.0], // Deep western Med
    [15.0, 36.5], // Deep central Mediterranean
    [21.0, 36.8], // Deep central Med
    [24.0, 38.0], // Deep Aegean
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Fas-İspanya': [
    [-6.8498, 33.9716], // Casablanca
    [-6.2, 35.0], // Deep Morocco approach
    [-5.8, 35.9], // Gibraltar Strait deep channel
    [-7.0, 37.0], // Deep approach from Gibraltar
    [-6.5, 40.0], // Deep Spanish Atlantic waters
    [-5.9844, 43.3614] // Santander
  ],

  // Additional reverse routes for completeness
  'Rusya-Türkiye': [
    [39.6916, 47.2357], // Rostov-on-Don
    [36.0, 44.0], // Deep eastern Black Sea
    [33.0, 43.0], // Deep central Black Sea
    [30.5, 42.0], // Deep Black Sea entry
    [29.1, 41.2], // Bosphorus
    [28.9784, 41.0082] // Istanbul
  ],

  'Bulgaristan-Türkiye': [
    [27.9147, 43.1956], // Varna
    [28.0, 43.0], // Deep Bulgarian waters
    [28.5, 42.2], // Deep western Black Sea
    [29.1, 41.2], // Bosphorus
    [28.9784, 41.0082] // Istanbul
  ],

  'Romanya-Türkiye': [
    [28.6596, 44.1598], // Constanta
    [29.0, 43.8], // Deep Romanian waters
    [29.5, 42.5], // Deep central Black Sea
    [29.1, 41.2], // Bosphorus
    [28.9784, 41.0082] // Istanbul
  ],

  'Gürcistan-Türkiye': [
    [41.6168, 41.6401], // Batumi
    [35.0, 41.9], // Deep Georgian waters
    [31.5, 41.8], // Deep eastern Black Sea
    [29.1, 41.2], // Bosphorus
    [28.9784, 41.0082] // Istanbul
  ],

  'Ukrayna-Türkiye': [
    [30.7326, 46.4775], // Odessa
    [30.5, 44.5], // Deep Ukrainian waters
    [30.0, 42.8], // Deep central Black Sea
    [29.1, 41.2], // Bosphorus
    [28.9784, 41.0082] // Istanbul
  ],

  // NEW: Additional reverse Mediterranean routes
  'İtalya-Türkiye': [
    [12.4964, 41.9028], // Italian port
    [15.0, 38.0], // Deep Tyrrhenian Sea
    [18.0, 37.0], // Deep Ionian Sea
    [21.0, 36.5], // Deep central Mediterranean
    [23.5, 37.5], // Deep Aegean (avoiding all islands)
    [25.0, 39.0], // Ege Denizi entry (Aegean Sea)
    [26.0, 39.5], // Çanakkale Boğazı (Dardanelles)
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Yunanistan-Türkiye': [
    [23.7275, 37.9755], // Piraeus
    [24.0, 37.8], // Deep Aegean waters
    [25.0, 38.5], // Deep Aegean entry
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Fransa-Türkiye': [
    [5.3698, 43.2965], // Marseille
    [6.0, 40.0], // Deep Gulf of Lion
    [9.0, 38.5], // Deep western Med
    [13.0, 37.5], // Deep Tyrrhenian
    [17.0, 37.0], // Deep Med waters
    [21.0, 36.8], // Deep central Mediterranean
    [24.0, 38.0], // Deep Aegean
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'İspanya-Türkiye': [
    [-2.0, 41.0], // Spanish port
    [0.0, 39.0], // Deep Spanish waters
    [4.0, 38.0], // Deep Balearic Sea
    [8.0, 37.5], // Deep western Med
    [12.0, 37.0], // Deep Tyrrhenian
    [16.0, 36.5], // Deep Med waters
    [20.0, 36.8], // Deep central Med
    [24.0, 38.0], // Deep Aegean
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Libya-Türkiye': [
    [13.1913, 32.8872], // Tripoli
    [14.0, 34.5], // Deep Libyan waters
    [17.0, 35.5], // Deep central Med
    [21.0, 36.5], // Deep central Med
    [24.0, 38.0], // Deep Aegean
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Tunus-Türkiye': [
    [10.1658, 36.8190], // Tunis
    [11.0, 36.8], // Deep Tunisian waters
    [15.0, 36.2], // Deep Med waters
    [20.0, 36.5], // Deep central Med
    [24.0, 38.0], // Deep Aegean
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Cezayir-Türkiye': [
    [3.0588, 36.7753], // Algiers
    [8.0, 36.8], // Deep Algerian waters
    [15.0, 36.5], // Deep Med waters
    [20.0, 36.8], // Deep central Med
    [24.0, 38.0], // Deep Aegean
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Lübnan-Türkiye': [
    [35.5018, 33.8938], // Beirut
    [33.0, 34.5], // Deep Levantine approach
    [30.0, 35.0], // Deep eastern Med
    [26.0, 35.5], // Eastern Mediterranean
    [24.0, 36.5], // Deep Aegean waters
    [25.0, 38.5], // Deep Aegean entry
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Suriye-Türkiye': [
    [35.7381, 35.1981], // Latakia
    [33.5, 35.5], // Deep Syrian approach
    [30.0, 36.0], // Deep eastern Med
    [26.0, 35.8], // Eastern Mediterranean
    [24.0, 36.5], // Deep Aegean waters
    [25.0, 38.5], // Deep Aegean entry
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ],

  'Ürdün-Türkiye': [
    [35.9106, 29.5320], // Aqaba
    [35.0, 30.2], // Red Sea approach
    [33.0, 31.5], // Deep Levantine approach
    [30.0, 33.0], // Deep eastern Med
    [26.0, 34.5], // Eastern Mediterranean
    [24.0, 36.0], // Deep Aegean waters
    [25.0, 38.5], // Deep Aegean entry
    [26.0, 39.5], // Çanakkale Boğazı
    [26.2, 40.1], // Çanakkale approach
    [28.9784, 41.0082] // Istanbul
  ]
};

// ARKAS Service Routes (same as before but with enhanced data)
const arkasServices = {
  // BLACK SEA SERVICES
  'MRS': {
    name: 'MRS',
    description: 'Türkiye → Rusya → Türkiye',
    category: 'BSE',
    route: ['Türkiye', 'Rusya', 'Türkiye'],
    color: '#1e40af',
    duration: 8,
    distance: '1,250 NM'
  },
  'REX2': {
    name: 'REX2',
    description: 'Mısır → Rusya → Mısır',
    category: 'BSE',
    route: ['Mısır', 'Rusya', 'Mısır'],
    color: '#7c2d12',
    duration: 10,
    distance: '1,680 NM'
  },
  'TBS': {
    name: 'TBS',
    description: 'Türkiye → Bulgaristan → Türkiye',
    category: 'BSE',
    route: ['Türkiye', 'Bulgaristan', 'Türkiye'],
    color: '#059669',
    duration: 6,
    distance: '420 NM'
  },
  'TPS': {
    name: 'TPS',
    description: 'Türkiye → Gürcistan → Türkiye',
    category: 'BSE',
    route: ['Türkiye', 'Gürcistan', 'Türkiye'],
    color: '#7c2d12',
    duration: 6,
    distance: '380 NM'
  },
  'APS': {
    name: 'APS',
    description: 'Türkiye → Gürcistan → Türkiye',
    category: 'BSE',
    route: ['Türkiye', 'Gürcistan', 'Türkiye'],
    color: '#be185d',
    duration: 6,
    distance: '380 NM'
  },
  'TRS': {
    name: 'TRS',
    description: 'Türkiye → Romanya → Türkiye',
    category: 'BSE',
    route: ['Türkiye', 'Romanya', 'Türkiye'],
    color: '#9333ea',
    duration: 7,
    distance: '520 NM'
  },
  'UEX': {
    name: 'UEX',
    description: 'Ukrayna → Türkiye → Yunanistan → Ukrayna',
    category: 'BSE',
    route: ['Ukrayna', 'Türkiye', 'Yunanistan', 'Ukrayna'],
    color: '#0891b2',
    duration: 10,
    distance: '850 NM'
  },

  // EAST MEDITERRANEAN SERVICES
  'BMS': {
    name: 'BMS',
    description: 'Mısır → Lübnan → Suriye → Türkiye → İtalya → Fas → İspanya → Fransa → İtalya → Mısır',
    category: 'EMED',
    route: ['Mısır', 'Lübnan', 'Suriye', 'Türkiye', 'İtalya', 'Fas', 'İspanya', 'Fransa', 'İtalya', 'Mısır'],
    color: '#dc2626',
    duration: 20,
    distance: '4,200 NM'
  },
  'TLS': {
    name: 'TLS',
    description: 'Türkiye → Mısır → Lübnan → Türkiye',
    category: 'EMED',
    route: ['Türkiye', 'Mısır', 'Lübnan', 'Türkiye'],
    color: '#2563eb',
    duration: 8,
    distance: '920 NM'
  },
  'IAS': {
    name: 'IAS',
    description: 'Yunanistan → Türkiye → Yunanistan',
    category: 'EMED',
    route: ['Yunanistan', 'Türkiye', 'Yunanistan'],
    color: '#059669',
    duration: 5,
    distance: '280 NM'
  },

  // WEST MEDITERRANEAN SERVICES
  'ASA': {
    name: 'ASA',
    description: 'Fransa → İspanya → Yunanistan → Türkiye → Fransa',
    category: 'WMED',
    route: ['Fransa', 'İspanya', 'Yunanistan', 'Türkiye', 'Fransa'],
    color: '#7c2d12',
    duration: 12,
    distance: '2,150 NM'
  },
  'ITE': {
    name: 'ITE',
    description: 'İtalya → Türkiye → İtalya',
    category: 'WMED',
    route: ['İtalya', 'Türkiye', 'İtalya'],
    color: '#059669',
    duration: 6,
    distance: '680 NM'
  },
  'SPX': {
    name: 'SPX',
    description: 'İspanya → Fas',
    category: 'WMED',
    route: ['İspanya', 'Fas'],
    color: '#0891b2',
    duration: 4,
    distance: '320 NM'
  },

  // NORTH AFRICA SERVICES
  'AEX': {
    name: 'AEX',
    description: 'İtalya → Fransa → İspanya → Cezayir → İtalya',
    category: 'NAF',
    route: ['İtalya', 'Fransa', 'İspanya', 'Cezayir', 'İtalya'],
    color: '#7c2d12',
    duration: 10,
    distance: '1,580 NM'
  },
  'LTS1': {
    name: 'LTS1',
    description: 'Türkiye → Tunus → Türkiye',
    category: 'NAF',
    route: ['Türkiye', 'Tunus', 'Türkiye'],
    color: '#059669',
    duration: 6,
    distance: '750 NM'
  },
  'LTS2': {
    name: 'LTS2',
    description: 'Türkiye → Libya → Türkiye',
    category: 'NAF',
    route: ['Türkiye', 'Libya', 'Türkiye'],
    color: '#be185d',
    duration: 6,
    distance: '620 NM'
  },
  'NAS': {
    name: 'NAS',
    description: 'Türkiye → Cezayir → Türkiye',
    category: 'NAF',
    route: ['Türkiye', 'Cezayir', 'Türkiye'],
    color: '#9333ea',
    duration: 8,
    distance: '980 NM'
  },
  'OEX': {
    name: 'OEX',
    description: 'İspanya → Cezayir → İspanya',
    category: 'NAF',
    route: ['İspanya', 'Cezayir', 'İspanya'],
    color: '#0891b2',
    duration: 5,
    distance: '420 NM'
  },
  'FMS': {
    name: 'FMS',
    description: 'Fransa → Fas → Fransa',
    category: 'NAF',
    route: ['Fransa', 'Fas', 'Fransa'],
    color: '#dc2626',
    duration: 5,
    distance: '480 NM'
  },
  'WBS': {
    name: 'WBS',
    description: 'Türkiye → Fas → İspanya → Türkiye',
    category: 'NAF',
    route: ['Türkiye', 'Fas', 'İspanya', 'Türkiye'],
    color: '#2563eb',
    duration: 10,
    distance: '1,650 NM'
  },

  // WEST AFRICA SERVICES
  'WAS': {
    name: 'WAS',
    description: 'Fas → Senegal → Nijerya → Benin → Fildişi Sahilleri → Gana → Fas',
    category: 'WAF',
    route: ['Fas', 'Senegal', 'Nijerya', 'Benin', 'Fildişi Sahilleri', 'Gana', 'Fas'],
    color: '#059669',
    duration: 15,
    distance: '2,850 NM'
  },
  'MCS': {
    name: 'MCS',
    description: 'Fas → Fas (İç Hat)',
    category: 'WAF',
    route: ['Fas', 'Fas'],
    color: '#7c2d12',
    duration: 3,
    distance: '150 NM'
  },

  // NORTH AMERICA SERVICES
  'USA': {
    name: 'USA',
    description: 'Türkiye → ABD → Türkiye',
    category: 'NAM',
    route: ['Türkiye', 'ABD', 'Türkiye'],
    color: '#dc2626',
    duration: 15,
    distance: '5,200 NM'
  },

  // RED SEA & INDIA SERVICES
  'IMS': {
    name: 'IMS',
    description: 'Türkiye → Ürdün → Suudi Arabistan → Hindistan → Suudi Arabistan → Ürdün → Mısır → Türkiye',
    category: 'RSS',
    route: ['Türkiye', 'Ürdün', 'Suudi Arabistan', 'Hindistan', 'Suudi Arabistan', 'Ürdün', 'Mısır', 'Türkiye'],
    color: '#7c2d12',
    duration: 20,
    distance: '6,800 NM'
  }
};

// Current state
let currentService = null;
let currentTimeline = null;
let isPaused = false;

// Initialize application
const initApp = () => {
  setupMapSettings();
  setupTabs();
  setupServiceButtons();
  setupControls();
  setupMouseInteraction();
  drawStaticGlobe();
};

// Map settings functionality
const setupMapSettings = () => {
  // Toggle settings panel
  document.getElementById('toggleSettings').addEventListener('click', () => {
    const content = document.getElementById('settingsContent');
    content.classList.toggle('collapsed');
  });

  // Projection type change
  document.getElementById('projectionType').addEventListener('change', (e) => {
    mapSettings.projection = e.target.value;
    updateProjection();
  });

  // Color theme change
  document.getElementById('colorTheme').addEventListener('change', (e) => {
    mapSettings.colorTheme = e.target.value;
    drawStaticGlobe();
  });

  // Route type change
  document.getElementById('routeType').addEventListener('change', (e) => {
    mapSettings.routeType = e.target.value;
    
    // Provide visual feedback for sea route selection
    const routeTypeSelect = document.getElementById('routeType');
    if (e.target.value === 'sea') {
      routeTypeSelect.style.backgroundColor = '#1e40af';
      routeTypeSelect.style.color = '#ffffff';
      
      // Show a temporary notification
      showNotification('🌊 Deniz rotası aktif - sadece okyanus güzergahları kullanılacak');
    } else {
      routeTypeSelect.style.backgroundColor = '';
      routeTypeSelect.style.color = '';
      
      showNotification('✈️ Doğrudan rota aktif - hava/kara güzergahları kullanılacak');
    }
    
    // If there's an active service, refresh the route display
    if (currentService) {
      drawStaticGlobe();
    }
  });

  // Animation speed
  document.getElementById('animationSpeed').addEventListener('input', (e) => {
    mapSettings.animationSpeed = parseFloat(e.target.value);
    document.getElementById('speedValue').textContent = mapSettings.animationSpeed.toFixed(1) + 'x';
  });

  // Show labels
  document.getElementById('showLabels').addEventListener('change', (e) => {
    mapSettings.showLabels = e.target.checked;
    drawStaticGlobe();
  });

  // Zoom controls
  document.getElementById('zoomIn').addEventListener('click', () => {
    mapSettings.zoom = Math.min(mapSettings.zoom * 1.3, 1500);
    updateZoom();
  });

  document.getElementById('zoomOut').addEventListener('click', () => {
    mapSettings.zoom = Math.max(mapSettings.zoom * 0.77, 50);
    updateZoom();
  });

  // Reset view
  document.getElementById('resetView').addEventListener('click', () => {
    mapSettings.zoom = 500;
    projection.rotate([0, 0, 0]);
    updateZoom();
    drawStaticGlobe();
  });

  // Mouse wheel zoom functionality
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = mapSettings.zoom * zoomFactor;
    
    // Constrain zoom levels for better performance and usability
    mapSettings.zoom = Math.max(50, Math.min(1500, newZoom));
    
    updateZoom();
  });

  // Touch zoom support for mobile devices
  let lastTouchDistance = 0;
  let isZooming = false;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isZooming = true;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      lastTouchDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    if (isZooming && e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      if (lastTouchDistance > 0) {
        const zoomFactor = currentDistance / lastTouchDistance;
        const newZoom = mapSettings.zoom * zoomFactor;
        mapSettings.zoom = Math.max(50, Math.min(1500, newZoom));
        updateZoom();
      }
      
      lastTouchDistance = currentDistance;
    }
  });

  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      isZooming = false;
      lastTouchDistance = 0;
    }
  });
};

// Update projection type
const updateProjection = () => {
  const projectionTypes = {
    orthographic: d3.geoOrthographic(),
    natural: d3.geoNaturalEarth1(),
    mercator: d3.geoMercator(),
    robinson: d3.geoRobinson()
  };

  projection = projectionTypes[mapSettings.projection]
    .scale(mapSettings.zoom)
    .translate([width / 2, height / 2]);

  drawStaticGlobe();
};

// Update zoom
const updateZoom = () => {
  projection.scale(mapSettings.zoom);
  document.getElementById('zoomLevel').textContent = Math.round(mapSettings.zoom);
  drawStaticGlobe();
};

// Generate sea route between two countries
const generateSeaRoute = (startCountry, endCountry) => {
  const routeKey = `${startCountry}-${endCountry}`;
  const reverseKey = `${endCountry}-${startCountry}`;
  
  if (seaRoutes[routeKey]) {
    return seaRoutes[routeKey];
  } else if (seaRoutes[reverseKey]) {
    return [...seaRoutes[reverseKey]].reverse();
  }
  
  // For sea routes, we must enforce ocean-only navigation
  const start = countryCoords[startCountry];
  const end = countryCoords[endCountry];
  
  if (!start || !end) return [start, end];
  
  // When sea route is selected, create detailed ocean waypoints
  if (mapSettings.routeType === 'sea') {
    return generateOceanRoute(start, end, startCountry, endCountry);
  }
  
  // Fallback to direct route for air/land routes
  const midLon = (start[0] + end[0]) / 2;
  const midLat = (start[1] + end[1]) / 2;
  
  // Add intermediate points for long routes
  if (Math.abs(start[0] - end[0]) > 20 || Math.abs(start[1] - end[1]) > 15) {
    return [start, [midLon, midLat], end];
  }
  
  return [start, end];
};

// Generate detailed ocean-only route
const generateOceanRoute = (start, end, startCountry, endCountry) => {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  // Define major ocean depth zones (these coordinates are in deep water)
  const oceanZones = {
    // Mediterranean deep water zones (avoiding shallow coastal areas)
    med_west: [-1.0, 37.5], // Deep Alboran Sea
    med_central: [8.0, 38.5], // Deep Tyrrhenian Sea  
    med_east: [25.0, 36.0], // Deep Eastern Mediterranean
    
    // Atlantic deep water zones
    atlantic_east: [-12.0, 36.0], // Deep Eastern Atlantic
    atlantic_central: [-25.0, 35.0], // Mid Atlantic Ridge area
    atlantic_west: [-40.0, 35.0], // Western Atlantic deep
    
    // Black Sea deep water zones
    blacksea_central: [32.0, 43.5], // Central Black Sea deep water
    blacksea_west: [29.0, 43.0], // Western Black Sea deep
    blacksea_east: [37.0, 42.5], // Eastern Black Sea deep
    
    // Red Sea deep water
    redsea_north: [35.0, 27.0], // Northern Red Sea deep
    redsea_south: [40.0, 18.0], // Southern Red Sea deep
    
    // Arabian Sea deep water
    arabian_west: [55.0, 18.0], // Western Arabian Sea
    arabian_central: [65.0, 15.0], // Central Arabian Sea deep
    
    // Gulf of Guinea deep water
    guinea_deep: [-5.0, 5.0], // Deep Gulf of Guinea
    
    // West Africa Atlantic deep water
    wafrica_deep: [-15.0, 20.0] // Deep West African Atlantic
  };
  
  let waypoints = [start];
  
  // Route classification and oceanic path generation
  const routeType = classifyRoute(startCountry, endCountry, startLon, startLat, endLon, endLat);
  
  switch (routeType) {
    case 'BLACK_SEA':
      waypoints = generateBlackSeaOceanRoute(start, end, startCountry, endCountry, oceanZones);
      break;
      
    case 'MEDITERRANEAN':
      waypoints = generateMediterraneanOceanRoute(start, end, startCountry, endCountry, oceanZones);
      break;
      
    case 'ATLANTIC_CROSSING':
      waypoints = generateAtlanticCrossingRoute(start, end, startCountry, endCountry, oceanZones);
      break;
      
    case 'GIBRALTAR_PASSAGE':
      waypoints = generateGibraltarPassageRoute(start, end, startCountry, endCountry, oceanZones);
      break;
      
    case 'RED_SEA_INDIAN':
      waypoints = generateRedSeaIndianRoute(start, end, startCountry, endCountry, oceanZones);
      break;
      
    case 'WEST_AFRICA':
      waypoints = generateWestAfricaRoute(start, end, startCountry, endCountry, oceanZones);
      break;
      
    default:
      waypoints = generateGenericOceanRoute(start, end, oceanZones);
  }
  
  return waypoints;
};

// Classify route type for proper oceanic navigation
const classifyRoute = (startCountry, endCountry, startLon, startLat, endLon, endLat) => {
  // Black Sea routes
  if ((startLon > 27 && startLon < 42 && startLat > 40 && startLat < 48) ||
      (endLon > 27 && endLon < 42 && endLat > 40 && endLat < 48)) {
    return 'BLACK_SEA';
  }
  
  // Atlantic crossing (Americas <-> Europe/Africa)
  if (Math.abs(startLon - endLon) > 40) {
    return 'ATLANTIC_CROSSING';
  }
  
  // Gibraltar passage (Atlantic <-> Mediterranean)
  if ((startLon < -5 && endLon > 0) || (startLon > 0 && endLon < -5)) {
    return 'GIBRALTAR_PASSAGE';
  }
  
  // Mediterranean routes
  if (startLon > -10 && startLon < 40 && startLat > 30 && startLat < 47 &&
      endLon > -10 && endLon < 40 && endLat > 30 && endLat < 47) {
    return 'MEDITERRANEAN';
  }
  
  // Red Sea & Indian Ocean routes
  if ((startLon > 30 && startLon < 80 && startLat > 10 && startLat < 35) ||
      (endLon > 30 && endLon < 80 && endLat > 10 && endLat < 35)) {
    return 'RED_SEA_INDIAN';
  }
  
  // West Africa routes
  if ((startLon < -5 && startLat < 25 && startLat > 0) ||
      (endLon < -5 && endLat < 25 && endLat > 0)) {
    return 'WEST_AFRICA';
  }
  
  return 'GENERIC';
};

// Black Sea oceanic routes (staying in deep central waters)
const generateBlackSeaOceanRoute = (start, end, startCountry, endCountry, zones) => {
  return [
    start,
    [29.2, 41.3], // Bosphorus entry (unavoidable narrow passage)
    zones.blacksea_central, // Central Black Sea deep water
    zones.blacksea_west, // Western deep water if needed
    end
  ].filter((point, index, arr) => {
    // Remove unnecessary waypoints if route is short
    if (arr.length <= 3) return true;
    const distance = calculateDistance(start, end);
    return distance > 10 || index === 0 || index === arr.length - 1;
  });
};

// Mediterranean oceanic routes (staying in deep blue water)
const generateMediterraneanOceanRoute = (start, end, startCountry, endCountry, zones) => {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  let waypoints = [start];
  
  // Western Mediterranean destinations
  if (endLon < 5) {
    waypoints.push(
      [26.0, 38.5], // Deep Aegean exit
      [22.0, 36.5], // Deep central Mediterranean
      [18.0, 36.0], // Deep central Med
      [12.0, 36.5], // Deep Tyrrhenian
      [6.0, 37.0],  // Deep western Mediterranean
      zones.med_west, // Deep Alboran Sea
      end
    );
  }
  // Eastern Mediterranean destinations  
  else if (endLon > 30) {
    waypoints.push(
      [30.0, 37.0], // Deep eastern Mediterranean
      [33.0, 35.0], // Deep Levantine Sea
      end
    );
  }
  // Central Mediterranean destinations
  else {
    waypoints.push(
      [25.0, 37.0], // Deep Aegean exit
      [20.0, 36.0], // Deep central Mediterranean
      [15.0, 36.5], // Deep central Med
      end
    );
  }
  
  return waypoints;
};

// Atlantic crossing routes (deep ocean navigation)
const generateAtlanticCrossingRoute = (start, end, startCountry, endCountry, zones) => {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  let waypoints = [start];
  
  if (startLon > 0 && endLon < -20) {
    // Europe/Africa to Americas
    waypoints.push(
      [-5.7, 35.9], // Gibraltar Strait (deep channel)
      [-10.0, 36.0], // Atlantic entry (deep)
      zones.atlantic_east, // Deep Eastern Atlantic
      zones.atlantic_central, // Mid Atlantic Ridge
      zones.atlantic_west, // Deep Western Atlantic
      [endLon + 5, endLat], // Approach destination in deep water
      end
    );
  } else if (startLon < -20 && endLon > 0) {
    // Americas to Europe/Africa
    waypoints.push(
      [startLon + 5, startLat], // Departure in deep water
      zones.atlantic_west, // Deep Western Atlantic
      zones.atlantic_central, // Mid Atlantic Ridge
      zones.atlantic_east, // Deep Eastern Atlantic
      [-10.0, 36.0], // Atlantic approach
      [-5.7, 35.9], // Gibraltar Strait (deep channel)
      end
    );
  }
  
  return waypoints;
};

// Gibraltar passage routes (Atlantic <-> Mediterranean)
const generateGibraltarPassageRoute = (start, end, startCountry, endCountry, zones) => {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  let waypoints = [start];
  
  if (startLon > 0 && endLon < 0) {
    // Mediterranean to Atlantic
    waypoints.push(
      [2.0, 36.0], // Deep western Mediterranean
      [-2.0, 36.0], // Gibraltar approach (deep)
      [-5.7, 35.9], // Gibraltar Strait deep channel
      [-8.0, 35.0], // Atlantic entry deep water
      end
    );
  } else if (startLon < 0 && endLon > 0) {
    // Atlantic to Mediterranean
    waypoints.push(
      [-8.0, 35.0], // Deep Atlantic approach
      [-5.7, 35.9], // Gibraltar Strait deep channel
      [-2.0, 36.0], // Gibraltar exit (deep)
      [2.0, 36.0], // Deep western Mediterranean
      end
    );
  }
  
  return waypoints;
};

// Red Sea and Indian Ocean routes
const generateRedSeaIndianRoute = (start, end, startCountry, endCountry, zones) => {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  let waypoints = [start];
  
  // Red Sea navigation (deep channel only)
  if (startLon < 45 && endLon < 45) {
    waypoints.push(
      zones.redsea_north, // Northern Red Sea deep water
      [38.0, 22.0], // Central Red Sea deep channel
      zones.redsea_south, // Southern Red Sea deep water
      end
    );
  }
  // Indian Ocean routes
  else if (endLon > 65) {
    waypoints.push(
      zones.redsea_south, // Red Sea exit
      [45.0, 15.0], // Arabian Sea entry (deep)
      zones.arabian_west, // Western Arabian Sea deep
      zones.arabian_central, // Central Arabian Sea deep
      [70.0, 17.0], // Indian coast approach (deep water)
      end
    );
  }
  
  return waypoints;
};

// West Africa oceanic routes
const generateWestAfricaRoute = (start, end, startCountry, endCountry, zones) => {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  let waypoints = [start];
  
  // Along West African coast (staying in deep Atlantic)
  if (startLat > endLat) {
    // North to South
    waypoints.push(
      [-10.0, startLat - 5], // Move into deep Atlantic
      zones.wafrica_deep, // Deep West African Atlantic
      [-12.0, endLat + 3], // Deep water approach
      end
    );
  } else {
    // South to North
    waypoints.push(
      [-12.0, startLat + 3], // Deep water departure
      zones.wafrica_deep, // Deep West African Atlantic
      [-10.0, endLat - 5], // Deep Atlantic approach
      end
    );
  }
  
  return waypoints;
};

// Generic oceanic route for other cases
const generateGenericOceanRoute = (start, end, zones) => {
  const [startLon, startLat] = start;
  const [endLon, endLat] = end;
  
  const distance = calculateDistance(start, end);
  
  if (distance < 15) {
    // Short route - direct with minimal waypoints in deep water
    const midLon = (startLon + endLon) / 2;
    const midLat = (startLat + endLat) / 2;
    return [start, [midLon, midLat - 1], end]; // Slightly south for deeper water
  } else {
    // Long route - multiple deep water waypoints
    const waypoints = [start];
    const segments = Math.min(Math.floor(distance / 10), 4);
    
    for (let i = 1; i <= segments; i++) {
      const progress = i / (segments + 1);
      const wpLon = startLon + (endLon - startLon) * progress;
      const wpLat = startLat + (endLat - startLat) * progress;
      
      // Adjust to deep water (avoid shallow coastal areas)
      const adjustedLat = wpLat - 2; // Move south into deeper water
      waypoints.push([wpLon, adjustedLat]);
    }
    
    waypoints.push(end);
    return waypoints;
  }
};

// Calculate distance between two points
const calculateDistance = (point1, point2) => {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  return Math.sqrt(Math.pow(lon2 - lon1, 2) + Math.pow(lat2 - lat1, 2));
};

// Tab functionality
const setupTabs = () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const serviceCategories = document.querySelectorAll('.service-category');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      
      // Update active tab
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Update active service category
      serviceCategories.forEach(cat => cat.classList.remove('active'));
      document.getElementById(category).classList.add('active');
      
      // Reset current service
      resetRoute();
    });
  });
};

// Service button functionality
const setupServiceButtons = () => {
  const serviceButtons = document.querySelectorAll('.service-button');
  
  serviceButtons.forEach(button => {
    button.addEventListener('click', () => {
      const serviceId = button.dataset.service;
      const service = arkasServices[serviceId];
      
      if (service) {
        selectService(service, button);
      }
    });
  });
};

// Control buttons
const setupControls = () => {
  document.getElementById('startRoute').addEventListener('click', startRoute);
  document.getElementById('pauseRoute').addEventListener('click', pauseRoute);
  document.getElementById('resetRoute').addEventListener('click', resetRoute);
};

// Select a service
const selectService = (service, buttonElement) => {
  // Reset previous selection
  document.querySelectorAll('.service-button').forEach(btn => btn.classList.remove('active'));
  buttonElement.classList.add('active');
  
  currentService = service;
  
  // Update UI
  document.getElementById('serviceName').textContent = service.name;
  document.getElementById('routeDescription').textContent = service.description;
  document.getElementById('routeDistance').textContent = service.distance;
  document.getElementById('routeDuration').textContent = `${service.duration} saat`;
  document.getElementById('startRoute').disabled = false;
  
  // Focus on first country
  if (service.route.length > 0 && countryCoords[service.route[0]]) {
    focusOnCountry(service.route[0]);
  }
};

// Focus camera on a country
const focusOnCountry = (countryName) => {
  const coords = countryCoords[countryName];
  if (!coords) return;
  
  const rotation = [-coords[0], -coords[1], 0];
  
  gsap.to(projection, {
    duration: 2,
    ease: "power2.inOut",
    onUpdate: function() {
      const progress = this.progress();
      const currentRotation = projection.rotate();
      const newRotation = [
        currentRotation[0] + (rotation[0] - currentRotation[0]) * progress,
        currentRotation[1] + (rotation[1] - currentRotation[1]) * progress,
        0
      ];
      projection.rotate(newRotation);
      drawStaticGlobe();
    }
  });
};

// Start route animation
const startRoute = () => {
  if (!currentService) return;
  
  document.getElementById('startRoute').style.display = 'none';
  document.getElementById('pauseRoute').style.display = 'block';
  document.getElementById('resetRoute').style.display = 'block';
  
  animation.isAnimating = true;
  animateRoute();
};

// Pause route animation
const pauseRoute = () => {
  if (currentTimeline) {
    if (isPaused) {
      currentTimeline.resume();
      document.getElementById('pauseRoute').textContent = '⏸️ Duraklat';
      isPaused = false;
    } else {
      currentTimeline.pause();
      document.getElementById('pauseRoute').textContent = '▶️ Devam Et';
      isPaused = true;
    }
  }
};

// Reset route
const resetRoute = () => {
  if (currentTimeline) {
    currentTimeline.kill();
    currentTimeline = null;
  }
  
  animation.isAnimating = false;
  animation.progress = 0;
  isPaused = false;
  
  document.getElementById('startRoute').style.display = 'block';
  document.getElementById('pauseRoute').style.display = 'none';
  document.getElementById('resetRoute').style.display = 'none';
  document.getElementById('pauseRoute').textContent = '⏸️ Duraklat';
  document.getElementById('progressBar').style.width = '0%';
  
  // Clear service selection
  document.querySelectorAll('.service-button').forEach(btn => btn.classList.remove('active'));
  document.getElementById('serviceName').textContent = 'Servis Seçin';
  document.getElementById('routeDescription').textContent = 'Haritada görmek istediğiniz servisi seçin';
  document.getElementById('routeDistance').textContent = '-';
  document.getElementById('routeDuration').textContent = '-';
  document.getElementById('startRoute').disabled = true;
  currentService = null;
  
  drawStaticGlobe();
};

// Animate route
const animateRoute = () => {
  if (!currentService) return;
  
  const route = currentService.route;
  const duration = currentService.duration / mapSettings.animationSpeed;
  
  currentTimeline = gsap.timeline({
    onComplete: () => {
      animation.isAnimating = false;
      document.getElementById('pauseRoute').style.display = 'none';
      document.getElementById('startRoute').style.display = 'block';
    }
  });
  
  // Animate through each segment of the route
  for (let i = 0; i < route.length - 1; i++) {
    const startCountry = route[i];
    const endCountry = route[i + 1];
    const segmentDuration = duration / (route.length - 1);
    
    currentTimeline.to(animation, {
      duration: segmentDuration,
      progress: (i + 1) / (route.length - 1),
      ease: "power2.inOut",
      onUpdate: () => {
        const progress = animation.progress;
        document.getElementById('progressBar').style.width = `${progress * 100}%`;
        drawRouteProgress(route, progress);
      }
    });
  }
};

// Draw static globe
const drawStaticGlobe = () => {
  ctx.clearRect(0, 0, width, height);
  
  const theme = colorThemes[mapSettings.colorTheme];
  
  // Draw ocean
  ctx.beginPath();
  pathGenerator({ type: "Sphere" });
  ctx.fillStyle = theme.water;
  ctx.fill();
  ctx.strokeStyle = theme.waterStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw countries
  data.forEach(feature => {
    ctx.beginPath();
    pathGenerator(feature);
    ctx.fillStyle = theme.land;
    ctx.fill();
    ctx.strokeStyle = theme.landStroke;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });
  
  // Draw port labels if enabled
  if (mapSettings.showLabels && currentService) {
    currentService.route.forEach(country => {
      drawPortLabel(country);
    });
  }
};

// Draw port label
const drawPortLabel = (countryName) => {
  const coords = countryCoords[countryName];
  if (!coords) return;
  
  const [x, y] = projection(coords);
  
  // Check if point is visible
  if (x < 0 || x > width || y < 0 || y > height) return;
  
  ctx.save();
  ctx.fillStyle = '#1f2937';
  ctx.font = '12px Inter, sans-serif';
  ctx.fontWeight = '600';
  ctx.textAlign = 'center';
  
  // Background
  const textWidth = ctx.measureText(countryName).width;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillRect(x - textWidth/2 - 4, y - 18, textWidth + 8, 16);
  
  // Text
  ctx.fillStyle = '#1f2937';
  ctx.fillText(countryName, x, y - 6);
  ctx.restore();
};

// Draw route progress
const drawRouteProgress = (route, progress) => {
  drawStaticGlobe();
  
  if (!currentService) return;
  
  const totalSegments = route.length - 1;
  const currentSegment = Math.floor(progress * totalSegments);
  const segmentProgress = (progress * totalSegments) % 1;
  
  // Draw completed segments
  for (let i = 0; i < currentSegment; i++) {
    drawSegment(route[i], route[i + 1], 1, currentService.color);
  }
  
  // Draw current segment
  if (currentSegment < totalSegments) {
    drawSegment(route[currentSegment], route[currentSegment + 1], segmentProgress, currentService.color);
  }
  
  // Draw ports
  route.forEach((country, index) => {
    if (countryCoords[country]) {
      const isActive = index <= currentSegment || (index === currentSegment + 1 && segmentProgress > 0);
      drawPort(country, isActive);
    }
  });
};

// Draw segment between two countries
const drawSegment = (startCountry, endCountry, progress, color) => {
  // Always use the appropriate route type based on settings
  const routePoints = mapSettings.routeType === 'sea' 
    ? generateSeaRoute(startCountry, endCountry)
    : [countryCoords[startCountry], countryCoords[endCountry]];
  
  if (!routePoints || routePoints.length < 2) return;
  
  // Validate that we have valid coordinates
  const validRoutePoints = routePoints.filter(point => 
    point && Array.isArray(point) && point.length === 2 && 
    !isNaN(point[0]) && !isNaN(point[1])
  );
  
  if (validRoutePoints.length < 2) return;
  
  // Create smooth path using all route points with detailed interpolation
  const totalProgress = Math.min(progress, 1);
  const animatedPoints = [];
  
  if (validRoutePoints.length === 2) {
    // Simple two-point route - create more intermediate points for smoother animation
    const interpolator = d3.geoInterpolate(validRoutePoints[0], validRoutePoints[1]);
    const numPoints = Math.floor(totalProgress * 120); // Increased for smoother animation
    
    for (let i = 0; i <= numPoints; i++) {
      animatedPoints.push(interpolator(i / 120));
    }
  } else {
    // Multi-point sea route - detailed interpolation between each segment
    const totalSegments = validRoutePoints.length - 1;
    const progressPerSegment = 1 / totalSegments;
    
    for (let segIdx = 0; segIdx < totalSegments; segIdx++) {
      const segmentStart = segIdx * progressPerSegment;
      const segmentEnd = (segIdx + 1) * progressPerSegment;
      
      if (totalProgress > segmentStart) {
        const segmentProgress = Math.min((totalProgress - segmentStart) / progressPerSegment, 1);
        const interpolator = d3.geoInterpolate(validRoutePoints[segIdx], validRoutePoints[segIdx + 1]);
        
        // Create more intermediate points for each segment (especially for sea routes)
        const segmentPointCount = Math.floor(segmentProgress * (mapSettings.routeType === 'sea' ? 40 : 20));
        const maxPoints = mapSettings.routeType === 'sea' ? 40 : 20;
        
        for (let i = 0; i <= segmentPointCount; i++) {
          animatedPoints.push(interpolator(i / maxPoints));
        }
      }
    }
  }
  
  // Draw the animated route with enhanced visibility
  if (animatedPoints.length > 1) {
    ctx.beginPath();
    
    // Start the path
    const firstPoint = projection(animatedPoints[0]);
    if (!firstPoint || isNaN(firstPoint[0]) || isNaN(firstPoint[1])) return;
    
    ctx.moveTo(firstPoint[0], firstPoint[1]);
    
    // Draw smooth curves through all points
    for (let i = 1; i < animatedPoints.length; i++) {
      const point = projection(animatedPoints[i]);
      if (point && !isNaN(point[0]) && !isNaN(point[1])) {
        ctx.lineTo(point[0], point[1]);
      }
    }
    
    // Enhanced line styling based on route type
    const lineWidth = mapSettings.routeType === 'sea' ? 8 : 6;
    const shadowBlur = mapSettings.routeType === 'sea' ? 12 : 8;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    // Add a glow effect (more prominent for sea routes)
    ctx.shadowColor = color;
    ctx.shadowBlur = shadowBlur;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw a thinner inner line for contrast
    ctx.beginPath();
    const firstPointInner = projection(animatedPoints[0]);
    if (firstPointInner && !isNaN(firstPointInner[0]) && !isNaN(firstPointInner[1])) {
      ctx.moveTo(firstPointInner[0], firstPointInner[1]);
      
      for (let i = 1; i < animatedPoints.length; i++) {
        const point = projection(animatedPoints[i]);
        if (point && !isNaN(point[0]) && !isNaN(point[1])) {
          ctx.lineTo(point[0], point[1]);
        }
      }
      
      ctx.strokeStyle = mapSettings.routeType === 'sea' ? '#ffffff' : '#ffffff';
      ctx.lineWidth = mapSettings.routeType === 'sea' ? 3 : 2;
      ctx.stroke();
    }
    
    // Draw ship at current position with enhanced visibility
    if (progress > 0 && progress < 1 && animatedPoints.length > 0) {
      const shipPos = animatedPoints[animatedPoints.length - 1];
      drawShip(shipPos, color);
    }
  }
};

// Draw port
const drawPort = (countryName, isActive) => {
  const coords = countryCoords[countryName];
  if (!coords) return;
  
  const [x, y] = projection(coords);
  
  ctx.beginPath();
  ctx.arc(x, y, isActive ? 8 : 5, 0, Math.PI * 2);
  ctx.fillStyle = isActive ? "#ef4444" : "#6b7280";
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
};

// Draw ship
const drawShip = (coords, color) => {
  const [x, y] = projection(coords);
  
  ctx.save();
  ctx.translate(x, y);
  
  // Ship body
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Ship icon
  ctx.fillStyle = "#ffffff";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🚢", 0, 5);
  
  ctx.restore();
};

// Animation loop
const animate = () => {
  if (!animation.isAnimating) {
    drawStaticGlobe();
  }
  requestAnimationFrame(animate);
};

// Resize handler
window.addEventListener('resize', () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  
  if (newWidth !== width || newHeight !== height) {
    width = newWidth;
    height = newHeight;
    canvas.width = width;
    canvas.height = height;
    
    projection.translate([width / 2, height / 2]);
    drawStaticGlobe();
  }
});

// Show notification to user
const showNotification = (message) => {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.route-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'route-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(30, 64, 175, 0.95);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 1000;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 100);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
};

// Setup mouse interaction for globe rotation and country tooltips
const setupMouseInteraction = () => {
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  
  // Mouse down - start dragging
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });
  
  // Mouse move - rotate globe or show country tooltip
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      
      const currentRotation = projection.rotate();
      const rotationSpeed = 0.25; // Reduced speed for smoother control
      
      // FIXED: Intuitive movement - right drag moves right, up drag moves up
      const newRotation = [
        currentRotation[0] + deltaX * rotationSpeed, // + for intuitive right movement
        Math.max(-90, Math.min(90, currentRotation[1] - deltaY * rotationSpeed)), // - for intuitive up movement
        currentRotation[2]
      ];
      
      projection.rotate(newRotation);
      drawStaticGlobe();
      
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    } else {
      // Show country tooltip
      showCountryTooltip(e);
    }
  });
  
  // Mouse up - stop dragging
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'grab';
  });
  
  // Mouse leave - stop dragging and hide tooltip
  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    canvas.style.cursor = 'default';
    hideCountryTooltip();
  });
  
  // Set initial cursor
  canvas.style.cursor = 'grab';
  
  // Touch support for mobile
  let lastTouchX = 0;
  let lastTouchY = 0;
  let isTouchDragging = false;
  
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isTouchDragging = true;
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      e.preventDefault();
    }
  });
  
  canvas.addEventListener('touchmove', (e) => {
    if (isTouchDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - lastTouchX;
      const deltaY = e.touches[0].clientY - lastTouchY;
      
      const currentRotation = projection.rotate();
      const rotationSpeed = 0.25;
      
      // FIXED: Same intuitive movement for touch
      const newRotation = [
        currentRotation[0] + deltaX * rotationSpeed,
        Math.max(-90, Math.min(90, currentRotation[1] - deltaY * rotationSpeed)),
        currentRotation[2]
      ];
      
      projection.rotate(newRotation);
      drawStaticGlobe();
      
      lastTouchX = e.touches[0].clientX;
      lastTouchY = e.touches[0].clientY;
      e.preventDefault();
    }
  });
  
  canvas.addEventListener('touchend', () => {
    isTouchDragging = false;
  });
};

// Show country tooltip on hover
const showCountryTooltip = (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Convert screen coordinates to longitude/latitude
  const coords = projection.invert([x, y]);
  if (!coords) return;
  
  // Find which country this point belongs to
  const country = findCountryAtPoint(coords);
  
  if (country) {
    let tooltip = document.getElementById('countryTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'countryTooltip';
      tooltip.style.cssText = `
        position: fixed;
        background: rgba(30, 64, 175, 0.95);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        pointer-events: none;
        z-index: 1001;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: opacity 0.2s ease;
      `;
      document.body.appendChild(tooltip);
    }
    
    tooltip.textContent = country;
    tooltip.style.left = (e.clientX + 10) + 'px';
    tooltip.style.top = (e.clientY - 10) + 'px';
    tooltip.style.opacity = '1';
  } else {
    hideCountryTooltip();
  }
};

// Hide country tooltip
const hideCountryTooltip = () => {
  const tooltip = document.getElementById('countryTooltip');
  if (tooltip) {
    tooltip.style.opacity = '0';
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    }, 200);
  }
};

// Find country at given coordinates
const findCountryAtPoint = (coords) => {
  // Enhanced country detection with better boundaries
  const [lon, lat] = coords;
  
  // Turkey - expanded boundaries for better detection
  if (lon >= 25 && lon <= 45 && lat >= 35 && lat <= 43) return 'Türkiye';
  
  // Russia - better coverage
  if (lon >= 19 && lon <= 180 && lat >= 41 && lat <= 85) return 'Rusya';
  
  // Egypt - better boundaries
  if (lon >= 24 && lon <= 37 && lat >= 21 && lat <= 32) return 'Mısır';
  
  // Italy - improved detection
  if (lon >= 6 && lon <= 19 && lat >= 35 && lat <= 48) return 'İtalya';
  
  // Spain - better coverage including islands
  if (lon >= -19 && lon <= 5 && lat >= 27 && lat <= 45) return 'İspanya';
  
  // France - improved boundaries
  if (lon >= -5 && lon <= 10 && lat >= 41 && lat <= 52) return 'Fransa';
  
  // Morocco - better coverage
  if (lon >= -18 && lon <= 0 && lat >= 27 && lat <= 36) return 'Fas';
  
  // Greece - including islands
  if (lon >= 19 && lon <= 30 && lat >= 34 && lat <= 42) return 'Yunanistan';
  
  // Bulgaria
  if (lon >= 22 && lon <= 29 && lat >= 41 && lat <= 44) return 'Bulgaristan';
  
  // Romania
  if (lon >= 20 && lon <= 30 && lat >= 43 && lat <= 49) return 'Romanya';
  
  // Georgia
  if (lon >= 39 && lon <= 47 && lat >= 41 && lat <= 44) return 'Gürcistan';
  
  // Ukraine - better coverage
  if (lon >= 22 && lon <= 41 && lat >= 44 && lat <= 53) return 'Ukrayna';
  
  // Lebanon
  if (lon >= 35 && lon <= 37 && lat >= 33 && lat <= 35) return 'Lübnan';
  
  // Syria
  if (lon >= 35 && lon <= 43 && lat >= 32 && lat <= 38) return 'Suriye';
  
  // Libya
  if (lon >= 9 && lon <= 26 && lat >= 19 && lat <= 34) return 'Libya';
  
  // Algeria
  if (lon >= -9 && lon <= 12 && lat >= 18 && lat <= 38) return 'Cezayir';
  
  // Tunisia
  if (lon >= 7 && lon <= 12 && lat >= 30 && lat <= 38) return 'Tunus';
  
  // Senegal
  if (lon >= -18 && lon <= -11 && lat >= 12 && lat <= 17) return 'Senegal';
  
  // Nigeria
  if (lon >= 2 && lon <= 15 && lat >= 4 && lat <= 14) return 'Nijerya';
  
  // Benin
  if (lon >= 0 && lon <= 4 && lat >= 6 && lat <= 13) return 'Benin';
  
  // Ivory Coast
  if (lon >= -9 && lon <= -2 && lat >= 4 && lat <= 11) return 'Fildişi Sahilleri';
  
  // Ghana
  if (lon >= -4 && lon <= 2 && lat >= 4 && lat <= 12) return 'Gana';
  
  // USA - better coverage
  if (lon >= -180 && lon <= -60 && lat >= 15 && lat <= 75) return 'ABD';
  
  // Jordan
  if (lon >= 34 && lon <= 40 && lat >= 29 && lat <= 34) return 'Ürdün';
  
  // Saudi Arabia
  if (lon >= 34 && lon <= 56 && lat >= 15 && lat <= 33) return 'Suudi Arabistan';
  
  // India - better coverage
  if (lon >= 68 && lon <= 98 && lat >= 6 && lat <= 38) return 'Hindistan';
  
  // Additional countries for better coverage
  if (lon >= -12 && lon <= 3 && lat >= 49 && lat <= 61) return 'Birleşik Krallık';
  if (lon >= 5 && lon <= 16 && lat >= 47 && lat <= 55) return 'Almanya';
  if (lon >= 12 && lon <= 24 && lat >= 46 && lat <= 59) return 'Polonya';
  if (lon >= -10 && lon <= -6 && lat >= 51 && lat <= 56) return 'İrlanda';
  if (lon >= 4 && lon <= 8 && lat >= 50 && lat <= 54) return 'Belçika';
  if (lon >= 3 && lon <= 8 && lat >= 50 && lat <= 54) return 'Hollanda';
  if (lon >= 5 && lon <= 16 && lat >= 54 && lat <= 58) return 'Danimarka';
  if (lon >= 10 && lon <= 25 && lat >= 55 && lat <= 70) return 'İsveç';
  if (lon >= 4 && lon <= 32 && lat >= 58 && lat <= 71) return 'Norveç';
  if (lon >= 19 && lon <= 30 && lat >= 59 && lat <= 70) return 'Finlandiya';
  
  return null;
};

// Initialize app
initApp();
animate();