import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import api from '../services/api';

const ASSET_COLORS = ['#00D4A1','#3B82F6','#A855F7','#F4A261','#EF4444','#10B981','#F59E0B','#06B6D4'];
const PERIOD_TABS  = ['1W','1M','3M','6M','1Y','All'];

// ─── Mini Trend ───────────────────────────────────────────────────────────────
function MiniTrend({ isUp }) {
  const heights = [3,5,4,7,5,8,6,9,7,10];
  return (
    <View style={{ flexDirection:'row', alignItems:'flex-end', gap:2 }}>
      {heights.map((h, i) => (
        <View key={i} style={{
          width: 3, borderRadius:2, height: h * 2,
          backgroundColor: i < 6 ? colors.border : (isUp ? colors.success : colors.error),
          opacity: i < 6 ? 0.6 : 1,
        }} />
      ))}
    </View>
  );
}

// ─── Holding Card ─────────────────────────────────────────────────────────────
function HoldingCard({ holding, index }) {
  const color   = holding.color || ASSET_COLORS[index % ASSET_COLORS.length];
  const price   = Number(holding.currentPrice ?? holding.avgBuyPrice ?? 0);
  const value   = Number(holding.value ?? (holding.shares * price));
  const cost    = Number(holding.shares ?? 0) * Number(holding.avgBuyPrice ?? 0);
  const gain    = Number(holding.gainLoss   ?? (value - cost));
  const gainPct = Number(holding.gainLossPct ?? (cost > 0 ? (gain / cost) * 100 : 0));
  const isUp    = gain >= 0;

  return (
    <View style={S.holdingCard}>
      <View style={[S.holdingTicker, { backgroundColor: color + '1A' }]}>
        <Text style={[S.holdingTickerText, { color }]}>{(holding.ticker||'?').slice(0,4)}</Text>
      </View>
      <View style={S.holdingInfo}>
        <Text style={S.holdingName}>{holding.ticker}</Text>
        <Text style={S.holdingMeta}>{Number(holding.shares??0).toLocaleString()} shares · £{price.toFixed(2)}</Text>
        <View style={{ marginTop:6 }}>
          <MiniTrend isUp={isUp} />
        </View>
      </View>
      <View style={S.holdingRight}>
        <Text style={S.holdingValue}>£{value.toLocaleString('en-GB',{minimumFractionDigits:2})}</Text>
        <View style={[S.changeChip, { backgroundColor: isUp ? colors.successLight : colors.errorLight }]}>
          <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={11} color={isUp ? colors.success : colors.error} />
          <Text style={[S.changeText, { color: isUp ? colors.success : colors.error }]}>
            {isUp?'+':''}{gainPct.toFixed(1)}%
          </Text>
        </View>
        <Text style={[S.gainText, { color: isUp ? colors.success : colors.error }]}>
          {isUp ? '+' : '-'}£{Math.abs(gain).toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function PortfolioScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [activePeriod,setActivePeriod]= useState('1Y');
  const [activeTab,   setActiveTab]   = useState('all');

  // chart bar data (mock — replace with real history if available)
  const BAR_DATA = [40,55,50,70,65,80,72,88,78,85,90,100];
  const MONTHS   = ['J','F','M','A','M','J','J','A','S','O','N','D'];

  const load = useCallback(async () => {
    try { const res = await api.get('/portfolio'); setData(res.data); }
    catch (err) { console.warn(err.message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={[S.container, { justifyContent:'center', alignItems:'center', paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const holdings     = data?.holdings || [];
  const portfolioVal = Number(data?.totalValue ?? 0);
  const totalCost    = Number(data?.totalCost  ?? 0);
  const totalGain    = portfolioVal - totalCost;
  const gainPct      = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const isUp         = totalGain >= 0;

  // Allocation by type
  const byType = {};
  holdings.forEach((h, i) => {
    const type = h.type || 'stock';
    const val  = Number(h.value ?? (h.shares*(h.currentPrice??h.avgBuyPrice)));
    const col  = h.color || ASSET_COLORS[Object.keys(byType).length % ASSET_COLORS.length];
    if (!byType[type]) byType[type] = { value:0, color:col };
    byType[type].value += val;
  });
  const segments = Object.entries(byType).map(([type, d]) => ({
    type, color:d.color,
    pct: portfolioVal > 0 ? Math.round((d.value / portfolioVal) * 100) : 0,
    value: d.value,
  }));

  const filtered = holdings.filter(h => {
    const g = Number(h.gainLoss ?? ((h.currentPrice??h.avgBuyPrice) - h.avgBuyPrice) * h.shares);
    if (activeTab === 'gainers') return g >= 0;
    if (activeTab === 'losers')  return g < 0;
    return true;
  });

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom:32 }}>

        {/* ── Header ── */}
        <LinearGradient colors={['#0A1628','#1A3560']} style={S.header}>
          <View style={S.headerRow}>
            {navigation?.canGoBack?.() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={S.backBtn}>
                <Ionicons name="arrow-back" size={22} color={colors.white} />
              </TouchableOpacity>
            )}
            <Text style={S.headerTitle}>Portfolio</Text>
            <TouchableOpacity style={S.iconBtn}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Value */}
          <View style={S.valueSummary}>
            <Text style={S.totalLabel}>Total Portfolio Value</Text>
            <Text style={S.totalValue}>£{portfolioVal.toLocaleString('en-GB',{minimumFractionDigits:2})}</Text>
            <View style={S.returnRow}>
              <View style={[S.returnChip, { backgroundColor: isUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }]}>
                <Ionicons name={isUp ? 'trending-up' : 'trending-down'} size={14} color={isUp ? colors.success : colors.error} />
                <Text style={[S.returnText, { color: isUp ? colors.success : colors.error }]}>
                  {isUp?'+':'-'}£{Math.abs(totalGain).toFixed(2)} ({isUp?'+':''}{gainPct.toFixed(1)}%)
                </Text>
              </View>
              <Text style={S.returnPeriod}>All time</Text>
            </View>
          </View>

          {/* Period tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:16 }}
            contentContainerStyle={{ paddingHorizontal:20, gap:6 }}>
            {PERIOD_TABS.map(p => (
              <TouchableOpacity key={p} style={[S.periodTab, activePeriod===p && S.periodTabActive]} onPress={() => setActivePeriod(p)}>
                <Text style={[S.periodText, activePeriod===p && S.periodTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bar chart */}
          <View style={S.chartArea}>
            {BAR_DATA.map((val, i) => (
              <View key={i} style={S.barWrapper}>
                <View style={[S.bar, {
                  height:(val/100)*80,
                  backgroundColor: i === BAR_DATA.length-1 ? colors.primary : 'rgba(0,212,161,0.3)'
                }]} />
                <Text style={S.barLabel}>{MONTHS[i]}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── Stats strip ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal:16, gap:10, paddingVertical:16 }}>
          {[
            { label:'Portfolio Value', val:`£${portfolioVal.toLocaleString('en-GB',{maximumFractionDigits:0})}`, color:'#3B82F6' },
            { label:'Total Invested',  val:`£${totalCost.toLocaleString('en-GB',{maximumFractionDigits:0})}`,   color:colors.textSecondary },
            { label:'Total Return',    val:`${isUp?'+':''}£${Math.abs(totalGain).toFixed(0)}`,  color:isUp?colors.success:colors.error },
            { label:'Return %',        val:`${isUp?'+':''}${gainPct.toFixed(1)}%`,              color:isUp?colors.success:colors.error },
            { label:'Holdings',        val:String(holdings.length), color:'#A855F7' },
          ].map(s => (
            <View key={s.label} style={S.statChip}>
              <Text style={S.statLabel}>{s.label}</Text>
              <Text style={[S.statVal, { color:s.color }]}>{s.val}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Allocation ── */}
        {segments.length > 0 && (
          <View style={[S.card, { marginHorizontal:16, marginBottom:16 }]}>
            <Text style={S.cardTitle}>Allocation</Text>
            <View style={S.allocBar}>
              {segments.map((seg,i) => (
                <View key={i} style={{ flex:seg.pct, backgroundColor:seg.color, height:10 }} />
              ))}
            </View>
            <View style={S.allocLegend}>
              {segments.map(seg => (
                <View key={seg.type} style={S.allocItem}>
                  <View style={[S.allocDot, { backgroundColor:seg.color }]} />
                  <Text style={S.allocLabel}>{seg.type}</Text>
                  <Text style={[S.allocPct, { color:seg.color }]}>{seg.pct}%</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Holdings ── */}
        <View style={[S.card, { marginHorizontal:16 }]}>
          <View style={S.holdingsHeader}>
            <View>
              <Text style={S.cardTitle}>Holdings</Text>
              <Text style={S.cardSub}>{holdings.length} position{holdings.length!==1?'s':''}</Text>
            </View>
            <View style={{ flexDirection:'row', gap:6 }}>
              {[['all','All'],['gainers','▲'],['losers','▼']].map(([val,lbl]) => (
                <TouchableOpacity key={val} onPress={() => setActiveTab(val)}
                  style={[S.tabPill, activeTab===val && S.tabPillActive]}>
                  <Text style={[S.tabPillText, activeTab===val && S.tabPillTextActive]}>{lbl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filtered.length === 0 ? (
            <View style={{ alignItems:'center', padding:32 }}>
              <Ionicons name="trending-up-outline" size={40} color={colors.textLight} />
              <Text style={{ fontSize:15, fontWeight:'700', color:colors.text, marginTop:12 }}>
                {holdings.length === 0 ? 'No holdings yet' : `No ${activeTab} right now`}
              </Text>
            </View>
          ) : (
            filtered.map((h, i) => <HoldingCard key={h._id ?? i} holding={h} index={i} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: { flex:1, backgroundColor:colors.background },

  header: { paddingBottom:20 },
  headerRow: { flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:16, gap:8 },
  backBtn: { padding:4, marginRight:4 },
  headerTitle: { flex:1, fontSize:20, fontWeight:'800', color:colors.white },
  iconBtn: { padding:6 },
  valueSummary: { paddingHorizontal:20, marginBottom:16 },
  totalLabel: { fontSize:12, color:'rgba(255,255,255,0.55)', marginBottom:4, fontWeight:'600' },
  totalValue: { fontSize:34, fontWeight:'900', color:colors.white, marginBottom:8 },
  returnRow: { flexDirection:'row', alignItems:'center', gap:10 },
  returnChip: { flexDirection:'row', alignItems:'center', gap:4, paddingHorizontal:10, paddingVertical:4, borderRadius:20 },
  returnText: { fontSize:13, fontWeight:'700' },
  returnPeriod: { fontSize:12, color:'rgba(255,255,255,0.45)' },
  periodTab: { paddingHorizontal:16, paddingVertical:6, borderRadius:20, backgroundColor:'rgba(255,255,255,0.1)' },
  periodTabActive: { backgroundColor:colors.primary },
  periodText: { fontSize:13, fontWeight:'600', color:'rgba(255,255,255,0.6)' },
  periodTextActive: { color:colors.secondary },
  chartArea: { flexDirection:'row', alignItems:'flex-end', height:100, paddingHorizontal:20, gap:4 },
  barWrapper: { flex:1, alignItems:'center', gap:4 },
  bar: { width:'100%', borderRadius:4 },
  barLabel: { fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:'500' },

  statChip: { backgroundColor:colors.white, borderRadius:14, padding:14, minWidth:120,
    elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:5 },
  statLabel: { fontSize:11, color:colors.textLight, fontWeight:'600', marginBottom:4 },
  statVal: { fontSize:16, fontWeight:'900' },

  card: { backgroundColor:colors.white, borderRadius:20, padding:18,
    elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:6 },
  cardTitle: { fontSize:15, fontWeight:'800', color:colors.text, marginBottom:2 },
  cardSub: { fontSize:12, color:colors.textSecondary, marginBottom:14 },

  allocBar: { flexDirection:'row', height:10, borderRadius:5, overflow:'hidden', marginVertical:14 },
  allocLegend: { flexDirection:'row', flexWrap:'wrap', gap:10 },
  allocItem: { flexDirection:'row', alignItems:'center', gap:5 },
  allocDot: { width:8, height:8, borderRadius:4 },
  allocLabel: { fontSize:12, color:colors.textSecondary, fontWeight:'600', textTransform:'capitalize' },
  allocPct: { fontSize:12, fontWeight:'800' },

  holdingsHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 },
  tabPill: { paddingHorizontal:12, paddingVertical:5, borderRadius:20, backgroundColor:colors.background },
  tabPillActive: { backgroundColor:colors.secondary },
  tabPillText: { fontSize:12, fontWeight:'600', color:colors.textSecondary },
  tabPillTextActive: { color:colors.white },

  holdingCard: { flexDirection:'row', alignItems:'center', paddingVertical:14,
    borderBottomWidth:1, borderBottomColor:colors.background, gap:12 },
  holdingTicker: { width:44, height:44, borderRadius:13, alignItems:'center', justifyContent:'center', flexShrink:0 },
  holdingTickerText: { fontSize:11, fontWeight:'900', letterSpacing:-0.5 },
  holdingInfo: { flex:1 },
  holdingName: { fontSize:14, fontWeight:'800', color:colors.text, marginBottom:1 },
  holdingMeta: { fontSize:11, color:colors.textLight },
  holdingRight: { alignItems:'flex-end', gap:3 },
  holdingValue: { fontSize:14, fontWeight:'900', color:colors.text },
  changeChip: { flexDirection:'row', alignItems:'center', gap:3, paddingHorizontal:7, paddingVertical:2, borderRadius:8 },
  changeText: { fontSize:11, fontWeight:'700' },
  gainText: { fontSize:11, fontWeight:'700' },
});
