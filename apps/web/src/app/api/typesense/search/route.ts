import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Server-side proxy to Typesense. Keeps the API key secret.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const q = body.q || '';
    const page = Number(body.page || 1);
    const per_page = Number(body.per_page || 10);

    if (!process.env.TYPESENSE_API_KEY) {
      return NextResponse.json({ error: 'TYPESENSE_API_KEY is not set' }, { status: 500 });
    }

    const searchPayload = {
      q,
      query_by: 'descricao_comercial,produto_base_nome,produto_base_codigo',
      per_page,
      page
    };

    const url = `http://localhost:8108/collections/conjuntos/documents/search`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TYPESENSE-API-KEY': process.env.TYPESENSE_API_KEY
      },
      body: JSON.stringify(searchPayload)
    });

    const payload = await res.json();
    return NextResponse.json(payload, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
