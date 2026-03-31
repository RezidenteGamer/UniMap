import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import Svg, { Rect, Text as SvgText, Circle, Line } from 'react-native-svg';

// ─── Pontos de interesse do campus UNIPAR ───────────────────────────────────
const PONTOS = [
  { id: 1, nome: 'Bloco A',         descricao: 'Salas 101-120',         x: 30,  y: 40,  w: 90, h: 60, cor: '#B2CCBA' },
  { id: 2, nome: 'Bloco B',         descricao: 'Salas 201-220',         x: 30,  y: 160, w: 90, h: 60, cor: '#B2CCBA' },
  { id: 3, nome: 'Biblioteca',      descricao: 'Acervo Central',        x: 200, y: 40,  w: 90, h: 55, cor: '#B8C9E0' },
  { id: 4, nome: 'Restaurante',     descricao: 'Aberto 11h–14h',        x: 200, y: 165, w: 90, h: 55, cor: '#E0D4B8' },
  { id: 5, nome: 'Secretaria',      descricao: 'Atendimento presencial', x: 115, y: 100, w: 75, h: 45, cor: '#D4B8E0' },
];

export default function App() {
  const [localizacao, setLocalizacao] = useState(null);
  const [carregando, setCarregando]   = useState(false);
  const [erro, setErro]               = useState(null);
  const [selecionado, setSelecionado] = useState(null);

  // Pede permissão e obtém localização ao abrir o app
  useEffect(() => {
    obterLocalizacao();
  }, []);

  async function obterLocalizacao() {
    setCarregando(true);
    setErro(null);

    // 1. Pede permissão
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErro('Permissão de localização negada.');
      setCarregando(false);
      return;
    }

    // 2. Obtém coordenadas GPS reais do dispositivo
    try {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocalizacao(pos.coords);
    } catch (e) {
      setErro('Não foi possível obter a localização.');
    }

    setCarregando(false);
  }

  function tocarPonto(ponto) {
    setSelecionado(ponto.id === selecionado?.id ? null : ponto);
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Cabeçalho ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitulo}>UniMap UNIPAR</Text>
        <Text style={styles.headerSub}>Campus Francisco Beltrão</Text>
      </View>

      {/* ── Mapa SVG do campus (placeholder) ── */}
      <View style={styles.mapaContainer}>
        <Svg width="100%" height="280" viewBox="0 0 320 280">

          {/* Fundo verde claro */}
          <Rect x="0" y="0" width="320" height="280" fill="#E8F4F0" />

          {/* Ruas */}
          <Rect x="0"   y="115" width="320" height="14" fill="#C8DDD8" />
          <Rect x="148" y="0"   width="14"  height="280" fill="#C8DDD8" />

          {/* Rótulos das ruas */}
          <SvgText x="10"  y="113" fontSize="8" fill="#8AAAA0">Rua Principal</SvgText>
          <SvgText x="152" y="10"  fontSize="8" fill="#8AAAA0" rotation="90" originX="155" originY="10">Av. Central</SvgText>

          {/* Blocos do campus */}
          {PONTOS.map((p) => (
            <React.Fragment key={p.id}>
              <Rect
                x={p.x} y={p.y} width={p.w} height={p.h}
                rx="4"
                fill={selecionado?.id === p.id ? '#1565C0' : p.cor}
                stroke={selecionado?.id === p.id ? '#0D3C7A' : '#8AAFA0'}
                strokeWidth="1.5"
                onPress={() => tocarPonto(p)}
              />
              <SvgText
                x={p.x + p.w / 2} y={p.y + p.h / 2 - 4}
                fontSize="9" fontWeight="bold"
                fill={selecionado?.id === p.id ? '#FFFFFF' : '#2E5C3A'}
                textAnchor="middle"
                onPress={() => tocarPonto(p)}
              >
                {p.nome}
              </SvgText>
              <SvgText
                x={p.x + p.w / 2} y={p.y + p.h / 2 + 8}
                fontSize="7"
                fill={selecionado?.id === p.id ? '#CCE0FF' : '#557060'}
                textAnchor="middle"
                onPress={() => tocarPonto(p)}
              >
                {p.descricao}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Marcador "Você está aqui" (posição fixa no mapa SVG — simulação) */}
          {localizacao && (
            <>
              <Circle cx="162" cy="122" r="14" fill="rgba(21,101,192,0.15)" />
              <Circle cx="162" cy="122" r="7"  fill="#1565C0" />
              <Circle cx="162" cy="122" r="3"  fill="white" />
            </>
          )}
        </Svg>

        {/* Legenda */}
        <Text style={styles.legendaTexto}>
          Toque em um bloco para ver detalhes · {localizacao ? '● GPS ativo' : '○ Aguardando GPS'}
        </Text>
      </View>

      {/* ── Painel de informações ── */}
      <View style={styles.painel}>

        {/* Bloco selecionado */}
        {selecionado && (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>{selecionado.nome}</Text>
            <Text style={styles.cardSub}>{selecionado.descricao}</Text>
          </View>
        )}

        {/* Coordenadas GPS */}
        {carregando && (
          <View style={styles.linhaStatus}>
            <ActivityIndicator size="small" color="#1565C0" />
            <Text style={styles.statusTexto}>Obtendo localização...</Text>
          </View>
        )}

        {erro && (
          <View style={styles.linhaStatus}>
            <Text style={styles.erroTexto}>{erro}</Text>
          </View>
        )}

        {localizacao && !carregando && (
          <View style={styles.coordsBox}>
            <View style={styles.coordLinha}>
              <Text style={styles.coordLabel}>Latitude</Text>
              <Text style={styles.coordValor}>{localizacao.latitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.coordLinha}>
              <Text style={styles.coordLabel}>Longitude</Text>
              <Text style={styles.coordValor}>{localizacao.longitude.toFixed(6)}°</Text>
            </View>
            <View style={styles.coordLinha}>
              <Text style={styles.coordLabel}>Precisão</Text>
              <Text style={styles.coordValor}>±{Math.round(localizacao.accuracy)}m</Text>
            </View>
          </View>
        )}

        {/* Botão atualizar */}
        <TouchableOpacity style={styles.botao} onPress={obterLocalizacao} disabled={carregando}>
          <Text style={styles.botaoTexto}>
            {carregando ? 'Atualizando...' : 'Atualizar Localização'}
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F5F7FA' },

  header:         { backgroundColor: '#1565C0', paddingVertical: 14, paddingHorizontal: 20 },
  headerTitulo:   { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  headerSub:      { color: '#90CAF9', fontSize: 12, marginTop: 2 },

  mapaContainer:  { backgroundColor: '#E8F4F0', borderBottomWidth: 1, borderColor: '#C8DDD8' },
  legendaTexto:   { fontSize: 10, color: '#778888', textAlign: 'center', paddingVertical: 6 },

  painel:         { flex: 1, padding: 16, gap: 10 },

  card:           { backgroundColor: '#E3F2FD', borderRadius: 10, padding: 12,
                    borderLeftWidth: 4, borderLeftColor: '#1565C0' },
  cardTitulo:     { fontSize: 15, fontWeight: 'bold', color: '#0D3C7A' },
  cardSub:        { fontSize: 12, color: '#1565C0', marginTop: 2 },

  linhaStatus:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  statusTexto:    { fontSize: 13, color: '#555' },
  erroTexto:      { fontSize: 13, color: '#C62828' },

  coordsBox:      { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12,
                    borderWidth: 0.5, borderColor: '#DDDDDD' },
  coordLinha:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5,
                    borderBottomWidth: 0.5, borderColor: '#F0F0F0' },
  coordLabel:     { fontSize: 13, color: '#888' },
  coordValor:     { fontSize: 13, fontWeight: '600', color: '#222' },

  botao:          { backgroundColor: '#1565C0', borderRadius: 10, padding: 14,
                    alignItems: 'center', marginTop: 4 },
  botaoTexto:     { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});