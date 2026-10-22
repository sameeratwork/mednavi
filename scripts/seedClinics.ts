import fs from 'fs';
import path from 'path';
import readline from 'readline';
import https from 'https';

// Load .env.local if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=')) {
        const val = trimmed.substring('DATABASE_URL='.length).replace(/^["']|["']$/g, '');
        process.env.DATABASE_URL = val;
      }
    }
  }
}

import { PrismaClient } from '@prisma/client';

let dbUrl = process.env.DATABASE_URL || '';
if (dbUrl && !dbUrl.includes('connection_limit')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'connection_limit=3';
}

const prisma = new PrismaClient(
  dbUrl ? { datasources: { db: { url: dbUrl } } } : undefined
);

// Configuration
const MHLW_DIR = path.join(process.cwd(), 'data', 'mhlw');
const REJECTED_CSV = path.join(MHLW_DIR, 'rejected.csv');
const GEOCODE_CACHE_FILE = path.join(MHLW_DIR, 'geocode_cache.json');
const CLINIC_CACHE_FILE = path.join(process.cwd(), 'data', 'seeded_clinics_cache.json');

// Tokyo Municipality Definitions
const TOKYO_23_WARDS = [
  '千代田区', '中央区', '港区', '新宿区', '文京区', '台東区', '墨田区', '江東区',
  '品川区', '目黒区', '大田区', '世田谷区', '渋谷区', '中野区', '杉並区', '豊島区',
  '北区', '荒川区', '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区'
];

const TOKYO_TAMA_CITIES = [
  '八王子市', '立川市', '武蔵野市', '三鷹市', '青梅市', '府中市', '昭島市', '調布市',
  '町田市', '小金井市', '小平市', '日野市', '東村山市', '国分寺市', '国立市', '福生市',
  '狛江市', '東大和市', '清瀬市', '東久留米市', '武蔵村山市', '多摩市', '稲城市', '羽村市',
  'あきる野市', '西東京市'
];

const TOKYO_TOWNS_VILLAGES = [
  '西多摩郡瑞穂町', '瑞穂町',
  '西多摩郡日の出町', '日の出町',
  '西多摩郡檜原村', '檜原村',
  '西多摩郡奥多摩町', '奥多摩町',
  '大島町', '利島村', '新島村', '神津島村',
  '三宅島三宅村', '三宅村',
  '御蔵島村',
  '八丈島八丈町', '八丈町',
  '青ヶ島村', '小笠原村'
];

// Sort descending by length so longer names like 西多摩郡日の出町 match before 日の出町
const TOKYO_MUNICIPALITIES_SORTED = [
  ...TOKYO_23_WARDS,
  ...TOKYO_TAMA_CITIES,
  ...TOKYO_TOWNS_VILLAGES
].sort((a, b) => b.length - a.length);

// Extract ward or city from address
export function extractWardOrCity(address: string, prefectureCode: string): string | null {
  if (!address) return null;
  let s = address.trim();

  if (prefectureCode === '13' || s.startsWith('東京都')) {
    if (s.startsWith('東京都')) {
      s = s.substring(3);
    }
    for (const m of TOKYO_MUNICIPALITIES_SORTED) {
      if (s.startsWith(m)) {
        if (m.startsWith('西多摩郡')) return m.replace('西多摩郡', '');
        if (m.startsWith('八丈島')) return m.replace('八丈島', '');
        if (m.startsWith('三宅島')) return m.replace('三宅島', '');
        return m;
      }
    }
    return null;
  }

  // General Japan municipality extraction for other prefectures
  const match = s.match(/^(?:.*?県|.*?府|.*?道)?([^0-9０-９一二三四五六七八九十\-ー]+?[市区町村])/);
  if (match) {
    let part = match[1];
    // Remove prefecture prefix if captured
    part = part.replace(/^.*?([市区町村])$/, '$1');
    return part;
  }
  return null;
}

// Simple RFC 4180-compliant CSV line parser
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ',') {
        result.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
  }
  result.push(cur);
  return result;
}

