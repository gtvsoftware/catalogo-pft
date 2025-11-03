"use client";

import React, { useEffect, useState, useRef } from 'react';

type Hit = {
  id: string;
  descricao_comercial?: string;
  produto_base_nome?: string;
  cor?: string;
  preco_venda_sugerido?: number;
};

export default function TypesenseTestPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // focus input on first render
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Debounce search so typing doesn't trigger too many requests
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!query) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceRef.current = window.setTimeout(() => {
      void doSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function doSearch(q: string) {
    try {
      const res = await fetch('/api/typesense/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erro na busca');
      }

      const payload = await res.json();
      // payload.hits expected
      const hits = (payload.hits || []).map((h: any) => h.document);
      setResults(hits);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || String(err));
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Inter, Arial, sans-serif' }}>
      <h1>Teste Typesense</h1>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="search" style={{ display: 'block', marginBottom: 6 }}>
          Buscar produtos
        </label>
        <input
          id="search"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Digite aqui... ex: 'rosa', 'white fusion'"
          style={{ width: '100%', padding: '8px 10px', fontSize: 16 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => void doSearch(query)}
          disabled={loading || !query}
          style={{ marginRight: 8 }}>
          {loading ? 'Buscando...' : 'Buscar agora'}
        </button>
        <button
          onClick={() => {
            setQuery('');
            setResults([]);
            inputRef.current?.focus();
          }}>
          Limpar
        </button>
      </div>

      {error && (
        <div style={{ color: 'crimson', marginBottom: 12 }}>
          Erro: {error}
        </div>
      )}

      <div>
        <h2>Resultados ({results.length})</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {results.map((r) => (
            <li key={r.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              <div style={{ fontWeight: 600 }}>{r.descricao_comercial}</div>
              <div style={{ fontSize: 13, color: '#666' }}>
                {r.produto_base_nome} • {r.cor || '—'} • R$ {r.preco_venda_sugerido ?? '—'}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 20, fontSize: 13, color: '#666' }}>
        Dica: este componente é um "client component" e mantém foco do input enquanto você digita.
        Se a tela estiver sendo remontada, verifique se você não está atualizando parâmetros de rota ou re-renderizando o layout do servidor.
      </div>
    </div>
  );
}
