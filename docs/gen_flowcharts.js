'use strict';
const pptxgen = require('C:/nvm4w/nodejs/node_modules/pptxgenjs');
const pres = new pptxgen();
pres.layout  = 'LAYOUT_WIDE'; // 13.3" × 7.5"
pres.author  = 'HAY-M';
pres.title   = 'HAY-M System Flow Charts';

// ── COLOURS ────────────────────────────────────────────────────────────────
const BG   = '0A1628';
const MINT = '00D4A1';
const AMB  = 'FFB347';
const WHT  = 'FFFFFF';
const PF   = '0D2137';   // process fill
const DF   = '142D52';   // decision fill
const TBG  = '060F1E';   // title-bar bg
const DKT  = '071020';   // dark text on mint
const GRY  = '4A6A8A';   // muted label colour

// ── LAYOUT CONSTANTS ───────────────────────────────────────────────────────
const W    = 13.3;
const NW   = 3.1;    // node width
const TH   = 0.33;   // terminator height
const PH   = 0.38;   // process height
const DH   = 0.50;   // decision height
const GAP  = 0.20;   // arrow gap between nodes

const MX   = (W - NW) / 2;      // 5.1  — main column left-x
const MCX  = MX + NW / 2;       // 6.65 — main column centre-x
const RX   = 9.7;                // right branch left-x
const RCX  = RX + NW / 2;       // 11.25
const LX   = 0.35;               // left branch left-x
const LCX  = LX + NW / 2;       // 0.9
const CY   = 0.70;               // content start y

// ── PRIMITIVE HELPERS ──────────────────────────────────────────────────────
function bg(sl) { sl.background = { color: BG }; }

function titleBar(sl, text) {
  sl.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:W, h:0.60, fill:{color:TBG}, line:{color:TBG} });
  sl.addShape(pres.shapes.RECTANGLE, { x:0, y:0.57, w:W, h:0.03, fill:{color:MINT}, line:{color:MINT} });
  sl.addText(text, { x:0.35, y:0, w:W-0.5, h:0.60, fontSize:17, bold:true, color:MINT, align:'left', valign:'middle', margin:0 });
}

function term(sl, x, y, text, w) {
  w = w || NW;
  sl.addShape(pres.shapes.FLOWCHART_TERMINATOR, { x, y, w, h:TH, fill:{color:MINT}, line:{color:MINT,width:0.5} });
  sl.addText(text, { x, y, w, h:TH, fontSize:8, bold:true, color:DKT, align:'center', valign:'middle', margin:0 });
  return y + TH;
}

function proc(sl, x, y, text, w) {
  w = w || NW;
  sl.addShape(pres.shapes.FLOWCHART_PROCESS, { x, y, w, h:PH, fill:{color:PF}, line:{color:MINT,width:1} });
  sl.addText(text, { x, y, w, h:PH, fontSize:7.5, color:WHT, align:'center', valign:'middle', margin:2 });
  return y + PH;
}

function dec(sl, x, y, text, w) {
  w = w || NW;
  sl.addShape(pres.shapes.FLOWCHART_DECISION, { x, y, w, h:DH, fill:{color:DF}, line:{color:AMB,width:1.5} });
  sl.addText(text, { x, y, w, h:DH, fontSize:7.5, bold:true, color:WHT, align:'center', valign:'middle', margin:2 });
  return y + DH;
}

function arr(sl, x1, y1, x2, y2, col) {
  col = col || MINT;
  sl.addShape(pres.shapes.LINE, { x:x1, y:y1, w:x2-x1, h:y2-y1, line:{color:col, width:1.5, endArrowType:'arrow'} });
}

function lbl(sl, x, y, text, col) {
  col = col || MINT;
  sl.addText(text, { x, y, w:0.55, h:0.18, fontSize:6.5, bold:true, color:col, align:'center', valign:'middle' });
}

