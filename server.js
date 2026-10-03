const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/analisar', upload.single('imagem'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ erro: "Enviar um print é obrigatório!" });
        }

        const contextoAdicional = req.body.contexto || "Nenhum contexto adicional fornecido.";

        // Atualize para o modelo atual e estável:
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

        const prompt = `
        Você é um assistente focado em ajudar brasileiros a responder conversas (WhatsApp, Instagram, Tinder) de forma extremamente natural, informal e espontânea.
        
        Contexto adicional do usuário: "${contextoAdicional}"
        
        INSTRUÇÕES DE ANÁLISE:
        1. Analise a imagem anexada. 
        2. Se a imagem não for um print de conversa ou estiver ilegível, retorne um JSON com a chave "erro": "Print ilegível ou inválido. Envie um print nítido de uma conversa."
        
        REGRAS RÍGIDAS DE ESTILO DAS RESPOSTAS:
        - PROIBIDO usar linguagem formal, pontuação perfeita ou frases longas.
        - PROIBIDO usar chavões de robô/IA como "Fico feliz", "Com certeza", "Entendo perfeitamente".
        - Use linguagem informal brasileira real: gírias comuns e abreviações (kkk, vc, tb, tô, bora, né, pô).
        - Imite a digitação rápida de um brasileiro no celular (letras minúsculas no início, pequenas imperfeições).
        - Gere 4 opções de resposta adequadas ao tom da conversa.

        FORMATO DE SAÍDA EXIGIDO (Retorne APENAS o JSON puro):
        {
            "resumo": "Análise direta de 1 frase sobre o momento da conversa.",
            "sugestoes": [
                { "categoria": "Natural", "texto": "sugestao aqui", "icone": "fa-leaf" },
                { "categoria": "Confiante", "texto": "sugestao aqui", "icone": "fa-bolt" },
                { "categoria": "Engraçada", "texto": "sugestao aqui", "icone": "fa-face-laugh-squint" },
                { "categoria": "Flertando", "texto": "sugestao aqui", "icone": "fa-fire" }
            ]
        }
        `;

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        let responseText = result.response.text();
        
        // CORREÇÃO: Remove qualquer formatação markdown (```json e ```) que a IA possa enviar por engano
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const dataParsed = JSON.parse(responseText);

        if (dataParsed.erro) {
            return res.status(400).json({ erro: dataParsed.erro });
        }

        res.json(dataParsed);

    } catch (error) {
        console.error("Erro no processamento:", error);
        res.status(500).json({ erro: "Falha interna ao analisar a imagem pela IA." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});