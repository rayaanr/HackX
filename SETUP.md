# 🚀 HackX Database Setup Guide

## **Quick Team Setup (2 minutes)**

### \*\*1. Clone & Ins```typescript

// Import the clients you need
import { createClient } from '@/lib/supabase/client' // Browser client
import { createClient as createServerClient } from '@/lib/supabase/server' // Server client

// For client-side operations
const supabase = createClient()
const hackathons = await supabase.from('hackathons').select('\*')

// For server actions/API routes
const supabase = await createServerClient()
const result = await supabase.from('hackathons').insert(data)

```h
git clone <your-repo-url>
cd HackX
bun install
```

### **2. Create Supabase Project**

- Go to [supabase.com](https://supabase.com)
- Click "New Project"
- Choose name, region, and password

### **3. Setup Database Schema**

- Open your Supabase Dashboard → SQL Editor
- Copy the entire content of [`database-schema.sql`](../database-schema.sql)
- Paste and run it in the SQL Editor ✅

### **4. Configure Environment**

```bash
# Copy .env.example to .env and update with your values:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### **5. Start Development**

```bash
bun dev
```

---

## **🔧 Development Commands**

```bash
# Start development server
bun dev

# Generate/update TypeScript types from database
bun run db:types

# Quick database setup reminder
bun run db:setup

# Open Supabase dashboard
bun run db:studio
```

---

## **📋 Database Structure**

**Core Tables:**

- `hackathons` - Main hackathon data
- `prize_cohorts` - Prize categories and rules
- `evaluation_criteria` - Judging criteria per prize
- `judges` - Judge management and status
- `speakers` - Speaker information
- `schedule_slots` - Event schedule with speakers

**Key Features:**

- ✅ Full TypeScript support
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps
- ✅ Foreign key relationships
- ✅ Enum constraints for data integrity

---

## **💾 Making Database Changes**

1. **Update the live database** (Supabase Dashboard → SQL Editor)
2. **Regenerate types**: `bun run db:types`
3. **Update [`database-schema.sql`](../database-schema.sql)** so teammates get the changes
4. **Commit everything** to git

---

## **🔗 Import Usage**

```typescript
// Import the typed client
import { supabase, db } from "@/lib/supabase-client";

// Query with full TypeScript support
const hackathons = await db.hackathons.findMany({ limit: 10 });
const hackathon = await db.hackathons.findWithRelations("hackathon-id");

// Or use the raw client for custom queries
const { data } = await supabase
  .from("hackathons")
  .select("*")
  .eq("id", hackathonId);
```

**Perfect for team collaboration! 🎉**