// In-memory Geocoding Cache with disk persistence
class GeocodeManager {
  private cache: Record<string, { lat: number | null; lng: number | null; error?: string }> = {};

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      if (fs.existsSync(GEOCODE_CACHE_FILE)) {
        const raw = fs.readFileSync(GEOCODE_CACHE_FILE, 'utf-8');
        this.cache = JSON.parse(raw);
      }
    } catch (e) {
      this.cache = {};
    }
  }

  saveCache() {
    try {
      fs.writeFileSync(GEOCODE_CACHE_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to save geocode cache to disk:', e);
    }
  }

  async geocode(address: string): Promise<{ lat: number | null; lng: number | null }> {
    if (!address) return { lat: null, lng: null };
    if (this.cache[address]) {
      return this.cache[address];
    }

    const queries = [address];
    const cleanNoSpace = address.split('　')[0].trim();
    if (cleanNoSpace !== address) queries.push(cleanNoSpace);

    // Try stripping building / floor after Japanese numbers
    const numMatch = cleanNoSpace.match(/^(.*?([0-9０-９一二三四五六七八九十]+(?:－|-|ー|丁目|番|号))+[0-9０-９一二三四五六七八九十番号]*)/);
    if (numMatch && numMatch[1] && !queries.includes(numMatch[1])) {
      queries.push(numMatch[1]);
    }

    for (const q of queries) {
      try {
        await new Promise((r) => setTimeout(r, 120)); // Polite throttle
        const url = `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(q)}`;
        const coords = await this.queryGsi(url);
        if (coords) {
          const res = { lat: coords[1], lng: coords[0] };
          this.cache[address] = res;
          this.saveCache();
          return res;
        }
      } catch (err) {
        // continue to next query variant
      }
    }

    const res = { lat: null, lng: null, error: 'not_found_on_gsi' };
    this.cache[address] = res;
    this.saveCache();
    return res;
  }

  private queryGsi(url: string): Promise<[number, number] | null> {
    return new Promise((resolve) => {
      const req = https.get(
        url,
        {
          headers: {
            'User-Agent': 'MedNavi/1.0 (Japanese Healthcare OpenData Importer; contact@mednavi.jp)',
          },
          timeout: 6000,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (Array.isArray(data) && data.length > 0 && data[0]?.geometry?.coordinates) {
                resolve(data[0].geometry.coordinates);
              } else {
                resolve(null);
              }
            } catch {
              resolve(null);
            }
          });
        }
      );
      req.on('error', () => resolve(null));
      req.on('timeout', () => {
        req.destroy();
        resolve(null);
      });
    });
  }
}

// Rejection logger
class RejectionLogger {
  private count = 0;

  constructor() {
    fs.mkdirSync(MHLW_DIR, { recursive: true });
    fs.writeFileSync(REJECTED_CSV, 'sourceId,name_ja,address,reason,timestamp\n', 'utf-8');
  }

  log(sourceId: string, name_ja: string, address: string, reason: string) {
    this.count++;
    const line = `"${sourceId.replace(/"/g, '""')}","${(name_ja || '').replace(/"/g, '""')}","${(address || '').replace(/"/g, '""')}","${reason.replace(/"/g, '""')}","${new Date().toISOString()}"\n`;
    fs.appendFileSync(REJECTED_CSV, line, 'utf-8');
  }

  getCount(): number {
    return this.count;
  }
}

interface FacilityHoursInfo {
  departments: Set<string>;
  consultationSchedule: Record<string, string[]>;
  closedDaysSummary: string[];
}

