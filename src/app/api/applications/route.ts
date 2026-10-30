import postgres from "postgres";

// Prisma Postgres also has a pooled URL, which suits serverless hosting like Vercel.
const sql = postgres(process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL!, { ssl: "require" });

// The whole list is stored as a single JSON row since there's only one user.
const ROW_ID = "default";

async function ensureTable() {
  await sql`create table if not exists app_data (id text primary key, data jsonb not null)`;
}

export async function GET() {
  await ensureTable();
  const rows = await sql`select data from app_data where id = ${ROW_ID}`;
  return Response.json(rows[0]?.data ?? []);
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body)) {
    return Response.json({ error: "Expected a list of applications" }, { status: 400 });
  }
  await ensureTable();
  await sql`
    insert into app_data (id, data) values (${ROW_ID}, ${JSON.stringify(body)}::jsonb)
    on conflict (id) do update set data = excluded.data
  `;
  return Response.json({ ok: true });
}
