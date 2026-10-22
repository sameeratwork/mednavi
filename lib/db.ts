import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

declare global {
  var prisma: PrismaClient | undefined;
}

const databaseUrl = process.env.DATABASE_URL;
const isConfiguredPostgres = Boolean(
  databaseUrl && 
  !databaseUrl.includes('placeholder') && 
  !databaseUrl.includes('password@localhost')
);

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// ─── English → Japanese ward name map (all 23 special wards of Tokyo) ────────
const WARD_EN_TO_JA: Record<string, string> = {
  chiyoda:   '千代田区',
  chuo:      '中央区',
  minato:    '港区',
  shinjuku:  '新宿区',
  bunkyo:    '文京区',
  taito:     '台東区',
  sumida:    '墨田区',
  koto:      '江東区',
  shinagawa: '品川区',
  meguro:    '目黒区',
  ota:       '大田区',
  setagaya:  '世田谷区',
  shibuya:   '渋谷区',
  nakano:    '中野区',
  suginami:  '杉並区',
  toshima:   '豊島区',
  kita:      '北区',
  arakawa:   '荒川区',
  itabashi:  '板橋区',
  nerima:    '練馬区',
  adachi:    '足立区',
  katsushika:'葛飾区',
  edogawa:   '江戸川区',
};

/** Normalize full-width alphanumerics / spaces to half-width, then trim. */
function normalizeQuery(raw: string): string {
  return raw
    // Full-width alphanumeric → half-width  (U+FF01–U+FF5E → U+0021–U+007E)
    .replace(/[\uff01-\uff5e]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    )
    // Full-width space → ASCII space
    .replace(/\u3000/g, ' ')
    .trim();
}

/** If the query matches an English ward name, return the Japanese equivalent. */
function resolveWardName(q: string): string | null {
  const lower = q.toLowerCase();
  // Exact match first
  if (WARD_EN_TO_JA[lower]) return WARD_EN_TO_JA[lower];
  // Partial match (e.g. "nerima ward" or "Setagaya-ku")
  for (const [en, ja] of Object.entries(WARD_EN_TO_JA)) {
    if (lower.includes(en)) return ja;
  }
  return null;
}

// ─── In-memory / JSON store fallback ─────────────────────────────────────────
class LocalDbFallback {
  private clinicsCache: any[] | null = null;
  private usersStore: Map<string, any> = new Map();
  private visitPlansStore: Map<string, any> = new Map();
  private medicalRecordsStore: Map<string, any> = new Map();

  constructor() {
    this.loadClinics();
  }

