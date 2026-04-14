import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import api from '../services/api';

// ─── Static AI data ───────────────────────────────────────────────────────────
const AI_PROFILES = {
  conservative: {
    label: 'Conservative', icon: 'shield-checkmark-outline',
    desc:  'Capital preservation — low risk',
    allocation: [
      { label:'Savings', pct:40, color:'#00D4A1' },
      { label:'ETFs',    pct:35, color:'#3B82F6' },
      { label:'Stocks',  pct:20, color:'#A855F7' },
      { label:'Crypto',  pct:5,  color:'#F97316' },
    ],
    picks: [
      { ticker:'VOO',  name:'Vanguard S&P 500', action:'BUY',  conf:92, risk:'Low',  ret:'+8.2%',  note:'Low-cost broad market ETF for stable growth' },
      { ticker:'BND',  name:'Vanguard Bond ETF',action:'BUY',  conf:88, risk:'Low',  ret:'+3.8%',  note:'Fixed income to balance equity exposure' },
      { ticker:'MSFT', name:'Microsoft Corp.',  action:'HOLD', conf:79, risk:'Med',  ret:'+22%',   note:'Strong cloud fundamentals, steady AI pipeline' },
    ],
  },
  balanced: {
    label: 'Balanced', icon: 'stats-chart-outline',
    desc:  'Growth with protection — moderate risk',
    allocation: [
      { label:'Stocks', pct:40, color:'#A855F7' },
      { label:'ETFs',   pct:30, color:'#3B82F6' },
      { label:'Savings',pct:20, color:'#00D4A1' },
      { label:'Crypto', pct:10, color:'#F97316' },
    ],
    picks: [
      { ticker:'AAPL', name:'Apple Inc.',       action:'BUY',   conf:94, risk:'Med',  ret:'+15%',  note:'Services growth + AI pipeline; strong buy' },
      { ticker:'VOO',  name:'Vanguard S&P 500', action:'BUY',   conf:91, risk:'Low',  ret:'+12%',  note:'Core holding for any balanced portfolio' },
      { ticker:'ETH',  name:'Ethereum',         action:'WATCH', conf:68, risk:'High', ret:'+56%',  note:'Strong fundamentals; macro headwinds remain' },
    ],
  },
  aggressive: {
    label: 'Aggressive', icon: 'rocket-outline',
    desc:  'Maximum growth — higher risk/reward',
    allocation: [
      { label:'Stocks', pct:50, color:'#A855F7' },
      { label:'Crypto', pct:25, color:'#F97316' },
      { label:'ETFs',   pct:20, color:'#3B82F6' },
      { label:'Savings',pct:5,  color:'#00D4A1' },
    ],
    picks: [
      { ticker:'NVDA', name:'NVIDIA Corp.',  action:'BUY',   conf:96, risk:'Med',  ret:'+82%',  note:'AI infrastructure leader; data centre growth accelerating' },
      { ticker:'BTC',  name:'Bitcoin',       action:'BUY',   conf:74, risk:'High', ret:'+63%',  note:'Halving cycle historically bullish' },
      { ticker:'TSLA', name:'Tesla Inc.',    action:'WATCH', conf:61, risk:'High', ret:'-12%',  note:'FSD progress promising but margin pressure ongoing' },
    ],
  },
};

const ACTION_COLOR = { BUY:'#059669', HOLD:'#2563EB', WATCH:'#D97706' };
const ACTION_BG    = { BUY:'#D1FAE5', HOLD:'#DBEAFE', WATCH:'#FEF3C7' };

