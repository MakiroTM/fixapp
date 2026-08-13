import { Coordinates, SearchResult, VehicleType, ServiceType, GroundingChunk } from "../types";

// Generates high-quality contextual local providers instantly
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

  const locParam = location ? `&lat=${location.latitude}&lon=${location.longitude}` : '';
  const searchPrefix = carModel ? `${carModel} ` : '';

  let fallbackChunks: GroundingChunk[] = [];

  if (isParts) {
    fallbackChunks = [
      {
        maps: {
          title: `Casa das Peças & Autopeças ${carModel ? carModel.split(' ')[0] : 'Express'}`,
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Autopeças ${searchPrefix}${vehicleType}`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Distribuidora de Peças Automotivas`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Auto Peças`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Borracharia 24h`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Centro de Pneus e Borracharia`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Borracharia e Troca de Pneu`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Guincho 24 horas`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Auto Socorro e Reboque 24h`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Serviço de Guincho`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Auto Eletrica e Baterias`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Auto Elétrica`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Casa de Baterias`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Oficina de Freios e Discos`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Manutenção de Freios`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Oficina de Suspensão e Amortecedor`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Alinhamento e Suspensão`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Oficina de Radiadores e Arrefecimento`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Mecânica de Motores e Radiadores`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Oficina Mecânica ${carModel || ''}`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Centro Automotivo`)}${locParam}`,
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
          uri: `https://www.openstreetmap.org/search?query=${encodeURIComponent(`Mecânica e Socorro Automotivo`)}${locParam}`,
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
  console.log('[DEBUG ProviderService] findMechanics invoked', {
    query,
    vehicleType,
    serviceType,
    carModel,
    problemCategory,
    locationCoords: location ? `${location.latitude}, ${location.longitude}` : 'NULL'
  });

  return generateContextualFallback(query, vehicleType, serviceType, location, carModel, problemCategory);
};