  private loadClinics() {
    try {
      const cachePath = path.join(process.cwd(), 'data', 'seeded_clinics_cache.json');
      const rawPath = path.join(process.cwd(), 'data', 'tokyo_medical_institutions.json');
      
      let filePath = fs.existsSync(cachePath) ? cachePath : rawPath;
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        this.clinicsCache = JSON.parse(content);
      }
    } catch (e) {
      console.warn('Fallback DB: could not load clinics JSON', e);
      this.clinicsCache = [];
    }
  }

  async getClinics(filters?: {
    type?: string;
    language?: string;
    specialty?: string;
    query?: string;
    city?: string;
    ward?: string;
    limit?: number;
    page?: number;
  }): Promise<{ clinics: any[]; total: number }> {
    if (!this.clinicsCache || this.clinicsCache.length === 0) {
      this.loadClinics();
    }
    let list = this.clinicsCache || [];

    if (filters?.type && filters.type !== 'all') {
      list = list.filter((c) => c.type?.toLowerCase() === filters.type?.toLowerCase());
    }

    const wardVal = filters?.ward || filters?.city;
    if (wardVal && wardVal !== 'all') {
      const w = wardVal.toLowerCase();
      list = list.filter(
        (c) => c.ward?.toLowerCase().includes(w) || c.address?.toLowerCase().includes(w)
      );
    }

    if (filters?.language && filters.language !== 'all') {
      list = list.filter((c) => {
        const langs: string[] = Array.isArray(c.languages_supported) ? c.languages_supported : [];
        return langs.includes(filters.language!);
      });
    }

    if (filters?.specialty && filters.specialty !== 'all') {
      list = list.filter((c) => {
        const specs: string[] = Array.isArray(c.specialties) ? c.specialties : [];
        const depts: string[] = Array.isArray(c.departments) ? c.departments : [];
        const combined = [...specs, ...depts];
        return combined.some((s) => s.toLowerCase().includes(filters.specialty!.toLowerCase()));
      });
    }

    if (filters?.query) {
      const q = normalizeQuery(filters.query).toLowerCase();
      const jaWard = resolveWardName(q);

      list = list.filter((c) => {
        const nameJa = (c.name_ja || '').toLowerCase();
        const nameEn = (c.name_en || '').toLowerCase();
        const addr   = (c.address || '').toLowerCase();
        const ward   = (c.ward || '').toLowerCase();
        const depts  = JSON.stringify(c.departments || []).toLowerCase();

        if (nameJa.includes(q) || nameEn.includes(q) || addr.includes(q) || ward.includes(q) || depts.includes(q)) {
          return true;
        }

        // Check Japanese ward match for English query
        if (jaWard) {
          const jaWardLower = jaWard.toLowerCase();
          if (ward.includes(jaWardLower) || addr.includes(jaWardLower)) {
            return true;
          }
        }

        return false;
      });
    }

    const total = list.length;
    const limit = filters?.limit ? Math.min(Math.max(filters.limit, 1), 100) : 100;
    const page = filters?.page ? Math.max(filters.page, 1) : 1;
    const offset = (page - 1) * limit;
    const clinics = list.slice(offset, offset + limit);

    return { clinics, total };
  }

  async getClinicById(id: string) {
    if (!this.clinicsCache) this.loadClinics();
    return (this.clinicsCache || []).find((c) => c.id === id) || null;
  }

  async saveUser(user: any) {
    const id = user.id || `user_${Date.now()}`;
    const updated = { ...user, id, updatedAt: new Date().toISOString() };
    this.usersStore.set(id, updated);
    return updated;
  }

  async getUser(id: string) {
    return this.usersStore.get(id) || null;
  }

  async saveVisitPlan(plan: any) {
    const id = plan.id || `plan_${Date.now()}`;
    const newPlan = { ...plan, id, createdAt: new Date().toISOString() };
    this.visitPlansStore.set(id, newPlan);
    return newPlan;
  }

  async getVisitPlan(id: string) {
    return this.visitPlansStore.get(id) || null;
  }

  async saveMedicalRecord(record: any) {
    const id = record.id || `rec_${Date.now()}`;
    const newRecord = { ...record, id, createdAt: new Date().toISOString() };
    this.medicalRecordsStore.set(id, newRecord);
    return newRecord;
  }

  async getMedicalRecords(userId?: string) {
    const records = Array.from(this.medicalRecordsStore.values());
    if (userId) {
      return records.filter((r) => r.userId === userId);
    }
    return records;
  }
}

export const localDb = new LocalDbFallback();

