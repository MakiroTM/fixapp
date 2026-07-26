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
      ${problemCategory || query.length > 5 
        ? "Encontre 3 a 5 oficinas, mecânicos ou serviços de socorro que sejam ideais para consertar este problema específico." 
        : "Liste as principais oficinas mecânicas, auto centers e prestadores de serviço bem avaliados nesta região. O usuário quer ver opções disponíveis perto dele."}
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

  } catch (error: any) {
    console.error("Erro na API Gemini:", error);

    // Verifica se é erro de cota/limite (429 Resource Exhausted)
    // A estrutura do erro pode variar dependendo se é HTTP error ou exceção do SDK
    const isQuotaError = 
      error?.status === 'RESOURCE_EXHAUSTED' || 
      error?.code === 429 ||
      error?.error?.code === 429 || 
      (error?.message && (error.message.includes('Quota') || error.message.includes('RESOURCE_EXHAUSTED')));

    if (isQuotaError) {
      return {
        text: "### ⚠️ Serviço Temporariamente Indisponível (Cota Excedida)\n\nO limite de uso da API de Inteligência Artificial foi atingido temporariamente. Isso acontece quando há muitos acessos simultâneos.\n\n**Como prosseguir:**\n\n1. ⏳ **Aguarde 1 ou 2 minutos** e tente novamente.\n2. 🗺️ Você pode usar o aplicativo de mapas do seu celular para buscar \"Mecânico\" ou \"Guincho\".\n3. 🆘 Em caso de emergência na estrada, ligue para a concessionária da rodovia ou **190/192**.",
        groundingChunks: []
      };
    }

    // Para outros erros, lança exceção para ser tratada pelo componente
    throw new Error("Falha ao conectar com o assistente de busca.");
  }
};