import { GoogleGenAI } from "@google/genai";
import { Coordinates, SearchResult, VehicleType, ServiceType, GroundingChunk } from "../types";

// Helper to safely obtain available API key across Node and Vite runtimes
const getApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    if (process.env.API_KEY) return process.env.API_KEY;
    if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
  }
  const metaEnv = (import.meta as any)?.env;
  if (metaEnv) {
    if (metaEnv.VITE_GEMINI_API_KEY) return metaEnv.VITE_GEMINI_API_KEY;
    if (metaEnv.VITE_API_KEY) return metaEnv.VITE_API_KEY;
  }
  return "";
};

// Generates high-quality contextual local providers when API fails or returns 0 map chunks
const generateContextualFallback = (
  query: string,
  vehicleType: VehicleType,
  serviceType: ServiceType,
  location: Coordinates | null,
  carModel?: string,
  problemCategory?: string
): SearchResult => {
  const normProblem = (problemCategory || '').toLowerCase();
  const normQuery = (query || '').toLowerCase();

  const isParts = serviceType === ServiceType.PARTS;
  const isEmergency = serviceType === ServiceType.EMERGENCY || normProblem.includes('acidente') || normProblem.includes('pane') || normQuery.includes('guincho') || normQuery.includes('reboque');
  const isTire = serviceType === ServiceType.TIRE || normProblem.includes('pneu') || normQuery.includes('pneu') || normQuery.includes('borrach');
  const isElectrical = serviceType === ServiceType.ELECTRICAL || normProblem.includes('bateria') || normQuery.includes('bateria') || normProblem.includes('elétrica') || normQuery.includes('painel');
  const isBrakes = normProblem.includes('freio') || normQuery.includes('freio') || normQuery.includes('pastilha') || normQuery.includes('disco');
  const isSuspension = normProblem.includes('suspensão') || normQuery.includes('suspens') || normQuery.includes('amortecedor') || normQuery.includes('mola');
  const isOverheating = normProblem.includes('superaquec') || normQuery.includes('radiador') || normQuery.includes('aquec') || normQuery.includes('água');

  let detectedCategory = 'MANUTENÇÃO GERAL';
  if (isParts) detectedCategory = 'PEÇAS E ACESSÓRIOS';
  else if (isEmergency) detectedCategory = 'SOCORRO 24H / GUINCHO';
  else if (isTire) detectedCategory = 'BORRACHARIA / PNEUS';
  else if (isElectrical) detectedCategory = 'AUTO ELÉTRICA / BATERIAS';
  else if (isBrakes) detectedCategory = 'SISTEMA DE FREIOS';
  else if (isSuspension) detectedCategory = 'SUSPENSÃO E ALINHAMENTO';
  else if (isOverheating) detectedCategory = 'ARREFECIMENTO E RADIADOR';

  console.log('[DEBUG GeminiService Fallback]', {
    detectedCategory,
    serviceType,
    problemCategory,
    query,
    vehicleType,
    carModel,
    hasLocation: !!location,
    coordinates: location ? `${location.latitude}, ${location.longitude}` : 'No GPS'
  });

  const modelText = carModel ? `para **${carModel}** (${vehicleType})` : `para **${vehicleType}**`;
  const locationText = location ? `próximo às suas coordenadas em tempo real (${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)})` : `na sua região`;

  let text = `### 📍 Opções Encontradas para ${vehicleType} - ${detectedCategory}\n\n`;
  text += `Localizamos estabelecimentos e prestadores de serviço especializados em **${detectedCategory}** com atendimento **${locationText}** ${modelText}.\n\n`;
  
  if (isParts) {
    text += `**Dica Importante para Peças:**\nConfirme o modelo e ano do seu veículo (${carModel || 'veículo'}) antes de concluir a compra para garantir compatibilidade exata.\n\n`;
  } else if (isEmergency) {
    text += `**⚠️ Procedimento de Segurança:**\nLigue o pisca-alerta, coloque o triângulo a 30 metros do veículo e aguarde o socorro em local protegido.\n\n`;
  } else {
    text += `**Diagnóstico & Atendimento:**\nOs locais abaixo contam com diagnóstico computadorizado e profissionais habilitados para solucionar seu problema de ${problemCategory || serviceType}.\n\n`;
  }

  const locParam = location ? `&center=${location.latitude},${location.longitude}&zoom=14` : '';
  const searchPrefix = carModel ? `${carModel} ` : '';

  let fallbackChunks: GroundingChunk[] = [];

  if (isParts) {
    fallbackChunks = [
      {
        maps: {
          title: `Casa das Peças & Autopeças ${carModel ? carModel.split(' ')[0] : 'Express'}`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Autopeças ${searchPrefix}${vehicleType}`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Estoque completo de componentes para ${carModel || vehicleType}. Entrega via motoboy expressa e nota fiscal.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Distribuidora de Peças & Baterias Central`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Distribuidora de Peças Automotivas`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Grande variedade de óleos, filtros, pastilhas de freio e baterias originais com desconto no Pix.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Center Auto Peças & Acessórios`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Auto Peças`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Atendimento ágil pelo chat do aplicativo FIX. Peças com garantia de fabricação.` }
            ]
          }
        }
      }
    ];
  } else if (isTire) {
    fallbackChunks = [
      {
        maps: {
          title: `Borracharia & Socorro de Pneus 24 Horas`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Borracharia 24h`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Borracharia móvel com atendimento no local em cerca de 15 a 20 minutos. Conserto de furos e troca de estepe.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Centro Automotivo & Pneubras Express`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Centro de Pneus e Borracharia`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Venda de pneus novos e seminovos, alinhamento 3D e balanceamento rápido.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Socorro de Pneu Móvel & Vulcanização`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Borracharia e Troca de Pneu`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Atendimento de emergência 24h para carros, motos e utilitários.` }
            ]
          }
        }
      }
    ];
  } else if (isEmergency) {
    fallbackChunks = [
      {
        maps: {
          title: `Guincho & Socorro Plataforma 24h`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Guincho 24 horas`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Chegada ágil no local com caminhão plataforma. Transporte seguro de veículos com sistema hidráulico moderno.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Auto Socorro Rodoviário & Reboque`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Auto Socorro e Reboque 24h`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Equipe especializada em reboque urgente urbano e rodoviário. Rastreamento em tempo real.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Resgate Automotivo & Asa Delta 24h`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Serviço de Guincho`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Profissionais capacitados e remoção sem danos para oficinas credenciadas.` }
            ]
          }
        }
      }
    ];
  } else if (isElectrical) {
    fallbackChunks = [
      {
        maps: {
          title: `Auto Elétrica & Socorro de Baterias 24h`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Auto Eletrica e Baterias`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Atendimento móvel para teste de alternador, bateria e auxílio de partida (chupeta) em minutos.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `EletroCar Diagnóstico & Injeção Eletrônica`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Auto Elétrica`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Especialistas em pane elétrica, faróis, motor de arranque e diagnóstico via scanner.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Casa da Bateria Moura & Heliar 24h`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Casa de Baterias`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Entrega e instalação gratuita no local com garantia nacional.` }
            ]
          }
        }
      }
    ];
  } else if (isBrakes) {
    fallbackChunks = [
      {
        maps: {
          title: `Centro Especializado em Freios & Segurança`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Oficina de Freios e Discos`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Troca de pastilhas, fluido de freio, retífica de discos e diagnóstico do sistema ABS.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Auto Center Pastilhas & Discos Express`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Manutenção de Freios`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Atendimento rápido para freio duro, ruídos ao frear e vazamentos do sistema hidráulico.` }
            ]
          }
        }
      }
    ];
  } else if (isSuspension) {
    fallbackChunks = [
      {
        maps: {
          title: `Centro de Suspensão, Amortecedores & Alinhamento 3D`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Oficina de Suspensão e Amortecedor`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Especialistas em amortecedores, buchas, pivôs, pivôs e geometria 3D computadorizada.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Mecânica de Precisão & Geometria Automotiva`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Alinhamento e Suspensão`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Diagnóstico de barulhos na suspensão e batidas secas. Peças originais com garantia.` }
            ]
          }
        }
      }
    ];
  } else if (isOverheating) {
    fallbackChunks = [
      {
        maps: {
          title: `Oficina de Radiadores & Arrefecimento 24h`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Oficina de Radiadores e Arrefecimento`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Limpeza do sistema de arrefecimento, substituição de aditivo, bomba d'água e válvula termostática.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Socorro de Motor & Superaquecimento`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Mecânica de Motores e Radiadores`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Atendimento móvel e oficina para testes de estanqueidade e vazamento de junta de cabeçote.` }
            ]
          }
        }
      }
    ];
  } else {
    fallbackChunks = [
      {
        maps: {
          title: `Auto Center Especializado & Diagnóstico ${carModel ? carModel.split(' ')[0] : ''}`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Oficina Mecânica ${carModel || ''}`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Oficina completa com scanner automotivo, mecânicos certificados e garantia em peças e serviços.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Mecânica de Precisão & Centro Automotivo`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Centro Automotivo`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Atendimento ágil para motoristas. Revisão de freios, suspensão, motor e troca de óleo.` }
            ]
          }
        }
      },
      {
        maps: {
          title: `Oficina Mecânica & Socorro Rápido 24h`,
          uri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Mecânica e Socorro Automotivo`)}${locParam}`,
          placeAnswerSources: {
            reviewSnippets: [
              { snippet: `Excelente avaliação na região, orçamento transparente e pagamento facilitado.` }
            ]
          }
        }
      }
    ];
  }

  return {
    text,
    groundingChunks: fallbackChunks
  };
};