export const dbService = {
  isPostgresReady: isConfiguredPostgres,

  async getClinics(filters?: {
    type?: string;
    language?: string;
    specialty?: string;
    query?: string;
    city?: string;
    ward?: string;
    limit?: number;
    page?: number;
  }): Promise<{ clinics: any[]; total: number }> {
    if (isConfiguredPostgres) {
      try {
        const limit = filters?.limit ? Math.min(Math.max(filters.limit, 1), 100) : 100;
        const page = filters?.page ? Math.max(filters.page, 1) : 1;
        const offset = (page - 1) * limit;

        // ── Build WHERE conditions ──────────────────────────────────
        const whereClauses: string[] = [];
        const params: any[] = [];
        let paramIdx = 1;

        // Type filter
        if (filters?.type && filters.type !== 'all') {
          whereClauses.push(`"type" = $${paramIdx}`);
          params.push(filters.type);
          paramIdx++;
        }

        // Ward / city filter
        const wardVal = filters?.ward || filters?.city;
        if (wardVal && wardVal !== 'all') {
          whereClauses.push(`("ward" ILIKE $${paramIdx} OR "address" ILIKE $${paramIdx})`);
          params.push(`%${wardVal}%`);
          paramIdx++;
        }

        // Language filter (languages_supported is a JSON array)
        if (filters?.language && filters.language !== 'all') {
          whereClauses.push(`"languages_supported"::text ILIKE $${paramIdx}`);
          params.push(`%${filters.language}%`);
          paramIdx++;
        }

        // Specialty filter (specialties and departments are JSON arrays)
        if (filters?.specialty && filters.specialty !== 'all') {
          whereClauses.push(
            `("specialties"::text ILIKE $${paramIdx} OR "departments"::text ILIKE $${paramIdx})`
          );
          params.push(`%${filters.specialty}%`);
          paramIdx++;
        }

        // Free-text search query
        if (filters?.query) {
          const q = normalizeQuery(filters.query);
          const jaWard = resolveWardName(q);

          // Build OR clauses for the search term
          const orParts: string[] = [
            `"name_ja" ILIKE $${paramIdx}`,
            `"name_en" ILIKE $${paramIdx}`,
            `"address" ILIKE $${paramIdx}`,
            `"ward" ILIKE $${paramIdx}`,
            `"departments"::text ILIKE $${paramIdx}`,
          ];
          params.push(`%${q}%`);
          paramIdx++;

          // If the query maps to a Japanese ward, also match on that
          if (jaWard) {
            orParts.push(`"ward" ILIKE $${paramIdx}`);
            orParts.push(`"address" ILIKE $${paramIdx}`);
            params.push(`%${jaWard}%`);
            paramIdx++;
          }

          whereClauses.push(`(${orParts.join(' OR ')})`);
        }

        const whereSQL = whereClauses.length > 0
          ? `WHERE ${whereClauses.join(' AND ')}`
          : '';

        // ── Count total matches ─────────────────────────────────────
        const countResult = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
          `SELECT COUNT(*) AS total FROM "Clinic" ${whereSQL}`,
          ...params
        );
        const total = Number(countResult[0]?.total ?? 0);

        // ── Fetch paginated results ─────────────────────────────────
        const clinics = await prisma.$queryRawUnsafe(
          `SELECT * FROM "Clinic" ${whereSQL}
           ORDER BY "type" DESC, "name_ja" ASC
           LIMIT ${limit} OFFSET ${offset}`,
          ...params
        );

        return { clinics: clinics as any[], total };
      } catch (e) {
        console.warn('Prisma query failed, utilizing resilient cache:', e);
      }
    }
    return localDb.getClinics(filters);
  },

  async getClinicById(id: string) {
    if (isConfiguredPostgres) {
      try {
        const clinic = await prisma.clinic.findUnique({ where: { id } });
        if (clinic) return clinic;
      } catch (e) {
        console.warn('Prisma findUnique failed, using fallback:', e);
      }
    }
    return localDb.getClinicById(id);
  },

  async saveUser(userData: any) {
    if (isConfiguredPostgres) {
      try {
        return await prisma.user.upsert({
          where: { email: userData.email || 'demo@mednavi.jp' },
          create: userData,
          update: userData,
        });
      } catch (e) {
        console.warn('Prisma saveUser failed, using fallback:', e);
      }
    }
    return localDb.saveUser(userData);
  },

  async saveVisitPlan(planData: any) {
    if (isConfiguredPostgres) {
      try {
        return await prisma.visitPlan.create({ data: planData });
      } catch (e) {
        console.warn('Prisma saveVisitPlan failed, using fallback:', e);
      }
    }
    return localDb.saveVisitPlan(planData);
  },

  async saveMedicalRecord(recordData: any) {
    if (isConfiguredPostgres) {
      try {
        return await prisma.medicalRecord.create({ data: recordData });
      } catch (e) {
        console.warn('Prisma saveMedicalRecord failed, using fallback:', e);
      }
    }
    return localDb.saveMedicalRecord(recordData);
  }
};