// Load hours and departments file for a category
async function loadDepartmentsAndHours(filePath: string, targetPrefectureCode: string | null): Promise<Map<string, FacilityHoursInfo>> {
  const result = new Map<string, FacilityHoursInfo>();
  if (!fs.existsSync(filePath)) {
    console.warn(`Hours file missing at: ${filePath}`);
    return result;
  }

  console.log(`⏳ Streaming departments and consultation hours from: ${path.basename(filePath)}...`);
  const fileStream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let headerIndices: Record<string, number> = {};
  let lineCount = 0;

  for await (const line of rl) {
    lineCount++;
    const cleanLine = lineCount === 1 ? line.replace(/^\uFEFF/, '') : line;
    if (!cleanLine.trim()) continue;

    const row = parseCsvLine(cleanLine);
    if (lineCount === 1) {
      row.forEach((col, idx) => {
        headerIndices[col.trim()] = idx;
      });
      continue;
    }

    const id = row[headerIndices['ID']]?.trim();
    if (!id) continue;

    // Filter by prefecture if specified (MHLW IDs begin with prefecture code)
    if (targetPrefectureCode && !id.startsWith(targetPrefectureCode)) {
      continue;
    }

    const deptName = row[headerIndices['診療科目名']]?.trim();
    let info = result.get(id);
    if (!info) {
      info = {
        departments: new Set<string>(),
        consultationSchedule: {
          mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [], holidays: []
        },
        closedDaysSummary: []
      };
      result.set(id, info);
    }

    if (deptName) {
      info.departments.add(deptName);
    }

    // Capture consultation hours
    const days = [
      { key: 'mon', start: '月_診療開始時間', end: '月_診療終了時間' },
      { key: 'tue', start: '火_診療開始時間', end: '火_診療終了時間' },
      { key: 'wed', start: '水_診療開始時間', end: '水_診療終了時間' },
      { key: 'thu', start: '木_診療開始時間', end: '木_診療終了時間' },
      { key: 'fri', start: '金_診療開始時間', end: '金_診療終了時間' },
      { key: 'sat', start: '土_診療開始時間', end: '土_診療終了時間' },
      { key: 'sun', start: '日_診療開始時間', end: '日_診療終了時間' },
      { key: 'holidays', start: '祝_診療開始時間', end: '祝_診療終了時間' },
    ];

    for (const d of days) {
      const s = row[headerIndices[d.start]]?.trim();
      const e = row[headerIndices[d.end]]?.trim();
      if (s && e) {
        const span = `${s} - ${e}`;
        if (!info.consultationSchedule[d.key].includes(span)) {
          info.consultationSchedule[d.key].push(span);
        }
      }
    }
  }

  console.log(`✅ Loaded hours and departments for ${result.size} institutions.`);
  return result;
}

