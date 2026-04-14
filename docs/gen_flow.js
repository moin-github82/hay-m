const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat
} = require('C:/nvm4w/nodejs/node_modules/docx');
const fs = require('fs');

const NAVY = '0A1628';
const MINT = '00D4A1';
const WHITE = 'FFFFFF';
const LIGHT_BG = 'F0F4F8';
const MID_GREY = '64748B';
const DARK_TEXT = '1E293B';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, color: NAVY, font: 'Arial' })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: '1C3D6E', font: 'Arial' })] });
}
function body(text) {
  return new Paragraph({ spacing: { after: 100 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial' })] });
}
function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } }));
}

// ── Flow diagram as a styled table with boxes and arrows ──────────────────────

function flowBox(label, sublabel, bg = NAVY, fg = WHITE, subFg = 'A0AEC0') {
  return new TableCell({
    borders,
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    verticalAlign: 'center',
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, font: 'Arial', size: 20, bold: true, color: fg })] }),
      ...(sublabel ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sublabel, font: 'Arial', size: 16, color: subFg })] })] : []),
    ]
  });
}

function arrowCell(direction = 'down', span = 1) {
  const sym = direction === 'down' ? '\u2193' : direction === 'right' ? '\u2192' : direction === 'left' ? '\u2190' : '\u2193';
  return new TableCell({
    borders: noBorders,
    shading: { fill: WHITE, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 60, right: 60 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sym, font: 'Arial', size: 28, color: MINT, bold: true })] })]
  });
}

function labelCell(text, fg = MID_GREY) {
  return new TableCell({
    borders: noBorders,
    shading: { fill: WHITE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, font: 'Arial', size: 18, color: fg, italics: true })] })]
  });
}

function emptyCell(w = 1000, bg = WHITE) {
  return new TableCell({
    borders: noBorders, shading: { fill: bg, type: ShadingType.CLEAR },
    width: { size: w, type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 40, right: 40 },
    children: [new Paragraph({ children: [new TextRun('')] })]
  });
}

function flowDiagram(title, rows, colWidths) {
  return [
    h2(title),
    ...spacer(1),
    new Table({
      width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
      columnWidths: colWidths,
      rows: rows.map(cells => new TableRow({ children: cells }))
    }),
    ...spacer(2),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW 1: User Auth Flow
// ─────────────────────────────────────────────────────────────────────────────
function authFlow() {
  const W = 9100;
  const col3 = [2000, 1000, 6100];
  const col2 = [4500, 4600];
  const col1 = [9100];

  const box = (t, s, bg, fg) => flowBox(t, s, bg, fg);
  const arr = () => arrowCell('down');
  const lbl = (t) => labelCell(t);
  const emp = (w) => emptyCell(w, WHITE);

  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    rows: [
      // Title row
      new TableRow({ children: [new TableCell({
        borders: noBorders, width: { size: W, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun('')] })]
      })] }),
    ]
  });
}

// ── Build the actual flow diagrams as ASCII-art-style table layouts ───────────

function buildFlow(title, steps, colWidths) {
  const W = colWidths.reduce((a, b) => a + b, 0);
  const stepRows = [];
  steps.forEach((step, i) => {
    // Main row
    stepRows.push(new TableRow({
      children: step.cells.map((cell, ci) => {
        if (cell.type === 'box') {
          return new TableCell({
            borders: { top: border, bottom: border, left: border, right: border },
            shading: { fill: cell.bg || '1C3D6E', type: ShadingType.CLEAR },
            width: { size: colWidths[ci], type: WidthType.DXA },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cell.label, font: 'Arial', size: 20, bold: true, color: cell.fg || WHITE })] }),
              ...(cell.sub ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cell.sub, font: 'Arial', size: 16, color: cell.subFg || 'A0AEC0' })] })] : []),
            ]
          });
        } else if (cell.type === 'arrow') {
          return new TableCell({
            borders: noBorders, width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 40, right: 40 },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cell.dir === 'right' ? '\u2192' : cell.dir === 'left' ? '\u2190' : cell.dir === 'both' ? '\u2194' : '\u2193', font: 'Arial', size: 28, bold: true, color: MINT })] })]
          });
        } else if (cell.type === 'label') {
          return new TableCell({
            borders: noBorders, width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cell.text, font: 'Arial', size: 18, color: cell.color || MID_GREY, italics: true })] })]
          });
        } else {
          return new TableCell({
            borders: noBorders, width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: cell.bg || WHITE, type: ShadingType.CLEAR }, margins: { top: 40, bottom: 40, left: 40, right: 40 },
            children: [new Paragraph({ children: [new TextRun({ text: cell.text || '', font: 'Arial', size: 18, color: cell.color || DARK_TEXT })] })]
          });
        }
      })
    }));
  });

  return [
    h2(title),
    ...spacer(1),
    new Table({
      width: { size: W, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: stepRows,
    }),
    ...spacer(2),
  ];
}