// Vertical connector: centre-x, from bottom of last node to top of next
function va(sl, cx, fromY, toY) { arr(sl, cx, fromY, cx, toY); }
// Horizontal connector
function ha(sl, fromX, y, toX) { arr(sl, fromX, y, toX, y); }

// Small muted note (for loop-back annotations)
function note(sl, x, y, text) {
  sl.addText(text, { x, y, w:NW, h:0.20, fontSize:6.5, italic:true, color:GRY, align:'center', valign:'middle' });
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl);

  // Bottom accent bar
  sl.addShape(pres.shapes.RECTANGLE, { x:0, y:7.1, w:W, h:0.05, fill:{color:MINT}, line:{color:MINT} });

  // Diamond logo shape
  sl.addShape(pres.shapes.DIAMOND, { x:5.9, y:0.9, w:1.5, h:1.2, fill:{color:MINT}, line:{color:MINT} });
  sl.addText('H', { x:5.9, y:0.9, w:1.5, h:1.2, fontSize:26, bold:true, color:DKT, align:'center', valign:'middle', margin:0 });

  sl.addText('HAY-M', { x:1, y:1.95, w:W-2, h:1.3, fontSize:64, bold:true, color:MINT, align:'center', valign:'middle' });
  sl.addText('System Flow Charts', { x:1, y:3.15, w:W-2, h:0.75, fontSize:26, color:WHT, align:'center', valign:'middle' });
  sl.addText('Micro-Savings & AI-Powered Investment Platform', { x:1, y:3.85, w:W-2, h:0.45, fontSize:15, color:'5A8AAA', align:'center', valign:'middle' });

  sl.addShape(pres.shapes.LINE, { x:2.8, y:4.55, w:7.7, h:0, line:{color:MINT,width:1} });
  sl.addText('April 2026  |  Confidential', { x:1, y:4.65, w:W-2, h:0.40, fontSize:13, color:GRY, align:'center', valign:'middle' });

  // Legend row
  const LY = 5.5;
  sl.addText('Legend:', { x:0.5, y:LY, w:0.9, h:0.30, fontSize:9, bold:true, color:WHT });
  sl.addShape(pres.shapes.FLOWCHART_TERMINATOR, { x:1.5, y:LY, w:2.0, h:0.30, fill:{color:MINT}, line:{color:MINT} });
  sl.addText('Start / End', { x:1.5, y:LY, w:2.0, h:0.30, fontSize:8, bold:true, color:DKT, align:'center', valign:'middle', margin:0 });
  sl.addShape(pres.shapes.FLOWCHART_PROCESS, { x:3.8, y:LY, w:2.0, h:0.30, fill:{color:PF}, line:{color:MINT,width:1} });
  sl.addText('Process Step', { x:3.8, y:LY, w:2.0, h:0.30, fontSize:8, color:WHT, align:'center', valign:'middle', margin:0 });
  sl.addShape(pres.shapes.FLOWCHART_DECISION, { x:6.1, y:LY, w:2.2, h:0.30, fill:{color:DF}, line:{color:AMB,width:1.5} });
  sl.addText('Decision', { x:6.1, y:LY, w:2.2, h:0.30, fontSize:8, bold:true, color:WHT, align:'center', valign:'middle', margin:0 });
  sl.addShape(pres.shapes.LINE, { x:8.6, y:LY+0.15, w:1.0, h:0, line:{color:MINT,width:1.5,endArrowType:'arrow'} });
  sl.addText('Arrow / Flow', { x:9.7, y:LY, w:1.5, h:0.30, fontSize:8, color:WHT, valign:'middle' });
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — SIGNUP & ONBOARDING FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Signup & Onboarding Flow');

  let y = CY;
  const cx = MCX;

  // 1. Start
  term(sl, MX, y, 'User Visits App / Website'); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  // 2
  proc(sl, MX, y, 'Fills Signup Form\n(Name, Email, Password)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  // 3
  proc(sl, MX, y, 'POST /api/auth/signup'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  // 4 Decision: Valid Input?
  const d1y = y;
  dec(sl, MX, d1y, 'Valid Input?');
  // NO branch → right
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d1y+DH/2-PH/2, 'Show Validation Errors');
  note(sl, RX, d1y+DH/2+PH/2, '↑ loops back to form');
  // YES branch ↓
  lbl(sl, cx-0.32, d1y+DH+0.01, 'YES', MINT);
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;
  // 5
  proc(sl, MX, y, 'Hash Password (bcrypt 12 rounds)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  // 6
  proc(sl, MX, y, 'Create User in MongoDB'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  // 7
  proc(sl, MX, y, 'Sign JWT Token'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  // 8
  proc(sl, MX, y, 'Store Token Client-Side\n(AsyncStorage / sessionStorage)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  // 9 Decision: hasOnboarded?
  const d2y = y;
  dec(sl, MX, d2y, 'hasOnboarded = true?');
  // YES ↓
  lbl(sl, cx-0.32, d2y+DH+0.01, 'YES', MINT);
  va(sl, cx, d2y+DH, d2y+DH+GAP); y = d2y+DH+GAP;
  // NO → right (Show Onboarding → Set hasOnboarded → rejoin)
  ha(sl, MX+NW, d2y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d2y+DH/2-0.17, 'NO', 'FF6B6B');
  const rb2y = d2y+DH/2-PH/2;
  proc(sl, RX, rb2y, 'Show Onboarding\n(4-slide mobile / 5-step web)');
  va(sl, RCX, rb2y+PH, rb2y+PH+GAP);
  proc(sl, RX, rb2y+PH+GAP, 'Set hasOnboarded = true');
  // rejoin arrow: down then left to end node
  arr(sl, RCX, rb2y+PH+GAP+PH, RCX, y+TH/2);
  arr(sl, RCX, y+TH/2, MX+NW, y+TH/2);

  // 10. End
  term(sl, MX, y, 'Navigate to Dashboard');
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3 — LOGIN & SESSION RESTORATION FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Login & Session Restoration Flow');

  // ── LEFT HALF: Token / session-restore path ───────────────────────
  const LCOLx = 0.3;
  const LW = 3.2;
  const lcx = LCOLx + LW/2;
  let ly = CY;

  sl.addText('SESSION RESTORE PATH', { x:LCOLx, y:CY-0.02, w:LW, h:0.18, fontSize:6.5, bold:true, color:GRY, align:'center' });
  ly += 0.18;

  term(sl, LCOLx, ly, 'App / Page Load', LW); va(sl,lcx,ly+TH,ly+TH+GAP); ly+=TH+GAP;

  const ld1y = ly;
  dec(sl, LCOLx, ld1y, 'Token in Storage?', LW);
  // YES ↓
  lbl(sl, lcx-0.32, ld1y+DH+0.01, 'YES', MINT);
  va(sl, lcx, ld1y+DH, ld1y+DH+GAP); ly = ld1y+DH+GAP;
  proc(sl, LCOLx, ly, 'GET /api/auth/me', LW); va(sl,lcx,ly+PH,ly+PH+GAP); ly+=PH+GAP;

  const ld2y = ly;
  dec(sl, LCOLx, ld2y, 'Response Status?', LW);
  // 200 OK ↓
  lbl(sl, lcx-0.36, ld2y+DH+0.01, '200 OK', MINT);
  va(sl, lcx, ld2y+DH, ld2y+DH+GAP); ly = ld2y+DH+GAP;
  proc(sl, LCOLx, ly, 'setUser(freshData)\n→ Dashboard', LW);

  // 401/403 → right side label
  ha(sl, LCOLx+LW, ld2y+DH/2-0.12, LCOLx+LW+1.2);
  sl.addText('401/403:\nclearSession()\n→ Login Screen', { x:LCOLx+LW+0.05, y:ld2y, w:1.5, h:0.55, fontSize:6.5, color:'FF6B6B', valign:'middle' });
  // Network Error ↑ small label
  sl.addText('Network Error:\nFallback Cached\nUser → Dashboard', { x:LCOLx+LW+0.05, y:ld2y+DH/2, w:1.5, h:0.55, fontSize:6.5, color:AMB, valign:'middle' });

  // NO (No token) → Login Screen
  ha(sl, LCOLx+LW, ld1y+DH/2, LCOLx+LW+0.6);
  lbl(sl, LCOLx+LW+0.02, ld1y+DH/2-0.17, 'NO', 'FF6B6B');
  arr(sl, LCOLx+LW+0.6, ld1y+DH/2, LCOLx+LW+0.6, ld1y+DH/2+1.2); // down to login path

  // ── DIVIDER ────────────────────────────────────────────────────────
  sl.addShape(pres.shapes.LINE, { x:4.05, y:CY, w:0, h:6.5, line:{color:GRY, width:0.5, dashType:'dash'} });

  // ── RIGHT HALF: Manual login path ────────────────────────────────
  const RCOLx = 4.3;
  const RW = 3.2;
  const rcx = RCOLx + RW/2;
  let ry = CY;

  sl.addText('MANUAL LOGIN PATH', { x:RCOLx, y:CY-0.02, w:RW, h:0.18, fontSize:6.5, bold:true, color:GRY, align:'center' });
  ry += 0.18;

  proc(sl, RCOLx, ry, 'Show Login Screen', RW); va(sl,rcx,ry+PH,ry+PH+GAP); ry+=PH+GAP;
  proc(sl, RCOLx, ry, 'User Enters Email + Password', RW); va(sl,rcx,ry+PH,ry+PH+GAP); ry+=PH+GAP;
  proc(sl, RCOLx, ry, 'POST /api/auth/login', RW); va(sl,rcx,ry+PH,ry+PH+GAP); ry+=PH+GAP;

  const rd1y = ry;
  dec(sl, RCOLx, rd1y, 'Credentials Valid?', RW);

  // NO → right
  const rbrx = RCOLx+RW+0.25;
  ha(sl, RCOLx+RW, rd1y+DH/2, rbrx+0.05);
  lbl(sl, RCOLx+RW+0.03, rd1y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, rbrx, rd1y+DH/2-PH/2, 'Show Error Message', 2.8);
  note(sl, rbrx, rd1y+DH/2+PH/2, '↑ loops back');

  // YES ↓
  lbl(sl, rcx-0.32, rd1y+DH+0.01, 'YES', MINT);
  va(sl, rcx, rd1y+DH, rd1y+DH+GAP); ry = rd1y+DH+GAP;
  proc(sl, RCOLx, ry, 'Store JWT + User\n(AsyncStorage / sessionStorage)', RW); va(sl,rcx,ry+PH,ry+PH+GAP); ry+=PH+GAP;
  term(sl, RCOLx, ry, 'Navigate to Dashboard', RW);
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4 — PASSWORD RESET FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Password Reset Flow');

  let y = CY;
  const cx = MCX;

  term(sl, MX, y, "User Clicks 'Forgot Password?'"); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  proc(sl, MX, y, 'Enter Email → POST /api/auth/forgot-password'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d1y = y;
  dec(sl, MX, d1y, 'Email Found?');
  // NO → right
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d1y+DH/2-PH/2, 'Return Generic Success\n(security — no leakage)');

  lbl(sl, cx-0.32, d1y+DH+0.01, 'YES', MINT);
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;

  proc(sl, MX, y, 'Generate crypto.randomBytes(32) token'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Store resetToken + resetTokenExpires\n(now + 1 hr)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Dev: Return devToken in response\nProd: Send Email with Reset Link'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'User Opens: /reset-password?token=…'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Enter New Password → POST /api/auth/reset-password'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d2y = y;
  dec(sl, MX, d2y, 'Token Valid & Not Expired?');
  // NO → right
  ha(sl, MX+NW, d2y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d2y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d2y+DH/2-PH/2, "Show 'Token Expired' Error");

  lbl(sl, cx-0.32, d2y+DH+0.01, 'YES', MINT);
  va(sl, cx, d2y+DH, d2y+DH+GAP); y = d2y+DH+GAP;

  proc(sl, MX, y, 'Hash New Password (bcrypt)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Save Password, Clear resetToken Fields'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, "Success → Navigate to Login");
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5 — AUTHENTICATED API REQUEST FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Authenticated API Request Flow');

  let y = CY;
  const cx = MCX;

  term(sl, MX, y, 'User Triggers Action (e.g. Load Goals)'); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  proc(sl, MX, y, 'Client Service Called (e.g. goalService.getGoals())'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Axios Request Interceptor:\nRead Token from Storage'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Add Authorization: Bearer <token> Header'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'HTTPS Request → Express Server'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'protect Middleware: jwt.verify(token)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d1y = y;
  dec(sl, MX, d1y, 'Token Valid?');
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d1y+DH/2-PH/2, 'Return 401 Unauthorized\n→ clearSession()');

  lbl(sl, cx-0.32, d1y+DH+0.01, 'YES', MINT);
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;

  proc(sl, MX, y, 'Attach req.user from decoded token'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d2y = y;
  dec(sl, MX, d2y, 'Plan Gate Required?');
  ha(sl, MX+NW, d2y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d2y+DH/2-0.17, 'YES', AMB);

  // Plan check branch
  const pb_y = d2y+DH/2-DH/2;
  dec(sl, RX, pb_y, 'User Plan Sufficient?');
  ha(sl, RX+NW, pb_y+DH/2, RX+NW+0.15);
  sl.addText('NO:\n403 → Upgrade CTA', { x:RX+NW+0.18, y:pb_y, w:2.2, h:DH, fontSize:7, color:'FF6B6B', valign:'middle' });
  lbl(sl, RCX-0.32, pb_y+DH+0.01, 'YES', MINT);

  lbl(sl, cx-0.35, d2y+DH+0.01, 'NO', MINT);
  va(sl, cx, d2y+DH, d2y+DH+GAP); y = d2y+DH+GAP;

  proc(sl, MX, y, 'Controller → Mongoose / PostgreSQL Query'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Return JSON Response'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, 'UI State Updated → Re-render');
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6 — SAVINGS GOAL LIFECYCLE
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Savings Goal Lifecycle');

  let y = CY;
  const cx = MCX;

  term(sl, MX, y, "User Taps 'Create Goal'"); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  proc(sl, MX, y, 'Opens Create Goal Modal / Form'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Fills: Name, Target, Deadline, Icon, Colour'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d1y = y;
  dec(sl, MX, d1y, 'Free Plan & Goal Count ≥ 1?');
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'YES', 'FF6B6B');
  proc(sl, RX, d1y+DH/2-PH/2, 'Return 403 → Show\nUpgrade to Plus CTA');

  lbl(sl, cx-0.32, d1y+DH+0.01, 'NO', MINT);
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;

  proc(sl, MX, y, 'POST /api/goals'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Goal Created in MongoDB\n(current=0, isCompleted=false)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, 'Goal Card Appears in UI'); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;

  // Milestone label
  sl.addShape(pres.shapes.LINE, { x:MX-0.5, y:y-0.1, w:NW+1.0, h:0, line:{color:GRY,width:0.5,dashType:'dash'} });
  sl.addText('── ADD FUNDS FLOW ──', { x:MX, y:y-0.02, w:NW, h:0.20, fontSize:6.5, color:GRY, align:'center' });

  proc(sl, MX, y, "User Taps '+ Add Funds'"); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'POST /api/goals/:id/funds { amount }'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'goal.current += amount'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d2y = y;
  dec(sl, MX, d2y, 'current ≥ target?');
  ha(sl, MX+NW, d2y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d2y+DH/2-0.17, 'YES', MINT);
  proc(sl, RX, d2y+DH/2-PH/2, 'isCompleted = true\ncompletedAt = now');

  lbl(sl, cx-0.32, d2y+DH+0.01, 'NO', 'FF6B6B');
  va(sl, cx, d2y+DH, d2y+DH+GAP); y = d2y+DH+GAP;

  proc(sl, MX, y, 'Trigger Push Notification\n(50% or 100% milestone)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, "Goal Card Updates — Progress Bar / 'Goal Achieved!'");
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 7 — SEND MONEY (P2P TRANSFER) FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Send Money (P2P Transfer) Flow');

  let y = CY;
  const cx = MCX;

  term(sl, MX, y, "User Taps 'Send' in Payments Screen"); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  proc(sl, MX, y, 'Opens Send Money Modal'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Enters: Recipient Email, Amount, Note'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d1y = y;
  dec(sl, MX, d1y, 'Inputs Valid?');
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d1y+DH/2-PH/2, 'Show Validation Error');
  note(sl, RX, d1y+DH/2+PH/2, '↑ loops back to form');

  lbl(sl, cx-0.32, d1y+DH+0.01, 'YES', MINT);
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;

  proc(sl, MX, y, 'POST /api/transactions/send'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Find Recipient by Email in MongoDB'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d2y = y;
  dec(sl, MX, d2y, 'Recipient Found?');
  ha(sl, MX+NW, d2y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d2y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d2y+DH/2-PH/2, 'Return 404 Error');

  lbl(sl, cx-0.32, d2y+DH+0.01, 'YES', MINT);
  va(sl, cx, d2y+DH, d2y+DH+GAP); y = d2y+DH+GAP;

  proc(sl, MX, y, 'Create DEBIT Transaction for Sender'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Create CREDIT Transaction for Recipient'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'pushService.sendNotification(recipientId, payload)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d3y = y;
  dec(sl, MX, d3y, 'Recipient Has Push Token?');
  ha(sl, MX+NW, d3y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d3y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d3y+DH/2-PH/2, 'In-app notification only');

  lbl(sl, cx-0.32, d3y+DH+0.01, 'YES', MINT);
  va(sl, cx, d3y+DH, d3y+DH+GAP); y = d3y+DH+GAP;

  proc(sl, MX, y, 'POST to Expo Push API'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, "Success: '£X sent successfully!'");
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 8 — PUSH NOTIFICATION DISPATCH FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Push Notification Dispatch Flow');

  let y = CY;
  const cx = MCX;

  term(sl, MX, y, 'System Event Occurs\n(goal funded, transaction, etc.)'); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  proc(sl, MX, y, 'Controller calls\npushService.sendNotification(userId, payload)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, "Notification.create({ user, type, title,\nmessage, read: false })"); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, "User.findById(userId)\n.select('pushToken notificationPrefs')"); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d1y = y;
  dec(sl, MX, d1y, 'User Has Push Token?');
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'NO', 'FF6B6B');
  term(sl, RX, d1y+DH/2-TH/2, 'In-app only — End');

  lbl(sl, cx-0.32, d1y+DH+0.01, 'YES', MINT);
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;

  proc(sl, MX, y, 'Check Notification Preference Flag'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d2y = y;
  dec(sl, MX, d2y, 'Preference Enabled?');
  ha(sl, MX+NW, d2y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d2y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d2y+DH/2-PH/2, 'Skip push — notification\nsaved to DB only');

  lbl(sl, cx-0.32, d2y+DH+0.01, 'YES', MINT);
  va(sl, cx, d2y+DH, d2y+DH+GAP); y = d2y+DH+GAP;

  proc(sl, MX, y, 'POST https://exp.host/--/api/v2/push/send'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d3y = y;
  dec(sl, MX, d3y, 'Push Sent Successfully?');
  ha(sl, MX+NW, d3y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d3y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d3y+DH/2-PH/2, 'Log error — notification\nstill saved in DB');

  lbl(sl, cx-0.32, d3y+DH+0.01, 'YES', MINT);
  va(sl, cx, d3y+DH, d3y+DH+GAP); y = d3y+DH+GAP;

  proc(sl, MX, y, 'Device Receives Native Notification'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, 'User Sees Push + In-App Notification');
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 9 — WALLET TOP-UP FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Wallet Top-Up Flow');

  let y = CY;
  const cx = MCX;

  term(sl, MX, y, 'User Opens Wallet Screen'); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  proc(sl, MX, y, 'Selects Active Card from Carousel'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, "Taps 'Top Up' Button"); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Modal Opens: Amount Input +\nQuick Chips (£10 / £25 / £50 / £100)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, "Enters Amount → Taps 'Add to Card'"); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d1y = y;
  dec(sl, MX, d1y, 'Amount > 0?');
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d1y+DH/2-PH/2, 'Keep button disabled\n— show error');

  lbl(sl, cx-0.32, d1y+DH+0.01, 'YES', MINT);
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;

  proc(sl, MX, y, 'POST /api/wallet/:id/topup { amount }'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'card.balance += amount; card.save()'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Return Updated Card Document'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, "Success Alert: '£X added to ••••XXXX'");
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 10 — PLAN UPGRADE & FEATURE ACCESS FLOW
// ═══════════════════════════════════════════════════════════════════════════
{
  const sl = pres.addSlide();
  bg(sl); titleBar(sl, 'Plan Upgrade & Feature Access Flow');

  let y = CY;
  const cx = MCX;

  term(sl, MX, y, 'User Tries to Access Plus / Pro Feature'); va(sl,cx,y+TH,y+TH+GAP); y+=TH+GAP;
  proc(sl, MX, y, 'API Request Made with Bearer Token'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'protect Middleware: Validates JWT'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'requirePlan Middleware: PLAN_RANK Check'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d1y = y;
  dec(sl, MX, d1y, 'PLAN_RANK[user.plan]\n≥ PLAN_RANK[required]?');

  // YES → right: allow
  ha(sl, MX+NW, d1y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d1y+DH/2-0.17, 'YES', MINT);
  term(sl, RX, d1y+DH/2-TH/2, 'Allow Access → Feature Loads');

  // NO ↓
  lbl(sl, cx-0.32, d1y+DH+0.01, 'NO', 'FF6B6B');
  va(sl, cx, d1y+DH, d1y+DH+GAP); y = d1y+DH+GAP;

  proc(sl, MX, y, 'Return 403: { requiredPlan, currentPlan }'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Client Shows Upgrade CTA / Toast'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'User Navigates to /upgrade or UpgradeScreen'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'User Selects Plan (Plus £2.99/mo or Pro £6.99/mo)'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  proc(sl, MX, y, 'Stripe Checkout / Payment Processing'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;

  const d2y = y;
  dec(sl, MX, d2y, 'Payment Successful?');
  ha(sl, MX+NW, d2y+DH/2, RX);
  lbl(sl, MX+NW+0.02, d2y+DH/2-0.17, 'NO', 'FF6B6B');
  proc(sl, RX, d2y+DH/2-PH/2, 'Show Payment Error');

  lbl(sl, cx-0.32, d2y+DH+0.01, 'YES', MINT);
  va(sl, cx, d2y+DH, d2y+DH+GAP); y = d2y+DH+GAP;

  proc(sl, MX, y, 'Update User.plan in MongoDB'); va(sl,cx,y+PH,y+PH+GAP); y+=PH+GAP;
  term(sl, MX, y, 'Features Unlock — User Redirected to Feature');
}


// ── WRITE FILE ─────────────────────────────────────────────────────────────
pres.writeFile({ fileName: 'D:/mobileapp/docs/HAY-M_Flowcharts.pptx' })
  .then(() => console.log('✅  HAY-M_Flowcharts.pptx saved'))
  .catch(e => { console.error('❌ ', e); process.exit(1); });
