import { GoogleGenAI } from "@google/genai";
import { Coordinates, SearchResult, VehicleType, ServiceType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findMechanics = async (
  query: string,
  vehicleType: VehicleType,
  serviceType: ServiceType,
  location: Coordinates | null,
  carModel?: string,
  problemCategory?: string
): Promise<SearchResult> => {
  try {
    const isPartsSearch = serviceType === ServiceType.PARTS;

    let prompt = "";

    if (isPartsSearch) {
      prompt = `Atue como um localizador de peças automotivas.
      
      PERFIL DO VEÍCULO:
      - Tipo: ${vehicleType}
      - Modelo: ${carModel || "Não especificado"}
      
      INTENÇÃO DO USUÁRIO:
      - Objetivo: COMPRAR PEÇAS (Varejo/Loja)
      - Item Procurado: "${query}"
      
      TAREFA:
      Encontre 3 a 5 LOJAS DE AUTOPEÇAS, DISTRIBUIDORAS ou REVENDEDORES autorizados próximos que provavelmente tenham este item em estoque.
      
      REQUISITOS DA RESPOSTA:
      1. Se o item for PNEU, priorize borracharias que vendem pneus ou lojas especializadas (ex: Michelin, Pirelli).
      2. Se for BATERIA, priorize casas de bateria.
      3. Se for peça específica (ex: farol, retrovisor), priorize desmanches credenciados ou grandes autopeças.
      4. Informe se a loja costuma ter entrega.
      `;
    } else {
      prompt = `Atue como um especialista em assistência automotiva localizando serviços mecânicos.
      
      PERFIL DO VEÍCULO:
      - Tipo: ${vehicleType}
      - Modelo Específico: ${carModel || "Não especificado"}
      
      SITUAÇÃO:
      - Categoria do Serviço: ${serviceType}
      - Problema Principal: ${problemCategory || "Geral/Não classificado"}
      - Detalhes Adicionais: "${query}"
      
      TAREFA:
      Encontre 3 a 5 oficinas, mecânicos ou serviços de socorro que sejam ideais para consertar este veículo.
      `;
    }

    if (location) {
      prompt += `\nLOCALIZAÇÃO: Lat: ${location.latitude}, Long: ${location.longitude}. Priorize locais num raio curto.`;
    } else {
      prompt += `\nLOCALIZAÇÃO: Coordenadas não fornecidas. Use a região implícita.`;
    }
    
    prompt += `\nUse formatação Markdown clara. Destaque o nome do local em negrito.`;

    const modelId = "gemini-2.5-flash"; // Required for Maps Grounding

    const tools: any[] = [{ googleMaps: {} }];
    let toolConfig = {};

    if (location) {
      toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: tools,
        toolConfig: toolConfig,
      },
    });

    const text = response.text || "Não foi possível encontrar informações no momento.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text,
      groundingChunks: groundingChunks as any[], // Casting to match our interface
    };

  } catch (error) {
    console.error("Erro ao buscar:", error);
    throw new Error("Falha ao conectar com o assistente de busca.");
  }
};