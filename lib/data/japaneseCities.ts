export interface CityOption {
  prefecture: string;
  name_en: string;
  name_ja: string;
  isPopularForExpats?: boolean;
}

export const JAPANESE_CITIES: CityOption[] = [
  // Tokyo Wards
  { prefecture: 'Tokyo', name_en: 'Edogawa Ward (Nishi-Kasai / Kasai)', name_ja: '東京都江戸川区（西葛西・葛西）', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Minato Ward (Roppongi / Mita / Akasaka)', name_ja: '東京都港区（六本木・三田・赤坂）', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Shinjuku Ward', name_ja: '東京都新宿区', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Shibuya Ward', name_ja: '東京都渋谷区', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Chuo Ward (Ginza / Tsukiji)', name_ja: '東京都中央区', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Chiyoda Ward', name_ja: '東京都千代田区', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Shinagawa Ward', name_ja: '東京都品川区', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Koto Ward (Toyosu / Kiba)', name_ja: '東京都江東区', isPopularForExpats: true },
  { prefecture: 'Tokyo', name_en: 'Ota Ward (Kamata / Omori)', name_ja: '東京都大田区' },
  { prefecture: 'Tokyo', name_en: 'Setagaya Ward', name_ja: '東京都世田谷区' },
  { prefecture: 'Tokyo', name_en: 'Meguro Ward', name_ja: '東京都目黒区' },
  { prefecture: 'Tokyo', name_en: 'Toshima Ward (Ikebukuro)', name_ja: '東京都豊島区' },
  { prefecture: 'Tokyo', name_en: 'Bunkyo Ward', name_ja: '東京都文京区' },

  // Kanagawa
  { prefecture: 'Kanagawa', name_en: 'Yokohama (Naka / Nishi / Kohoku)', name_ja: '神奈川県横浜市', isPopularForExpats: true },
  { prefecture: 'Kanagawa', name_en: 'Kawasaki', name_ja: '神奈川県川崎市', isPopularForExpats: true },

  // Saitama & Chiba
  { prefecture: 'Saitama', name_en: 'Saitama City / Kawaguchi', name_ja: '埼玉県さいたま市・川口市' },
  { prefecture: 'Chiba', name_en: 'Chiba City / Funabashi / Urayasu', name_ja: '千葉県市川市・浦安市・船橋市' },

  // Kansai & Other Regions
  { prefecture: 'Osaka', name_en: 'Osaka City (Kita / Chuo / Naniwa)', name_ja: '大阪府大阪市', isPopularForExpats: true },
  { prefecture: 'Kyoto', name_en: 'Kyoto City', name_ja: '京都府京都市' },
  { prefecture: 'Hyogo', name_en: 'Kobe City', name_ja: '兵庫県神戸市' },
  { prefecture: 'Aichi', name_en: 'Nagoya City', name_ja: '愛知県名古屋市' },
  { prefecture: 'Fukuoka', name_en: 'Fukuoka City (Hakata / Tenjin)', name_ja: '福岡県福岡市', isPopularForExpats: true },
  { prefecture: 'Miyagi', name_en: 'Sendai City', name_ja: '宮城県仙台市' }
];

export const NATIONALITIES = [
  'India',
  'United States',
  'United Kingdom',
  'Japan',
  'Philippines',
  'Vietnam',
  'China',
  'Nepal',
  'Brazil',
  'Indonesia',
  'Canada',
  'Australia',
  'Other'
];

export const LANGUAGES_LIST = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'tl', label: 'Tagalog', native: 'Tagalog' }
];

export const INSURANCE_OPTIONS = [
  { id: 'nhi', label: 'National Health Insurance (国民健康保険 / Kokumin Kenko Hoken)', copay: '30%' },
  { id: 'shia', label: 'Social Employee Health Insurance (社会保険 / Shakai Hoken)', copay: '30%' },
  { id: 'travel', label: 'Overseas Travel / Private International Insurance', copay: 'Varies / Reimbursement' },
  { id: 'none', label: 'No Japanese Health Insurance (100% Out of pocket)', copay: '100%' }
];

export const CONSTRAINT_OPTIONS = [
  { id: 'no_car', label: 'No car (Subway / Walk / Bus transit only)', icon: 'Train' },
  { id: 'tight_budget', label: 'Cost-sensitive / Prefer standard NHI clinics (avoid extra fees)', icon: 'BadgePercent' },
  { id: 'limited_time', label: 'Limited time off (Needs evening or Saturday morning hours)', icon: 'Clock' },
  { id: 'english_mandatory', label: 'English speaking physician or reception required', icon: 'Languages' },
  { id: 'female_doctor', label: 'Female physician preferred (for OB/GYN or internal)', icon: 'UserCheck' },
  { id: 'vegetarian', label: 'Vegetarian / Halal dietary needs for inpatient or iv drip check', icon: 'Leaf' }
];
