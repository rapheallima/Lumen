import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        // Verifica se a chave existe
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Chave de API não configurada" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        // Se o de cima falhar, tente: "gemini-pro"


        const instrucao = `Você é um bibliotecário. O usuário busca: "${prompt}". 
    Sugira 3 livros. Retorne APENAS um array JSON puro, sem markdown, sem explicações, exatamente assim: ["Livro A", "Livro B", "Livro C"]`;

        const result = await model.generateContent(instrucao);
        const response = await result.response;
        let text = response.text().trim();

        // Limpeza extra para garantir que seja um JSON válido
        // Remove possíveis blocos de código markdown que a IA às vezes insere
        text = text.replace(/```json|```/g, "").trim();

        console.log("Resposta da IA:", text); // Isso aparece no seu terminal (VS Code)

        const nomesDosLivros = JSON.parse(text);
        return NextResponse.json(nomesDosLivros);

    } catch (error) {
        console.error("Erro na API:", error);
        return NextResponse.json({ error: "Falha ao processar IA" }, { status: 500 });
    }
}