// ── Vertical flow helper (single column of boxes with arrows) ──────────────────
function vFlow(title, steps) {
  const W = 9100;
  const colWidths = [9100];
  const rows = [];
  steps.forEach((step, i) => {
    rows.push(new TableRow({ children: [new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      shading: { fill: step.bg || '1C3D6E', type: ShadingType.CLEAR },
      width: { size: W, type: WidthType.DXA },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [
        new Paragraph({ alignment: AlignmentType.LEFT, children: [
          new TextRun({ text: `${i + 1}.  `, font: 'Arial', size: 22, bold: true, color: MINT }),
          new TextRun({ text: step.label, font: 'Arial', size: 22, bold: true, color: step.fg || WHITE }),
        ]}),
        ...(step.sub ? [new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 60 }, children: [new TextRun({ text: '     ' + step.sub, font: 'Arial', size: 18, color: step.subFg || 'A0AEC0' })] })] : []),
      ]
    })]})  );
    if (i < steps.length - 1) {
      rows.push(new TableRow({ children: [new TableCell({
        borders: noBorders, width: { size: W, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 0, bottom: 0, left: 0, right: 0 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '\u2193', font: 'Arial', size: 24, bold: true, color: MINT })] })]
      })]})  );
    }
  });
  return [
    h2(title),
    ...spacer(1),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: colWidths, rows }),
    ...spacer(2),
  ];
}