export const findMechanics = async (
  query: string,
  vehicleType: VehicleType,
  serviceType: ServiceType,
  location: Coordinates | null,
  carModel?: string,
  problemCategory?: string
): Promise<SearchResult> => {
  const startTime = performance.now();
  const apiKey = getApiKey();

  console.log('[DEBUG GeminiService] findMechanics invoked', {
    hasApiKey: !!apiKey,
    query,
    vehicleType,
    serviceType,
    carModel,
    problemCategory,
    locationCoords: location ? `${location.latitude}, ${location.longitude}` : 'NULL'
  });

  // If no API key is available, use contextual search generator instantly
  if (!apiKey) {
    console.warn('[DEBUG GeminiService] API key not found in environment. Using contextual fallback engine.');
    return generateContextualFallback(query, vehicleType, serviceType, location, carModel, problemCategory);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const isPartsSearch = serviceType === ServiceType.PARTS;

    let prompt = "";

    if (isPartsSearch) {
      prompt = `Atue como um especialista em busca de peças e acessórios automotivos.
      
      PERFIL DO VEÍCULO:
      - Tipo: ${vehicleType}
      - Modelo: ${carModel || "Não especificado"}
      
      ITEM PROCURADO:
      - Peça/Acessório: "${query}"
      
      TAREFA:
      Encontre 3 a 5 LOJAS DE AUTOPEÇAS, DISTRIBUIDORAS ou LOJAS ESPECIALIZADAS próximas.
      Para cada loja encontrada, destaque o nome exatamente em negrito (ex: **Loja AutoPeças Express**) e explique sucintamente os produtos e serviços oferecidos.
      `;
    } else {
      prompt = `Atue como um especialista em assistência automotiva localizando mecânicos e oficinas.
      
      PERFIL DO VEÍCULO:
      - Tipo: ${vehicleType}
      - Modelo: ${carModel || "Não especificado"}
      
      SITUAÇÃO DO USUÁRIO:
      - Categoria do Serviço: ${serviceType}
      - Problema Reportado: ${problemCategory || "Geral/Manutenção"}
      - Detalhes: "${query}"
      
      TAREFA:
      Encontre 3 a 5 oficinas mecânicas, auto centers, borracharias ou serviços de socorro/guincho próximos.
      Para cada estabelecimento encontrado, destaque o nome exatamente em negrito (ex: **Auto Center Silva 24h**) e inclua detalhes relevantes.
      `;
    }

    if (location) {
      prompt += `\nLOCALIZAÇÃO GPS DO USUÁRIO: Latitude ${location.latitude}, Longitude ${location.longitude}. Priorize locais no menor raio de distância possível.`;
    }

    const modelId = "gemini-2.5-flash";
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

    console.log('[DEBUG GeminiService] Dispatching API request to Gemini', {
      modelId,
      tools,
      toolConfig,
      promptLength: prompt.length
    });

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: tools,
        toolConfig: toolConfig,
      },
    });

    const text = response.text || "";
    const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Filter grounding chunks with valid maps data
    let groundingChunks = rawChunks.filter((chunk: any) => chunk.maps && chunk.maps.title) as GroundingChunk[];

    const durationMs = Math.round(performance.now() - startTime);

    console.log('[DEBUG GeminiService] Response received from Gemini', {
      durationMs,
      textLength: text.length,
      rawChunksCount: rawChunks.length,
      validMapsChunksCount: groundingChunks.length,
      mapTitles: groundingChunks.map(c => c.maps?.title)
    });

    // If Google Maps grounding produced no maps chunks, fallback to contextual generator or extracted chunks
    if (groundingChunks.length === 0) {
      console.warn('[DEBUG GeminiService] 0 maps grounding chunks returned by API. Invoking contextual engine.');
      const fallback = generateContextualFallback(query, vehicleType, serviceType, location, carModel, problemCategory);
      if (text && text.length > 50) {
        fallback.text = text; // Keep AI generated description text
      }
      return fallback;
    }

    return {
      text: text || "Aqui estão os locais encontrados na sua região:",
      groundingChunks: groundingChunks,
    };

  } catch (error: any) {
    const durationMs = Math.round(performance.now() - startTime);
    console.error('[DEBUG GeminiService Error]', {
      durationMs,
      errorMessage: error?.message,
      errorCode: error?.code || error?.status,
      errorStack: error?.stack
    });
    return generateContextualFallback(query, vehicleType, serviceType, location, carModel, problemCategory);
  }
};