export async function seedClinics() {
  const args = process.argv.slice(2);
  const prefArgIdx = args.indexOf('--prefecture');
  let targetPref = 'Tokyo';
  if (prefArgIdx !== -1 && args[prefArgIdx + 1]) {
    targetPref = args[prefArgIdx + 1];
  } else if (args.includes('--all')) {
    targetPref = 'all';
  }

  const isAll = targetPref.toLowerCase() === 'all';
  const targetCode = isAll ? null : (targetPref === 'Tokyo' || targetPref === '東京都' || targetPref === '13' ? '13' : targetPref);

  const batchSizeIdx = args.indexOf('--batch-size');
  const batchSize = batchSizeIdx !== -1 && args[batchSizeIdx + 1] ? parseInt(args[batchSizeIdx + 1], 10) : 100;
  const isDryRun = args.includes('--dry-run');

  console.log(`\n======================================================`);
  console.log(`🏥 MedNavi MHLW Open Data Seeder`);
  console.log(`🎯 Target: ${isAll ? 'ALL JAPAN' : `Prefecture ${targetPref} (Code: ${targetCode})`}`);
  console.log(`📦 Batch Size: ${batchSize}`);
  console.log(`🧪 Mode: ${isDryRun ? 'DRY RUN (No DB Write)' : 'LIVE DATABASE INGESTION'}`);
  console.log(`======================================================\n`);

  // Detect snapshot files in data/mhlw/
  const files = fs.readdirSync(MHLW_DIR);
  const hospFacFile = files.find((f) => f.startsWith('01-1_hospital_facility_info') && f.endsWith('.csv'));
  const hospHoursFile = files.find((f) => f.startsWith('01-2_hospital_speciality_hours') && f.endsWith('.csv'));
  const clinicFacFile = files.find((f) => f.startsWith('02-1_clinic_facility_info') && f.endsWith('.csv'));
  const clinicHoursFile = files.find((f) => f.startsWith('02-2_clinic_speciality_hours') && f.endsWith('.csv'));
  const dentalFacFile = files.find((f) => f.startsWith('03-1_dental_facility_info') && f.endsWith('.csv'));
  const dentalHoursFile = files.find((f) => f.startsWith('03-2_dental_speciality_hours') && f.endsWith('.csv'));

  if (!hospFacFile || !hospHoursFile || !clinicFacFile || !clinicHoursFile || !dentalFacFile || !dentalHoursFile) {
    throw new Error(`Required MHLW CSV files missing in ${MHLW_DIR}. Run Step 1 download first.`);
  }

  // Extract snapshot date from filename e.g. 20260601 -> 2026-06-01
  const dateMatch = hospFacFile.match(/_(\d{4})(\d{2})(\d{2})\.csv$/);
  const snapshotDate = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '2026-06-01';
  console.log(`📅 MHLW Snapshot Date: ${snapshotDate}`);

  const geocoder = new GeocodeManager();
  const rejectionLogger = new RejectionLogger();

  const categories = [
    { type: 'hospital', facFile: hospFacFile, hoursFile: hospHoursFile },
    { type: 'clinic', facFile: clinicFacFile, hoursFile: clinicHoursFile },
    { type: 'dental', facFile: dentalFacFile, hoursFile: dentalHoursFile },
  ];

  const allProcessedClinics: any[] = [];
  let totalImported = 0;
  let totalUpdated = 0;

  for (const cat of categories) {
    console.log(`\n------------------------------------------------------`);
    console.log(`🏥 Processing Category: ${cat.type.toUpperCase()}`);
    console.log(`------------------------------------------------------`);

    const hoursMap = await loadDepartmentsAndHours(path.join(MHLW_DIR, cat.hoursFile), targetCode);
    const facPath = path.join(MHLW_DIR, cat.facFile);

    const fileStream = fs.createReadStream(facPath, { encoding: 'utf-8' });
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headerIndices: Record<string, number> = {};
    let lineCount = 0;
    let batch: any[] = [];

    for await (const line of rl) {
      lineCount++;
      const cleanLine = lineCount === 1 ? line.replace(/^\uFEFF/, '') : line;
      if (!cleanLine.trim()) continue;

      const row = parseCsvLine(cleanLine);
      if (lineCount === 1) {
        row.forEach((col, idx) => {
          headerIndices[col.trim()] = idx;
        });
        continue;
      }

      const id = row[headerIndices['ID']]?.trim();
      const nameJa = row[headerIndices['正式名称']]?.trim() || row[headerIndices['略称']]?.trim();
      const nameEn = row[headerIndices['英語表記（ローマ字表記）']]?.trim() || null;
      const prefCode = row[headerIndices['都道府県コード']]?.trim();
      const address = row[headerIndices['所在地']]?.trim();
      const website = row[headerIndices['案内用ホームページアドレス']]?.trim() || null;

      // Validate mandatory fields
      if (!id || !nameJa || !address) {
        rejectionLogger.log(id || 'UNKNOWN', nameJa || 'UNKNOWN', address || 'UNKNOWN', 'Missing ID, name or address');
        continue;
      }

      // Filter by target prefecture
      if (targetCode && prefCode !== targetCode) {
        continue;
      }

      // Extract Ward / City
      const ward = extractWardOrCity(address, prefCode);
      if (!ward && (prefCode === '13' || address.includes('東京都'))) {
        rejectionLogger.log(id, nameJa, address, 'Failed to extract Tokyo ward or city');
        continue;
      }

      // Coordinates
      let latStr = row[headerIndices['所在地座標（緯度）']]?.trim();
      let lngStr = row[headerIndices['所在地座標（経度）']]?.trim();
      let lat: number | null = latStr && latStr !== '0.0' && latStr !== '0' ? parseFloat(latStr) : null;
      let lng: number | null = lngStr && lngStr !== '0.0' && lngStr !== '0' ? parseFloat(lngStr) : null;

      if ((lat === null || lng === null || isNaN(lat) || isNaN(lng)) && address) {
        const geo = await geocoder.geocode(address);
        lat = geo.lat;
        lng = geo.lng;
      }

      // Specialities & Departments
      const hoursInfo = hoursMap.get(id);
      const depts = hoursInfo ? Array.from(hoursInfo.departments) : [];

      // Opening hours summary
      const schedule = hoursInfo?.consultationSchedule || {};
      const formatDay = (slots?: string[]) => (slots && slots.length > 0 ? slots.join(', ') : 'Closed');
      const openingHours = {
        weekdays: formatDay(schedule.mon || schedule.tue || schedule.wed || schedule.thu || schedule.fri),
        monday: formatDay(schedule.mon),
        tuesday: formatDay(schedule.tue),
        wednesday: formatDay(schedule.wed),
        thursday: formatDay(schedule.thu),
        friday: formatDay(schedule.fri),
        saturday: formatDay(schedule.sat),
        sunday: formatDay(schedule.sun),
        holidays: formatDay(schedule.holidays),
      };

      const clinicRecord = {
        sourceId: id,
        name_ja: nameJa,
        name_en: nameEn,
        type: cat.type,
        prefecture: prefCode === '13' ? 'Tokyo' : prefCode,
        ward: ward,
        address: address,
        specialties: depts, // Map MHLW departments to specialties for UI filters
        departments: depts,
        phone: null, // MHLW Open Data facility sheet has no phone column; leave null
        website: website,
        lat: lat,
        lng: lng,
        latitude: lat,
        longitude: lng,
        insurance_accepted: true,
        languages_supported: ['unknown'], // Do not invent languages
        opening_hours: openingHours,
        consultation_hours: schedule,
        how_to_book: cat.type === 'hospital' ? 'Appointment or Referral' : 'Walk-in or Phone',
        foreign_friendly_notes: null,
        source: 'MHLW_OpenData',
        sourceSnapshotDate: snapshotDate,
        raw_data: {
          mhlw_id: id,
          institution_type: row[headerIndices['機関区分']] || cat.type,
          closed_holidays: row[headerIndices['祝日に休診']] || null,
          closed_other: row[headerIndices['その他の休診日（gw、お盆等）']] || null,
        },
      };

      batch.push(clinicRecord);
      allProcessedClinics.push(clinicRecord);

      if (batch.length >= batchSize) {
        if (!isDryRun) {
          const res = await upsertBatch(batch);
          totalImported += res.inserted;
          totalUpdated += res.updated;
          process.stdout.write(`\r💾 Ingested ${totalImported + totalUpdated} facilities...`);
        }
        batch = [];
      }
    }

    if (batch.length > 0 && !isDryRun) {
      const res = await upsertBatch(batch);
      totalImported += res.inserted;
      totalUpdated += res.updated;
      console.log(`\r💾 Completed ${cat.type}: ${totalImported + totalUpdated} facilities processed.`);
    }
  }

  // Update local resilient cache for zero-latency fallback
  if (targetCode === '13' || isAll) {
    console.log(`\n💾 Updating local JSON resilient fallback cache (${CLINIC_CACHE_FILE})...`);
    // Map with id for local JSON store
    const cacheData = allProcessedClinics.map((c, i) => ({
      id: `clinic_${c.sourceId || i}`,
      ...c,
    }));
    fs.writeFileSync(CLINIC_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
    console.log(`✅ Cached ${cacheData.length} facilities to local fallback cache.`);
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Ingestion Summary`);
  console.log(`======================================================`);
  console.log(`Total Facilities Processed: ${allProcessedClinics.length}`);
  console.log(`Database Upserted: ${totalImported + totalUpdated}`);
  console.log(`Rejected Rows: ${rejectionLogger.getCount()} (written to ${REJECTED_CSV})`);
  console.log(`======================================================\n`);
}

async function upsertBatch(batch: any[]): Promise<{ inserted: number; updated: number }> {
  if (batch.length === 0) return { inserted: 0, updated: 0 };

  const valuePlaceholders: string[] = [];
  const params: any[] = [];
  let pIdx = 1;

  for (const c of batch) {
    const id = `clinic_${c.sourceId}`;
    valuePlaceholders.push(`(
      $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
      $${pIdx++}::jsonb, $${pIdx++}::jsonb, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++},
      $${pIdx++}, $${pIdx++}::jsonb, $${pIdx++}::jsonb, $${pIdx++}::jsonb,
      $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}::jsonb,
      NOW(), NOW()
    )`);

    params.push(
      id,
      c.sourceId,
      c.name_ja,
      c.name_en,
      c.type,
      c.prefecture,
      c.ward,
      c.address,
      JSON.stringify(c.specialties || []),
      JSON.stringify(c.departments || []),
      c.phone || null,
      c.website || null,
      c.lat ?? null,
      c.lng ?? null,
      c.latitude ?? null,
      c.longitude ?? null,
      c.insurance_accepted ?? true,
      JSON.stringify(c.languages_supported || ['unknown']),
      JSON.stringify(c.opening_hours || {}),
      JSON.stringify(c.consultation_hours || {}),
      c.how_to_book || 'Walk-in or Phone',
      c.foreign_friendly_notes || null,
      c.source || 'MHLW_OpenData',
      c.sourceSnapshotDate || null,
      JSON.stringify(c.raw_data || {})
    );
  }

  const sql = `
    INSERT INTO "Clinic" (
      "id", "sourceId", "name_ja", "name_en", "type", "prefecture", "ward", "address",
      "specialties", "departments", "phone", "website", "lat", "lng", "latitude", "longitude",
      "insurance_accepted", "languages_supported", "opening_hours", "consultation_hours",
      "how_to_book", "foreign_friendly_notes", "source", "sourceSnapshotDate", "raw_data",
      "createdAt", "updatedAt"
    ) VALUES ${valuePlaceholders.join(', ')}
    ON CONFLICT ("sourceId") DO UPDATE SET
      "name_ja" = EXCLUDED."name_ja",
      "name_en" = EXCLUDED."name_en",
      "type" = EXCLUDED."type",
      "prefecture" = EXCLUDED."prefecture",
      "ward" = EXCLUDED."ward",
      "address" = EXCLUDED."address",
      "specialties" = EXCLUDED."specialties",
      "departments" = EXCLUDED."departments",
      "phone" = EXCLUDED."phone",
      "website" = EXCLUDED."website",
      "lat" = EXCLUDED."lat",
      "lng" = EXCLUDED."lng",
      "latitude" = EXCLUDED."latitude",
      "longitude" = EXCLUDED."longitude",
      "insurance_accepted" = EXCLUDED."insurance_accepted",
      "languages_supported" = EXCLUDED."languages_supported",
      "opening_hours" = EXCLUDED."opening_hours",
      "consultation_hours" = EXCLUDED."consultation_hours",
      "how_to_book" = EXCLUDED."how_to_book",
      "foreign_friendly_notes" = EXCLUDED."foreign_friendly_notes",
      "source" = EXCLUDED."source",
      "sourceSnapshotDate" = EXCLUDED."sourceSnapshotDate",
      "raw_data" = EXCLUDED."raw_data",
      "updatedAt" = NOW();
  `;

  try {
    const count = await prisma.$executeRawUnsafe(sql, ...params);
    return { inserted: count, updated: 0 };
  } catch (err: any) {
    console.warn(`Bulk upsert failed, falling back to sequential: ${err.message}`);
    let inserted = 0;
    for (const c of batch) {
      try {
        await prisma.clinic.upsert({
          where: { sourceId: c.sourceId },
          create: c,
          update: c,
        });
        inserted++;
      } catch (e: any) {
        console.warn(`Single upsert failed for ${c.sourceId}: ${e.message}`);
      }
    }
    return { inserted, updated: 0 };
  }
}

if (require.main === module) {
  seedClinics()
    .catch((err) => {
      console.error('Fatal error during clinic seed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