// ── Decision/branch flow ───────────────────────────────────────────────────────
function branchFlow(title, intro, leftBranch, rightBranch, leftLabel, rightLabel) {
  const W = 9100;
  const half = 4000;
  const mid = 1100;
  const colWidths = [half, mid, half];

  const boxCell = (label, sub, bg, w) => new TableCell({
    borders,
    shading: { fill: bg, type: ShadingType.CLEAR },
    width: { size: w, type: WidthType.DXA },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: label, font: 'Arial', size: 20, bold: true, color: WHITE })] }),
      ...(sub ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sub, font: 'Arial', size: 16, color: 'A0AEC0' })] })] : []),
    ]
  });
  const arrCell = (dir, w) => new TableCell({
    borders: noBorders, width: { size: w, type: WidthType.DXA },
    shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 40, bottom: 40, left: 40, right: 40 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: dir === 'down' ? '\u2193' : '\u2192', font: 'Arial', size: 24, bold: true, color: MINT })] })]
  });
  const emCell = (w, bg = WHITE) => new TableCell({
    borders: noBorders, width: { size: w, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR }, margins: { top: 20, bottom: 20, left: 20, right: 20 },
    children: [new Paragraph({ children: [new TextRun('')] })]
  });
  const lblCell = (t, w, color = MID_GREY) => new TableCell({
    borders: noBorders, width: { size: w, type: WidthType.DXA },
    shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, font: 'Arial', size: 18, color, italics: true })] })]
  });

  const rows = [
    // Intro box spanning all 3 columns
    new TableRow({ children: [new TableCell({
      borders, shading: { fill: NAVY, type: ShadingType.CLEAR },
      columnSpan: 3, width: { size: W, type: WidthType.DXA },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: intro.label, font: 'Arial', size: 22, bold: true, color: WHITE })] }),
        ...(intro.sub ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: intro.sub, font: 'Arial', size: 16, color: 'A0AEC0' })] })] : []),
      ]
    })] }),
    // Arrow down
    new TableRow({ children: [emCell(half), arrCell('down', mid), emCell(half)] }),
    // Branch labels
    new TableRow({ children: [lblCell(leftLabel, half, '059669'), emCell(mid), lblCell(rightLabel, half, 'DC2626')] }),
    // Left / Right branches header rows
    ...leftBranch.map((step, i) => new TableRow({ children: [
      boxCell(step.label, step.sub, step.bg || '065F46', half),
      i === 0 ? emCell(mid) : emCell(mid),
      rightBranch[i] ? boxCell(rightBranch[i].label, rightBranch[i].sub, rightBranch[i].bg || '7F1D1D', half) : emCell(half),
    ]})),
  ];

  return [
    h2(title),
    ...spacer(1),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: colWidths, rows }),
    ...spacer(2),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ]},
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Arial', color: NAVY },
        paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: '1C3D6E' },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [
    // COVER
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 1440, left: 0 } } },
      children: [
        new Table({ width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders, shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA }, margins: { top: 2000, bottom: 2000, left: 1440, right: 1440 },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'HAY-M', font: 'Arial', size: 80, bold: true, color: MINT })] }),
              new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Flow Diagrams & Process Flows', font: 'Arial', size: 40, color: WHITE })] }),
            ]
          })]})],
        }),
        ...spacer(3),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 120 }, children: [new TextRun({ text: 'Version 1.0  |  April 2026', font: 'Arial', size: 26, color: MID_GREY })] }),
        ...spacer(2),
        body('This document contains all key process and data flow diagrams for the HAY-M platform, covering both mobile app and web application journeys.'),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },
    // MAIN
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
        children: [new TextRun({ text: 'HAY-M — Flow Diagrams  |  v1.0', font: 'Arial', size: 18, color: MID_GREY })]
      })] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
        children: [
          new TextRun({ text: 'Page ', font: 'Arial', size: 18, color: MID_GREY }),
          new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: MID_GREY }),
        ]
      })] }) },
      children: [

        // ── 1. Signup & Onboarding
        h1('1. Signup & Onboarding Flow'),
        body('This flow applies to both web and mobile. Key differences are noted.'),
        ...spacer(1),
        ...vFlow('1.1 New User Signup & Onboarding', [
          { label: 'User Visits Landing / App Store', sub: 'Entry point: website LandingPage or App Store listing', bg: '1C3D6E' },
          { label: 'Navigates to /signup (web) or SignupScreen (mobile)', sub: 'Form: Full Name, Email, Password (min 8 chars)', bg: '1E3A5F' },
          { label: 'POST /api/auth/signup', sub: 'Validation → bcrypt hash → User.create() → JWT issued', bg: '0A1628' },
          { label: 'JWT + User Stored Client-Side', sub: 'Mobile: AsyncStorage  |  Web: sessionStorage + localStorage', bg: '064E3B' },
          { label: 'localStorage.removeItem("hasOnboarded") (web) / AsyncStorage check (mobile)', sub: 'Ensures onboarding is shown for every new signup', bg: '065F46' },
          { label: 'Onboarding Screen / Page Shown', sub: 'Mobile: 4-slide animated carousel  |  Web: 5-step wizard (Welcome → Goals → Invest → Plan → Complete)', bg: '047857' },
          { label: 'hasOnboarded = "true" Set', sub: 'AsyncStorage (mobile) or localStorage (web)', bg: '059669' },
          { label: 'Navigate to Dashboard', sub: 'User is now fully authenticated and onboarded', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 2. Login Flow
        h1('2. Login & Session Restoration Flow'),
        ...vFlow('2.1 Standard Login', [
          { label: 'User Opens App / Visits Login Page', sub: 'LoginScreen (mobile) or /login (web)', bg: '1C3D6E' },
          { label: 'Enter Email + Password → Submit', sub: 'POST /api/auth/login', bg: '1E3A5F' },
          { label: 'Backend: Find User → matchPassword() → Sign JWT', sub: 'Returns { token, user } on success', bg: '0A1628' },
          { label: 'Store Token + User Client-Side', sub: 'Mobile: AsyncStorage  |  Web: sessionStorage + localStorage', bg: '064E3B' },
          { label: 'AuthContext.setUser() → Redirect to Dashboard', sub: 'Protected routes now accessible', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),
        ...spacer(1),
        ...vFlow('2.2 Session Restoration on App Launch', [
          { label: 'App / Page Load → AuthContext mounts', sub: 'Reads stored token from AsyncStorage / sessionStorage', bg: '1C3D6E' },
          { label: 'GET /api/auth/me (with Bearer token)', sub: 'Validates JWT and returns fresh user data', bg: '1E3A5F' },
          { label: 'Response Handling', sub: '200 OK → setUser(freshData)  |  401/403 → clearSession()  |  Network error → fallback to cached user', bg: '0A1628' },
          { label: 'User Restored (or Redirected to Login)', sub: 'Render cold-start handled gracefully via cached user', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 3. Forgot Password
        h1('3. Password Reset Flow'),
        ...vFlow('3.1 Full Password Reset Journey', [
          { label: 'User Clicks "Forgot Password?" on Login Page', sub: 'Navigates to /forgot-password (web)', bg: '1C3D6E' },
          { label: 'Enters Email → POST /api/auth/forgot-password', sub: 'Backend: User.findOne({ email })', bg: '1E3A5F' },
          { label: 'Generate Reset Token', sub: 'crypto.randomBytes(32).toString("hex") → stored as User.resetToken + resetTokenExpires (now + 1hr)', bg: '0A1628' },
          { label: 'Dev/Sandbox: devToken returned in API response', sub: 'Shown in yellow box on ForgotPasswordPage with copy button and direct link', bg: '78350F' },
          { label: 'User Navigates to /reset-password?token=<TOKEN>', sub: 'ResetPasswordPage reads ?token= from URL params → pre-fills token field', bg: '1E3A5F' },
          { label: 'Enter New Password → POST /api/auth/reset-password', sub: 'Backend validates token match + expiry (must be < 1 hour old)', bg: '0A1628' },
          { label: 'Password Hashed + Saved → resetToken Cleared', sub: 'User.resetToken = undefined; User.resetTokenExpires = undefined', bg: '064E3B' },
          { label: 'Success → Navigate to /login', sub: 'User can now login with new password', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 4. API Request Flow
        h1('4. Standard Authenticated API Request Flow'),
        ...vFlow('4.1 Every Protected API Call', [
          { label: 'Client Action (e.g. load Goals page)', sub: 'goalService.getGoals() called', bg: '1C3D6E' },
          { label: 'Axios Request Interceptor', sub: 'Reads token from AsyncStorage (mobile) / sessionStorage (web) → adds Authorization: Bearer <token>', bg: '1E3A5F' },
          { label: 'HTTPS Request → Node.js/Express Server', sub: 'GET /api/goals + Bearer token in header', bg: '0A1628' },
          { label: 'protect Middleware', sub: 'jwt.verify(token, JWT_SECRET) → attaches decoded user to req.user', bg: '312E81' },
          { label: 'requirePlan Middleware (if applicable)', sub: 'PLAN_RANK[user.plan] >= PLAN_RANK[required] → continue or 403', bg: '44337A' },
          { label: 'Controller → Mongoose Query → MongoDB Atlas', sub: 'Goal.find({ user: req.user._id }) → returns documents', bg: '1A365D' },
          { label: 'JSON Response → Axios Response Interceptor', sub: 'Extracts res.data; errors mapped to Error objects', bg: '064E3B' },
          { label: 'UI Updated with Response Data', sub: 'React state set → component re-renders', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 5. Savings Goal Flow
        h1('5. Savings Goal Lifecycle Flow'),
        ...vFlow('5.1 Create a Savings Goal', [
          { label: 'User Taps "Create Goal" (mobile) or clicks + (web)', sub: 'Opens create goal modal', bg: '1C3D6E' },
          { label: 'Fills Form: Name, Target Amount, Deadline, Icon, Colour', sub: 'Optional: Auto-save amount + frequency', bg: '1E3A5F' },
          { label: 'POST /api/goals', sub: 'Server checks: Free plan + existing goal count >= 1 → 403', bg: '0A1628' },
          { label: 'Goal Created in MongoDB', sub: 'Fields: name, target, current=0, isCompleted=false, user ref', bg: '064E3B' },
          { label: 'Goal Card Appears in Goals Screen', sub: 'Shows progress bar (0%), target amount, deadline countdown', bg: '059669' },
        ]),
        ...spacer(1),
        ...vFlow('5.2 Add Funds to Goal', [
          { label: 'User Taps "+ Add Funds" on Goal Card', sub: 'Opens Add Funds modal with amount input', bg: '1C3D6E' },
          { label: 'Enters Amount → Confirm', sub: 'POST /api/goals/:id/funds { amount, source }', bg: '1E3A5F' },
          { label: 'goal.current += amount; goal.save()', sub: 'Check: if current >= target → isCompleted = true, completedAt = now', bg: '0A1628' },
          { label: 'Push Notification Sent (if milestones hit)', sub: '50% → goal_50 notification  |  100% → goal_done notification', bg: '064E3B' },
          { label: 'Goal Card Updates: Progress Bar + Amount', sub: 'If completed: shows "Goal Achieved!" banner', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 6. Payment / Send Money Flow
        h1('6. Send Money Flow'),
        ...vFlow('6.1 Peer-to-Peer Transfer', [
          { label: 'User Taps "Send" in Payments Screen', sub: 'Opens Send Money modal', bg: '1C3D6E' },
          { label: 'Enters: Recipient Email, Amount, Optional Note', sub: 'Validates: amount > 0, email valid, recipient exists', bg: '1E3A5F' },
          { label: 'POST /api/transactions/send', sub: '{ recipientEmail, amount, note, cardId? }', bg: '0A1628' },
          { label: 'Server: Find Recipient User by Email', sub: 'If not found → 404 error', bg: '312E81' },
          { label: 'Create Debit Transaction for Sender', sub: 'type: debit, category: transfer, toUser: recipient._id', bg: '1A365D' },
          { label: 'Create Credit Transaction for Recipient', sub: 'type: credit, category: transfer, title: "Received from <sender>"', bg: '1A365D' },
          { label: 'Push Notification to Recipient', sub: 'type: transaction → title: "Money Received!", message: "You received £X from <name>"', bg: '064E3B' },
          { label: 'Success Alert: "£X sent successfully!"', sub: 'Transaction list refreshes automatically', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 7. Push Notification Flow
        h1('7. Push Notification Flow'),
        ...vFlow('7.1 Notification Dispatch', [
          { label: 'System Event Occurs', sub: 'e.g. goal funded, transaction received, portfolio milestone', bg: '1C3D6E' },
          { label: 'Controller Calls pushService.sendNotification(userId, payload)', sub: 'Payload: { type, title, message, icon, data }', bg: '1E3A5F' },
          { label: 'Notification Saved to MongoDB', sub: 'Notification.create({ user, type, title, message, read: false })', bg: '0A1628' },
          { label: 'Lookup User Push Token + Preferences', sub: 'User.findById(userId).select("pushToken notificationPrefs")', bg: '312E81' },
          { label: 'Check Notification Preference Flag', sub: 'e.g. user.notificationPrefs.goal_done === false → skip push', bg: '44337A' },
          { label: 'POST to Expo Push API', sub: 'https://exp.host/--/api/v2/push/send  |  { to: pushToken, title, body, data }', bg: '064E3B' },
          { label: 'Device Receives Push Notification', sub: 'iOS / Android native notification displayed', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),
        ...spacer(1),
        ...vFlow('7.2 User Registers Push Token', [
          { label: 'NotificationsScreen Mounts', sub: 'Calls expo-notifications getExpoPushTokenAsync()', bg: '1C3D6E' },
          { label: 'POST /api/notifications/push-token', sub: '{ token: expoPushToken }', bg: '1E3A5F' },
          { label: 'User.pushToken Updated in MongoDB', sub: 'Token stored → used for all future pushes', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 8. Wallet Top Up
        h1('8. Wallet Top-Up Flow'),
        ...vFlow('8.1 Add Funds to a Card', [
          { label: 'User Opens Wallet → Selects Card', sub: 'Active card shown in carousel', bg: '1C3D6E' },
          { label: 'Taps "Top Up" Button', sub: 'Top-Up modal opens with amount input and quick chips (£10, £25, £50, £100)', bg: '1E3A5F' },
          { label: 'Enters Amount → Taps "Add to Card"', sub: 'POST /api/wallet/:id/topup { amount }', bg: '0A1628' },
          { label: 'card.balance += amount; card.save()', sub: 'Returns updated card document', bg: '064E3B' },
          { label: 'Success Alert + Balance Updates', sub: '"£X added to card ••••XXXX. New balance: £Y"', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 9. Web Settings Flow
        h1('9. Settings & Profile Edit Flow (Web)'),
        ...vFlow('9.1 Profile Update', [
          { label: 'User Navigates to /settings (via sidebar, avatar, or bell)', sub: 'SettingsPage loads with Profile tab active by default', bg: '1C3D6E' },
          { label: 'Profile Tab: Edit Full Name + Phone', sub: 'Email shown as read-only (cannot be changed)', bg: '1E3A5F' },
          { label: 'Clicks "Save Changes"', sub: 'PATCH /api/auth/me { fullName, phone }', bg: '0A1628' },
          { label: 'User Document Updated in MongoDB', sub: 'Returns updated user object', bg: '064E3B' },
          { label: 'AuthContext user state refreshed', sub: 'Header avatar name updates immediately', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),
        ...spacer(1),
        ...vFlow('9.2 Change Password (Web + Mobile)', [
          { label: 'Security Tab (web) / Change Password in Profile (mobile)', sub: 'Form: Current Password, New Password, Confirm New Password', bg: '1C3D6E' },
          { label: 'Submit → PATCH /api/auth/change-password', sub: '{ oldPassword, newPassword }', bg: '1E3A5F' },
          { label: 'authController: user.matchPassword(oldPassword)', sub: 'If fails → 400 "Current password is incorrect"', bg: '0A1628' },
          { label: 'Hash New Password (bcrypt 12 rounds) → Save', sub: 'user.password = hashedNew; user.save()', bg: '064E3B' },
          { label: 'Success Message → Form Cleared', sub: 'User remains logged in', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── 10. Plan Upgrade Flow
        h1('10. Plan & Feature Access Flow'),
        ...vFlow('10.1 Accessing a Plus/Pro Feature on Free Plan', [
          { label: 'Free User Tries to Access Portfolio / ISA / AI Limits', sub: 'Client renders upgrade prompt or disabled state', bg: '1C3D6E' },
          { label: 'API Call Made (e.g. GET /api/portfolio)', sub: 'Bearer token includes user.plan = "free"', bg: '1E3A5F' },
          { label: 'requirePlan("plus") Middleware', sub: 'PLAN_RANK["free"] (0) < PLAN_RANK["plus"] (1) → 403', bg: '7F1D1D' },
          { label: '403 Response: { message, requiredPlan, currentPlan }', sub: 'Client shows upgrade CTA or toast message', bg: '991B1B' },
          { label: 'User Navigates to /upgrade or UpgradeScreen', sub: 'Plan cards shown: Free / Plus / Pro with feature comparison', bg: '1E3A5F' },
          { label: 'User Selects Plan → Payment (future integration)', sub: 'User.plan updated → features unlock immediately', bg: '00D4A1', fg: NAVY, subFg: '064E3B' },
        ]),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('D:/mobileapp/docs/HAY-M_FlowDiagrams.docx', buf);
  console.log('Flow done');
}).catch(e => console.error('Flow error:', e.message));
