'use client';

import { useState } from 'react';

// Definindo o que um "Livro" tem
interface Livro {
  titulo: string;
  capa: string;
  link: string;
}

export default function Home() {
  const [busca, setBusca] = useState('');
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(false);

  async function buscarLivros() {
    if (!busca) return;
    setCarregando(true);
    setLivros([]); // Limpa a lista anterior

    try {
      // 1. Pergunta para a SUA API (Gemini)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: busca }),
      });

      const nomes = await response.json();

      // 2. Para cada nome, busca os detalhes no Google Books
      if (Array.isArray(nomes)) {
        const promessas = nomes.map(async (nome: string) => {
          const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(nome)}&maxResults=1`);

          const data = await res.json();
          const info = data.items?.[0]?.volumeInfo;

          return {
            titulo: nome,
            capa: info?.imageLinks?.thumbnail || 'https://placeholder.com',
            link: info?.infoLink || '#'
          };
        });

        const resultados = await Promise.all(promessas);
        setLivros(resultados);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans">
      <section className="max-w-4xl mx-auto text-center mb-16 mt-10">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Lumen
        </h1>
        <p className="text-slate-400 text-lg">Sua bússola literária guiada por IA.</p>
      </section>

      <section className="max-w-2xl mx-auto mb-12 text-black">
        <div className="flex gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-blue-500 transition-all shadow-xl">
          <input
            type="text"
            placeholder="Ex: Um livro de mistério com reviravoltas..."
            className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-slate-200"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button
            onClick={buscarLivros}
            disabled={carregando}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer"
          >
            {carregando ? 'Buscando...' : 'Descobrir'}
          </button>
        </div>
      </section>

      {/* Grid de Cards com Capas */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {livros.map((livro, index) => (
          <a
            key={index}
            href={livro.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg hover:border-blue-500 transition-all flex flex-col items-center text-center cursor-pointer"
          >
            <img
              src={livro.capa}
              alt={livro.titulo}
              className="w-40 h-56 object-cover rounded-lg mb-4 shadow-md group-hover:scale-105 transition-transform"
            />
            <h3 className="text-lg font-bold text-blue-400 group-hover:text-blue-300">{livro.titulo}</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Clique para ver detalhes →</p>
          </a>
        ))}
      </section>
    </main>
  );
}