// ─── Quick Invest Modal ───────────────────────────────────────────────────────
function QuickInvestModal({ visible, portfolioVal, goalsTotal, savingsTotal, onClose }) {
  const [amount, setAmount] = useState('');
  const [dest,   setDest]   = useState('portfolio');
  const [done,   setDone]   = useState(false);

  const DESTS = [
    { val:'portfolio', label:'Portfolio',   icon:'trending-up-outline',  bal: `£${portfolioVal.toFixed(2)}` },
    { val:'goals',     label:'Goals',       icon:'flag-outline',         bal: `£${goalsTotal.toFixed(2)}`   },
    { val:'savings',   label:'Savings Pot', icon:'leaf-outline',         bal: `£${savingsTotal.toFixed(2)}` },
  ];

  const handleInvest = () => {
    if (!amount || parseFloat(amount) <= 0) { Alert.alert('Invalid amount'); return; }
    setDone(true);
  };

  const handleClose = () => { setDone(false); setAmount(''); onClose(); };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={S.modalOverlay}>
        <View style={S.modalBox}>
          {done ? (
            <View style={{ alignItems:'center', padding:16 }}>
              <View style={S.successIcon}><Ionicons name="checkmark-circle" size={56} color={colors.primary} /></View>
              <Text style={S.modalTitle}>Investment Queued!</Text>
              <Text style={S.modalSub}>
                £{parseFloat(amount).toFixed(2)} will be added to your {DESTS.find(d=>d.val===dest)?.label}.
              </Text>
              <TouchableOpacity style={S.primaryBtn} onPress={handleClose}>
                <Text style={S.primaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={S.modalHeader}>
                <View>
                  <Text style={S.modalTitle}>Quick Invest</Text>
                  <Text style={S.modalSub}>Choose where to put your money</Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={S.closeBtn}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={S.fieldLabel}>Destination</Text>
              {DESTS.map(d => (
                <TouchableOpacity key={d.val} onPress={() => setDest(d.val)}
                  style={[S.destRow, dest===d.val && S.destRowActive]}>
                  <View style={[S.destIcon, { backgroundColor: dest===d.val ? colors.primaryLight : colors.background }]}>
                    <Ionicons name={d.icon} size={20} color={dest===d.val ? colors.primary : colors.textLight} />
                  </View>
                  <Text style={[S.destLabel, dest===d.val && { color:colors.primary }]}>{d.label}</Text>
                  <Text style={S.destBal}>{d.bal}</Text>
                </TouchableOpacity>
              ))}

              <Text style={[S.fieldLabel, { marginTop:16 }]}>Quick amounts</Text>
              <View style={S.quickRow}>
                {['10','25','50','100','250'].map(q => (
                  <TouchableOpacity key={q} onPress={() => setAmount(q)}
                    style={[S.quickChip, amount===q && S.quickChipActive]}>
                    <Text style={[S.quickChipText, amount===q && S.quickChipTextActive]}>£{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[S.fieldLabel, { marginTop:16 }]}>Amount</Text>
              <View style={S.inputRow}>
                <Text style={S.inputPrefix}>£</Text>
                <TextInput style={S.input} keyboardType="numeric" placeholder="0.00"
                  value={amount} onChangeText={setAmount} placeholderTextColor={colors.textLight} />
              </View>

              <TouchableOpacity style={S.primaryBtn} onPress={handleInvest}>
                <Text style={S.primaryBtnText}>Invest £{parseFloat(amount||0).toFixed(2)}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Channel Card ─────────────────────────────────────────────────────────────
function ChannelCard({ icon, title, value, subtitle, color, onInvest, onView }) {
  return (
    <View style={[S.channelCard, { borderLeftColor: color }]}>
      <View style={[S.channelIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={S.channelTitle}>{title}</Text>
      <Text style={[S.channelValue, { color: colors.text }]}>{value}</Text>
      <Text style={S.channelSub}>{subtitle}</Text>
      <View style={S.channelBtns}>
        <TouchableOpacity style={[S.channelInvestBtn, { backgroundColor: color }]} onPress={onInvest}>
          <Text style={S.channelInvestText}>Invest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.channelViewBtn, { borderColor: color + '40' }]} onPress={onView}>
          <Ionicons name="arrow-forward" size={16} color={color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── AI Pick Card ─────────────────────────────────────────────────────────────
function AIPickCard({ pick }) {
  const actColor = ACTION_COLOR[pick.action] || '#64748B';
  const actBg    = ACTION_BG[pick.action]    || '#F5F7FA';
  const retUp    = !pick.ret.startsWith('-');
  return (
    <View style={S.pickCard}>
      <View style={S.pickTop}>
        <View>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
            <Text style={S.pickTicker}>{pick.ticker}</Text>
            <View style={[S.actionChip, { backgroundColor: actBg }]}>
              <Text style={[S.actionText, { color: actColor }]}>{pick.action}</Text>
            </View>
          </View>
          <Text style={S.pickName}>{pick.name}</Text>
        </View>
        <View style={{ alignItems:'flex-end' }}>
          <Text style={[S.pickRet, { color: retUp ? colors.success : colors.error }]}>{pick.ret}</Text>
          <Text style={[S.pickRisk, { color: pick.risk==='High' ? colors.error : pick.risk==='Med' ? colors.warning : colors.success }]}>
            {pick.risk} Risk
          </Text>
        </View>
      </View>
      <Text style={S.pickNote}>{pick.note}</Text>
      <View style={S.confRow}>
        <Text style={S.confLabel}>AI Confidence</Text>
        <Text style={S.confPct}>{pick.conf}%</Text>
      </View>
      <View style={S.confBar}>
        <View style={[S.confFill, {
          width: `${pick.conf}%`,
          backgroundColor: pick.conf >= 85 ? colors.success : pick.conf >= 70 ? colors.warning : colors.error
        }]} />
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InvestmentScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [mode,         setMode]         = useState('manual');
  const [riskProfile,  setRiskProfile]  = useState('balanced');
  const [autoInvest,   setAutoInvest]   = useState(false);
  const [autoAmount,   setAutoAmount]   = useState('50');
  const [autoFreq,     setAutoFreq]     = useState('weekly');
  const [showInvest,   setShowInvest]   = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const [portfolioVal,  setPortfolioVal]  = useState(0);
  const [portfolioGain, setPortfolioGain] = useState(0);
  const [goalsTotal,    setGoalsTotal]    = useState(0);
  const [goalsCount,    setGoalsCount]    = useState(0);
  const [savingsTotal,  setSavingsTotal]  = useState(0);

  const load = useCallback(async () => {
    try {
      const [portRes, goalsRes, savRes] = await Promise.allSettled([
        api.get('/portfolio'),
        api.get('/goals'),
        api.get('/savings-tracker'),
      ]);
      if (portRes.status === 'fulfilled') {
        const d = portRes.value.data;
        setPortfolioVal(Number(d?.totalValue ?? 0));
        setPortfolioGain(Number(d?.totalValue ?? 0) - Number(d?.totalCost ?? 0));
      }
      if (goalsRes.status === 'fulfilled') {
        const gs = Array.isArray(goalsRes.value.data) ? goalsRes.value.data : [];
        setGoalsTotal(gs.reduce((s, g) => s + Number(g.current ?? 0), 0));
        setGoalsCount(gs.length);
      }
      if (savRes.status === 'fulfilled') {
        setSavingsTotal(Number(savRes.value.data?.totalSaved ?? 0));
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  const totalInvested = portfolioVal + goalsTotal + savingsTotal;
  const gainPct = portfolioVal > 0 ? ((portfolioGain / (portfolioVal - portfolioGain)) * 100) : 0;
  const profile = AI_PROFILES[riskProfile];

  if (loading) {
    return (
      <View style={[S.container, { justifyContent:'center', alignItems:'center', paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Hero Header ── */}
        <LinearGradient colors={['#0A1628','#1C3D6E','#0F2744']} style={S.hero}>
          <View style={S.heroTopRow}>
            <Text style={S.heroTitle}>Investments</Text>
            <TouchableOpacity style={S.iconBtn} onPress={() => setShowInvest(true)}>
              <Ionicons name="add-circle" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:20 }}
            contentContainerStyle={{ paddingHorizontal:20, gap:16 }}>
            {[
              { label:'Total Invested', val:`£${totalInvested.toLocaleString('en-GB',{minimumFractionDigits:2})}`, color:colors.white },
              { label:'Portfolio Returns', val:`${portfolioGain>=0?'+':''}£${Math.abs(portfolioGain).toFixed(2)}`, color: portfolioGain>=0 ? colors.primary : colors.error },
              { label:'AI Score', val:'8.4/10', color:'#F59E0B' },
            ].map(s => (
              <View key={s.label} style={S.heroStat}>
                <Text style={S.heroStatLabel}>{s.label}</Text>
                <Text style={[S.heroStatVal, { color:s.color }]}>{s.val}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Mode toggle */}
          <View style={S.modeToggleWrap}>
            {[['manual','game-controller-outline','Manual'],['ai','sparkles-outline','AI Powered']].map(([val, icon, lbl]) => (
              <TouchableOpacity key={val} style={[S.modeBtn, mode===val && S.modeBtnActive]} onPress={() => setMode(val)}>
                <Ionicons name={icon} size={16} color={mode===val ? colors.text : 'rgba(255,255,255,0.6)'} />
                <Text style={[S.modeBtnText, mode===val && S.modeBtnTextActive]}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* ── MANUAL MODE ── */}
        {mode === 'manual' && (
          <View style={S.body}>

            {/* ── Beginner Starter ── */}
            <View style={S.beginnerCard}>
              <Text style={S.beginnerTitle}>New to investing? Start here 👋</Text>
              <Text style={S.beginnerSub}>Pick a risk level — we handle the rest</Text>

              {[
                { icon: '🛡️', name: 'Low Risk',    detail: 'Cash ISA + UK Gilts',         returns: '4–5%/yr',   from: 'From £10',  color: '#10B981' },
                { icon: '⚖️', name: 'Medium Risk', detail: 'Global ETF Mix',               returns: '6–9%/yr',   from: 'From £25',  color: '#3B82F6' },
                { icon: '🚀', name: 'High Risk',   detail: 'Tech & Emerging Markets',      returns: '10–15%/yr', from: 'From £50',  color: '#A855F7' },
              ].map(opt => (
                <View key={opt.name} style={[S.starterOption, { borderLeftColor: opt.color }]}>
                  <View style={S.starterLeft}>
                    <Text style={S.starterIcon}>{opt.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={S.starterName}>{opt.name}</Text>
                        <Text style={[S.starterReturns, { color: opt.color }]}>{opt.returns}</Text>
                      </View>
                      <Text style={S.starterDetail}>{opt.detail} · {opt.from}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[S.starterBtn, { borderColor: opt.color }]}
                    onPress={() =>
                      Alert.alert('Coming Soon', 'This feature is launching soon. You\'ll be first to know!')
                    }>
                    <Text style={[S.starterBtnText, { color: opt.color }]}>Start</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <Text style={S.sectionTitle}>Investment Channels</Text>
            <Text style={S.sectionSub}>Choose where to grow your money</Text>

            <View style={S.channelGrid}>
              <ChannelCard
                icon="trending-up-outline" title="Portfolio" color="#3B82F6"
                value={`£${portfolioVal.toLocaleString('en-GB',{minimumFractionDigits:2})}`}
                subtitle={`${portfolioGain>=0?'+':''}£${Math.abs(portfolioGain).toFixed(2)} return`}
                onInvest={() => setShowInvest(true)}
                onView={() => navigation.navigate('Portfolio')}
              />
              <ChannelCard
                icon="flag-outline" title="Goals" color="#A855F7"
                value={`£${goalsTotal.toLocaleString('en-GB',{minimumFractionDigits:2})}`}
                subtitle={`${goalsCount} active goal${goalsCount!==1?'s':''}`}
                onInvest={() => setShowInvest(true)}
                onView={() => navigation.navigate('GoalsFromInvest')}
              />
              <ChannelCard
                icon="leaf-outline" title="Savings Pot" color="#00D4A1"
                value={`£${savingsTotal.toLocaleString('en-GB',{minimumFractionDigits:2})}`}
                subtitle="Round-ups & top-ups"
                onInvest={() => setShowInvest(true)}
                onView={() => {}}
              />
            </View>

            {/* Tips */}
            <Text style={[S.sectionTitle, { marginTop:24 }]}>Investment Tips</Text>
            {[
              { icon:'bulb-outline',    color:'#F59E0B', title:'Diversify', desc:'Spread across stocks, ETFs and savings to reduce risk.' },
              { icon:'repeat-outline',  color:'#3B82F6', title:'Invest regularly', desc:'£25/week compounded over 10 years = £18,000+' },
              { icon:'flag-outline',    color:'#00D4A1', title:'Goal-linked', desc:'Tie every pound to a specific goal and deadline.' },
            ].map(tip => (
              <View key={tip.title} style={[S.tipCard, { borderLeftColor: tip.color }]}>
                <View style={[S.tipIcon, { backgroundColor: tip.color+'18' }]}>
                  <Ionicons name={tip.icon} size={20} color={tip.color} />
                </View>
                <View style={{ flex:1 }}>
                  <Text style={S.tipTitle}>{tip.title}</Text>
                  <Text style={S.tipDesc}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── AI MODE ── */}
        {mode === 'ai' && (
          <View style={S.body}>
            {/* AI Banner */}
            <LinearGradient colors={['#4F46E5','#7C3AED']} style={S.aiBanner}>
              <View style={S.aiBannerRow}>
                <View style={{ flex:1 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:6 }}>
                    <Ionicons name="sparkles" size={22} color="#fff" />
                    <Text style={S.aiBannerTitle}>HAY-M AI Advisor</Text>
                    <View style={S.betaBadge}><Text style={S.betaText}>BETA</Text></View>
                  </View>
                  <Text style={S.aiBannerSub}>AI analysis based on your portfolio and market conditions. Not regulated financial advice.</Text>
                </View>
                <View style={S.aiScoreBox}>
                  <Text style={S.aiScoreLabel}>Health</Text>
                  <Text style={S.aiScoreVal}>8.4</Text>
                  <Text style={S.aiScoreMax}>/10</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Risk Profile */}
            <View style={S.card}>
              <Text style={S.cardTitle}>Risk Profile</Text>
              <Text style={S.cardSub}>Picks update based on your selection</Text>
              <View style={S.riskRow}>
                {Object.entries(AI_PROFILES).map(([key, p]) => (
                  <TouchableOpacity key={key} style={[S.riskBtn, riskProfile===key && S.riskBtnActive]}
                    onPress={() => setRiskProfile(key)}>
                    <Ionicons name={p.icon} size={20} color={riskProfile===key ? colors.primary : colors.textLight} />
                    <Text style={[S.riskLabel, riskProfile===key && { color:colors.primary }]}>{p.label}</Text>
                    <Text style={S.riskDesc}>{p.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Allocation bar */}
              <Text style={[S.fieldLabel, { marginTop:16, marginBottom:8 }]}>Recommended Allocation</Text>
              <View style={S.allocBar}>
                {profile.allocation.map((seg,i) => (
                  <View key={i} style={{ flex:seg.pct, backgroundColor:seg.color, height:10 }}
                    {...(i===0 ? { style:[{ flex:seg.pct, backgroundColor:seg.color, height:10, borderTopLeftRadius:5, borderBottomLeftRadius:5 }] } : {})}
                    {...(i===profile.allocation.length-1 ? { style:[{ flex:seg.pct, backgroundColor:seg.color, height:10, borderTopRightRadius:5, borderBottomRightRadius:5 }] } : {})}
                  />
                ))}
              </View>
              <View style={S.allocLegend}>
                {profile.allocation.map((seg,i) => (
                  <View key={i} style={S.allocLegendItem}>
                    <View style={[S.allocDot, { backgroundColor:seg.color }]} />
                    <Text style={S.allocLabel}>{seg.label} {seg.pct}%</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* AI Picks */}
            <Text style={[S.sectionTitle, { marginHorizontal:20 }]}>AI Picks — {profile.label}</Text>
            <Text style={[S.sectionSub, { marginHorizontal:20, marginBottom:12 }]}>Based on current market conditions</Text>
            {profile.picks.map((pick, i) => <AIPickCard key={i} pick={pick} />)}

            {/* Auto-Invest */}
            <View style={S.card}>
              <View style={S.autoRow}>
                <View style={{ flex:1 }}>
                  <Text style={S.cardTitle}>Auto-Invest</Text>
                  <Text style={S.cardSub}>Invest automatically on a schedule</Text>
                </View>
                <TouchableOpacity onPress={() => setAutoInvest(v=>!v)}
                  style={[S.toggle, { backgroundColor: autoInvest ? colors.primary : colors.border }]}>
                  <View style={[S.toggleThumb, { left: autoInvest ? 26 : 3 }]} />
                </TouchableOpacity>
              </View>
              {autoInvest && (
                <View style={{ marginTop:16, gap:12 }}>
                  <View style={S.inputRow}>
                    <Text style={S.inputPrefix}>£</Text>
                    <TextInput style={S.input} keyboardType="numeric" value={autoAmount}
                      onChangeText={setAutoAmount} placeholderTextColor={colors.textLight} />
                  </View>
                  <View style={{ flexDirection:'row', gap:8 }}>
                    {['weekly','fortnightly','monthly'].map(f => (
                      <TouchableOpacity key={f} onPress={() => setAutoFreq(f)}
                        style={[S.freqBtn, autoFreq===f && S.freqBtnActive]}>
                        <Text style={[S.freqText, autoFreq===f && S.freqTextActive]}>{f.charAt(0).toUpperCase()+f.slice(1)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* AI Insights */}
            <View style={S.card}>
              <Text style={S.cardTitle}>AI Insights</Text>
              {[
                { icon:'bulb-outline',   color:'#F59E0B', bg:'#FEF3C7', text:`Portfolio up £${Math.abs(portfolioGain).toFixed(2)} — consider rebalancing into ETFs to lock in gains.` },
                { icon:'stats-chart',    color:'#3B82F6', bg:'#DBEAFE', text:`Based on your spending, you could invest an extra £${(savingsTotal*0.3).toFixed(0)}/month without impacting your budget.` },
                { icon:'flash-outline',  color:'#10B981', bg:'#D1FAE5', text:`S&P 500 ETFs outperforming FTSE 100 by 3.2% this quarter. Your ${riskProfile} profile suggests increasing VOO.` },
              ].map((ins,i) => (
                <View key={i} style={[S.insightRow, { backgroundColor:ins.bg, borderLeftColor:ins.color }]}>
                  <Ionicons name={ins.icon} size={18} color={ins.color} />
                  <Text style={S.insightText}>{ins.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <QuickInvestModal
        visible={showInvest}
        portfolioVal={portfolioVal} goalsTotal={goalsTotal} savingsTotal={savingsTotal}
        onClose={() => setShowInvest(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  container: { flex:1, backgroundColor:colors.background },
  hero: { paddingBottom:20 },
  heroTopRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, paddingVertical:16 },
  heroTitle: { fontSize:22, fontWeight:'900', color:colors.white },
  iconBtn: { padding:4 },
  heroStat: { minWidth:140, backgroundColor:'rgba(255,255,255,0.07)', borderRadius:14, padding:14 },
  heroStatLabel: { fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:'600', marginBottom:4 },
  heroStatVal: { fontSize:18, fontWeight:'900' },
  modeToggleWrap: { flexDirection:'row', marginHorizontal:20, backgroundColor:'rgba(255,255,255,0.08)', borderRadius:14, padding:4, gap:4 },
  modeBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, paddingVertical:10, borderRadius:11 },
  modeBtnActive: { backgroundColor:colors.white },
  modeBtnText: { fontSize:13, fontWeight:'700', color:'rgba(255,255,255,0.6)' },
  modeBtnTextActive: { color:colors.text },

  body: { paddingTop:20 },
  sectionTitle: { fontSize:16, fontWeight:'800', color:colors.text, paddingHorizontal:20, marginBottom:2 },
  sectionSub: { fontSize:13, color:colors.textSecondary, paddingHorizontal:20, marginBottom:14 },

  channelGrid: { paddingHorizontal:16, gap:12 },
  channelCard: {
    backgroundColor:colors.white, borderRadius:18, padding:18,
    borderLeftWidth:4, elevation:2,
    shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:6,
  },
  channelIconWrap: { width:44, height:44, borderRadius:14, alignItems:'center', justifyContent:'center', marginBottom:10 },
  channelTitle: { fontSize:12, color:colors.textSecondary, fontWeight:'600', marginBottom:2 },
  channelValue: { fontSize:22, fontWeight:'900', marginBottom:2 },
  channelSub: { fontSize:12, color:colors.textLight, marginBottom:14 },
  channelBtns: { flexDirection:'row', gap:8 },
  channelInvestBtn: { flex:1, height:38, borderRadius:12, alignItems:'center', justifyContent:'center' },
  channelInvestText: { fontSize:14, fontWeight:'700', color:colors.white },
  channelViewBtn: { width:38, height:38, borderRadius:12, borderWidth:1.5, alignItems:'center', justifyContent:'center' },

  tipCard: {
    flexDirection:'row', alignItems:'center', gap:12, marginHorizontal:16, marginBottom:10,
    backgroundColor:colors.white, borderRadius:16, padding:16, borderLeftWidth:4,
    elevation:1, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.04, shadowRadius:4,
  },
  tipIcon: { width:40, height:40, borderRadius:12, alignItems:'center', justifyContent:'center', flexShrink:0 },
  tipTitle: { fontSize:14, fontWeight:'800', color:colors.text, marginBottom:2 },
  tipDesc: { fontSize:12, color:colors.textSecondary, lineHeight:18 },

  // AI styles
  aiBanner: { marginHorizontal:16, marginTop:4, marginBottom:16, borderRadius:20, padding:20 },
  aiBannerRow: { flexDirection:'row', alignItems:'flex-start', gap:12 },
  aiBannerTitle: { fontSize:16, fontWeight:'900', color:colors.white },
  betaBadge: { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:6, paddingHorizontal:7, paddingVertical:2 },
  betaText: { fontSize:10, fontWeight:'800', color:colors.white },
  aiBannerSub: { fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:17 },
  aiScoreBox: { alignItems:'center', backgroundColor:'rgba(255,255,255,0.12)', borderRadius:14, padding:12, flexShrink:0 },
  aiScoreLabel: { fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:'700', marginBottom:2 },
  aiScoreVal: { fontSize:24, fontWeight:'900', color:colors.white },
  aiScoreMax: { fontSize:11, color:'rgba(255,255,255,0.5)' },

  card: { marginHorizontal:16, marginBottom:16, backgroundColor:colors.white, borderRadius:20, padding:18, elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.06, shadowRadius:6 },
  cardTitle: { fontSize:15, fontWeight:'800', color:colors.text, marginBottom:2 },
  cardSub: { fontSize:12, color:colors.textSecondary, marginBottom:0 },

  riskRow: { flexDirection:'row', gap:8, marginTop:14 },
  riskBtn: { flex:1, alignItems:'center', padding:12, borderRadius:16, borderWidth:1.5, borderColor:colors.border, backgroundColor:colors.background },
  riskBtnActive: { borderColor:colors.primary, backgroundColor:colors.primaryLight },
  riskLabel: { fontSize:12, fontWeight:'800', color:colors.text, marginTop:6, marginBottom:2 },
  riskDesc: { fontSize:10, color:colors.textLight, textAlign:'center', lineHeight:14 },

  allocBar: { flexDirection:'row', height:10, borderRadius:5, overflow:'hidden' },
  allocLegend: { flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:10 },
  allocLegendItem: { flexDirection:'row', alignItems:'center', gap:5 },
  allocDot: { width:8, height:8, borderRadius:4 },
  allocLabel: { fontSize:11, color:colors.textSecondary, fontWeight:'600' },

  pickCard: { marginHorizontal:16, marginBottom:12, backgroundColor:colors.white, borderRadius:18, padding:16, elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:5 },
  pickTop: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  pickTicker: { fontSize:18, fontWeight:'900', color:colors.text },
  pickName: { fontSize:12, color:colors.textLight, marginTop:2 },
  actionChip: { paddingHorizontal:8, paddingVertical:3, borderRadius:8 },
  actionText: { fontSize:11, fontWeight:'800' },
  pickRet: { fontSize:14, fontWeight:'900' },
  pickRisk: { fontSize:11, fontWeight:'700', marginTop:2 },
  pickNote: { fontSize:12, color:colors.textSecondary, lineHeight:18, marginBottom:10 },
  confRow: { flexDirection:'row', justifyContent:'space-between', marginBottom:5 },
  confLabel: { fontSize:11, color:colors.textLight, fontWeight:'600' },
  confPct: { fontSize:11, fontWeight:'900', color:colors.text },
  confBar: { height:5, backgroundColor:colors.background, borderRadius:3, overflow:'hidden' },
  confFill: { height:'100%', borderRadius:3 },

  autoRow: { flexDirection:'row', alignItems:'center' },
  toggle: { width:52, height:28, borderRadius:14, justifyContent:'center', position:'relative' },
  toggleThumb: { position:'absolute', width:22, height:22, borderRadius:11, backgroundColor:colors.white, top:3, shadowColor:'#000', shadowOpacity:0.2, shadowRadius:2, shadowOffset:{width:0,height:1}, elevation:2 },
  freqBtn: { flex:1, paddingVertical:8, borderRadius:10, backgroundColor:colors.background, alignItems:'center' },
  freqBtnActive: { backgroundColor:colors.secondary },
  freqText: { fontSize:12, fontWeight:'700', color:colors.textSecondary },
  freqTextActive: { color:colors.white },

  insightRow: { flexDirection:'row', gap:10, padding:12, borderRadius:12, borderLeftWidth:3, marginBottom:10, alignItems:'flex-start' },
  insightText: { flex:1, fontSize:12, color:colors.text, lineHeight:18 },

  fieldLabel: { fontSize:12, fontWeight:'700', color:colors.textSecondary, marginBottom:6 },
  inputRow: { flexDirection:'row', alignItems:'center', backgroundColor:colors.background, borderRadius:14, borderWidth:1.5, borderColor:colors.border, paddingHorizontal:14, height:50 },
  inputPrefix: { fontSize:16, fontWeight:'700', color:colors.textSecondary, marginRight:4 },
  input: { flex:1, fontSize:16, color:colors.text, fontWeight:'600' },

  // Modal
  modalOverlay: { flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'flex-end' },
  modalBox: { backgroundColor:colors.white, borderTopLeftRadius:28, borderTopRightRadius:28, padding:28, paddingBottom:40 },
  modalHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 },
  modalTitle: { fontSize:20, fontWeight:'900', color:colors.text, marginBottom:4 },
  modalSub: { fontSize:13, color:colors.textSecondary },
  closeBtn: { backgroundColor:colors.background, width:36, height:36, borderRadius:10, alignItems:'center', justifyContent:'center' },
  successIcon: { marginBottom:16 },
  destRow: { flexDirection:'row', alignItems:'center', gap:12, padding:14, borderRadius:16, borderWidth:1.5, borderColor:colors.border, backgroundColor:colors.white, marginBottom:10 },
  destRowActive: { borderColor:colors.primary, backgroundColor:colors.primaryLight },
  destIcon: { width:40, height:40, borderRadius:12, alignItems:'center', justifyContent:'center' },
  destLabel: { flex:1, fontSize:14, fontWeight:'700', color:colors.text },
  destBal: { fontSize:13, fontWeight:'700', color:colors.success },
  quickRow: { flexDirection:'row', gap:8 },
  quickChip: { flex:1, paddingVertical:8, borderRadius:10, backgroundColor:colors.background, alignItems:'center' },
  quickChipActive: { backgroundColor:colors.secondary },
  quickChipText: { fontSize:13, fontWeight:'700', color:colors.text },
  quickChipTextActive: { color:colors.white },
  primaryBtn: { height:52, borderRadius:16, backgroundColor:colors.primary, alignItems:'center', justifyContent:'center', marginTop:16 },
  primaryBtnText: { fontSize:16, fontWeight:'800', color:colors.secondary },

  // Beginner Starter
  beginnerCard: {
    marginHorizontal: 16, marginBottom: 20,
    backgroundColor: '#EFF6FF',
    borderRadius: 18, padding: 18,
    borderLeftWidth: 4, borderLeftColor: '#3B82F6',
  },
  beginnerTitle: { fontSize: 15, fontWeight: '800', color: '#1E3A5F', marginBottom: 3 },
  beginnerSub: { fontSize: 13, color: '#4B6FA0', marginBottom: 14 },
  starterOption: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: 14, padding: 13,
    borderLeftWidth: 4, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  starterLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  starterIcon: { fontSize: 22 },
  starterName: { fontSize: 13, fontWeight: '700', color: colors.text },
  starterReturns: { fontSize: 12, fontWeight: '700' },
  starterDetail: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  starterBtn: {
    borderWidth: 1.5, borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 12, marginLeft: 8,
  },
  starterBtnText: { fontSize: 12, fontWeight: '700' },
});
