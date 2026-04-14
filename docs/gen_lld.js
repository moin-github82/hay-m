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
const CODE_BG = '1E293B';
const CODE_FG = 'E2E8F0';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: false,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, color: NAVY, font: 'Arial' })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: '1C3D6E', font: 'Arial' })] });
}
function h3(text) {
  return new Paragraph({ spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: NAVY, font: 'Arial' })] });
}
function body(text, color = DARK_TEXT) {
  return new Paragraph({ spacing: { after: 100 },
    children: [new TextRun({ text, size: 22, color, font: 'Arial' })] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial' })] });
}
function subbullet(text) {
  return new Paragraph({ numbering: { reference: 'subbullets', level: 0 }, spacing: { after: 60 },
    children: [new TextRun({ text, size: 20, color: MID_GREY, font: 'Arial' })] });
}
function code(text) {
  return new Paragraph({ spacing: { after: 0 },
    children: [new TextRun({ text, font: 'Courier New', size: 18, color: '00D4A1' })] });
}
function codeBlock(lines) {
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: [9100],
    rows: [new TableRow({ children: [new TableCell({
      borders: noBorders, width: { size: 9100, type: WidthType.DXA },
      shading: { fill: '0F172A', type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 180, right: 180 },
      children: lines.map(l => new Paragraph({ children: [new TextRun({ text: l, font: 'Courier New', size: 18, color: '00D4A1' })] }))
    })]})],
  });
}
function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } }));
}
function sectionDivider() {
  return new Paragraph({ children: [new PageBreak()] });
}

// Generic field table
function fieldTable(headers, rows, colWidths) {
  return new Table({
    width: { size: 9100, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, ci) =>
        new TableCell({ borders, width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
        })
      )}),
      ...rows.map((row, ri) => new TableRow({ children: row.map((cell, ci) =>
        new TableCell({ borders, width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({
            text: cell, size: 19,
            font: (ci === 0 || cell.startsWith('String') || cell.startsWith('Boolean') || cell.startsWith('Number') || cell.startsWith('Date') || cell.startsWith('Object') || cell.startsWith('Array') || cell.startsWith('[')) ? 'Courier New' : 'Arial',
            color: ci === 0 ? '0369A1' : DARK_TEXT,
            bold: ci === 0,
          })] })]
        })
      )}))
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'subbullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u25E6', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
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
        new Table({
          width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders, shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA }, margins: { top: 2000, bottom: 2000, left: 1440, right: 1440 },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'HAY-M', font: 'Arial', size: 80, bold: true, color: MINT })] }),
              new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Low Level Design Document', font: 'Arial', size: 40, color: WHITE })] }),
            ]
          })]})],
        }),
        ...spacer(3),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 120 }, children: [new TextRun({ text: 'Version 1.0  |  April 2026  |  CONFIDENTIAL', font: 'Arial', size: 26, color: MID_GREY })] }),
        ...spacer(4),
        new Table({
          width: { size: 7000, type: WidthType.DXA }, columnWidths: [3000, 4000],
          rows: [
            ['Document Type', 'Low Level Design (LLD)'],
            ['Status', 'Draft'],
            ['Coverage', 'Data Models, API Endpoints, Auth Flow, Component Structure'],
            ['Backend URL', 'https://hay-m-backend.onrender.com'],
          ].map(([l, v]) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: l, bold: true, size: 20, color: NAVY, font: 'Arial' })] })] }),
            new TableCell({ borders, width: { size: 4000, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, color: DARK_TEXT, font: 'Arial' })] })] }),
          ]})),
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },
    // MAIN
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
        children: [new TextRun({ text: 'HAY-M — Low Level Design Document  |  Confidential  |  v1.0', font: 'Arial', size: 18, color: MID_GREY })]
      })] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
        children: [
          new TextRun({ text: 'Page ', font: 'Arial', size: 18, color: MID_GREY }),
          new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: MID_GREY }),
          new TextRun({ text: ' of ', font: 'Arial', size: 18, color: MID_GREY }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 18, color: MID_GREY }),
        ]
      })] }) },
      children: [
        // ── 1. Data Models
        h1('1. Data Models (MongoDB Schemas)'),
        body('All models use Mongoose ODM. Timestamps (createdAt, updatedAt) are auto-managed via { timestamps: true }.'),
        ...spacer(1),

        h2('1.1 User Model'),
        fieldTable(
          ['Field', 'Type', 'Required', 'Notes'],
          [
            ['fullName', 'String', 'Yes', 'Trimmed'],
            ['email', 'String', 'Yes', 'Unique, lowercase, trimmed'],
            ['phone', 'String', 'No', 'Optional'],
            ['password', 'String', 'Yes', 'bcrypt hashed, min 8 chars; excluded from toJSON'],
            ['avatar', 'String', 'No', 'Default: null'],
            ['isVerified', 'Boolean', 'No', 'Default: false'],
            ['plan', 'String', 'No', 'Enum: free | plus | pro. Default: free'],
            ['pushToken', 'String', 'No', 'Expo device push token'],
            ['resetToken', 'String', 'No', 'Password reset token (crypto.randomBytes)'],
            ['resetTokenExpires', 'Date', 'No', '1-hour expiry window'],
            ['goal_done', 'Boolean', 'No', 'Notification pref. Default: true'],
            ['goal_50', 'Boolean', 'No', 'Notification pref. Default: true'],
            ['invest_10', 'Boolean', 'No', 'Notification pref. Default: true'],
            ['invest_25', 'Boolean', 'No', 'Notification pref. Default: true'],
            ['weekly', 'Boolean', 'No', 'Notification pref. Default: true'],
            ['monthly', 'Boolean', 'No', 'Notification pref. Default: true'],
            ['auto_save', 'Boolean', 'No', 'Notification pref. Default: false'],
            ['large_tx', 'Boolean', 'No', 'Notification pref. Default: false'],
          ],
          [2000, 1800, 1200, 4100]
        ),
        body('Methods: matchPassword(pwd) — bcrypt compare; toJSON() — strips password field.'),
        ...spacer(1),

        h2('1.2 Goal Model'),
        fieldTable(
          ['Field', 'Type', 'Notes'],
          [
            ['user', 'ObjectId (ref: User)', 'Required, indexed'],
            ['name', 'String', 'Required'],
            ['icon', 'String', 'Emoji icon, default: 🎯'],
            ['color', 'String', 'Hex colour for UI'],
            ['target', 'Number', 'Required, min: 1'],
            ['current', 'Number', 'Default: 0'],
            ['deadline', 'Date', 'Optional'],
            ['autoSave', 'Number', 'Auto-save amount per frequency, default: 0'],
            ['autoSaveFrequency', 'String', 'Enum: daily | weekly | monthly | none. Default: none'],
            ['isCompleted', 'Boolean', 'Default: false'],
            ['completedAt', 'Date', 'Set when isCompleted → true'],
          ],
          [2200, 2400, 4500]
        ),
        body('Virtual: progress — (current / target) * 100, capped at 100.'),
        body('Plan gate: Free plan limited to 1 goal (enforced in goalController.js).'),
        ...spacer(1),

        h2('1.3 Transaction Model'),
        fieldTable(
          ['Field', 'Type', 'Notes'],
          [
            ['user', 'ObjectId (ref: User)', 'Required, indexed (compound with createdAt)'],
            ['type', 'String', 'Enum: credit | debit. Required'],
            ['category', 'String', 'Enum: 9 types (savings, investment, transfer, shopping, food, transport, entertainment, bills, other)'],
            ['status', 'String', 'Enum: completed | pending | failed. Default: completed'],
            ['title', 'String', 'Required — display name'],
            ['subtitle', 'String', 'Optional — secondary description'],
            ['amount', 'Number', 'Required, min: 0'],
            ['icon', 'String', 'Emoji icon for display'],
            ['note', 'String', 'Optional user note'],
            ['toUser', 'ObjectId (ref: User)', 'Optional — send money recipient'],
            ['cardId', 'ObjectId (ref: Card)', 'Optional — source card'],
          ],
          [2200, 2400, 4500]
        ),
        body('Filter params (GET /api/transactions): search (regex title/subtitle/note), dateFrom, dateTo, minAmount, maxAmount, category, type.'),
        ...spacer(1),

        h2('1.4 Card Model'),
        fieldTable(
          ['Field', 'Type', 'Notes'],
          [
            ['user', 'ObjectId (ref: User)', 'Required'],
            ['type', 'String', 'Enum: Visa | Mastercard | Amex | Discover'],
            ['bank', 'String', 'Required — bank/institution name'],
            ['last4', 'String', 'Last 4 digits of card number'],
            ['holder', 'String', 'Cardholder name (stored uppercase)'],
            ['expiry', 'String', 'MM/YY format'],
            ['balance', 'Number', 'Current balance, default: 0'],
            ['accountType', 'String', 'card | bank'],
            ['accountNumber', 'String', 'For bank accounts'],
            ['gradient', '[String]', 'Array of 2 hex colours for card UI gradient'],
            ['isDefault', 'Boolean', 'Default: false'],
            ['isFrozen', 'Boolean', 'Default: false'],
          ],
          [2200, 2400, 4500]
        ),
        ...spacer(1),

        h2('1.5 Portfolio Model'),
        fieldTable(
          ['Field', 'Type', 'Notes'],
          [
            ['user', 'ObjectId (ref: User)', 'Required, unique (one portfolio per user)'],
            ['holdings', '[HoldingSchema]', 'Array of embedded holding sub-documents'],
            ['history', '[{date, value}]', 'Historical portfolio value snapshots'],
          ],
          [2200, 2400, 4500]
        ),
        body('Holding sub-schema fields:'),
        fieldTable(
          ['Field', 'Type', 'Notes'],
          [
            ['name', 'String', 'Asset name (e.g. Apple Inc.)'],
            ['ticker', 'String', 'Symbol (e.g. AAPL)'],
            ['type', 'String', 'stock | crypto | etf | bond | cash'],
            ['shares', 'Number', 'Number of units held'],
            ['avgBuyPrice', 'Number', 'Average purchase price in GBP'],
            ['currentPrice', 'Number', 'Latest price in GBP'],
            ['color', 'String', 'Hex colour for chart display'],
          ],
          [2200, 2400, 4500]
        ),
        body('Holding virtuals: value (shares × currentPrice), gainLoss, gainLossPct.'),
        body('Portfolio virtual: totalValue — sum of all holding values.'),
        ...spacer(1),

        h2('1.6 Notification Model'),
        fieldTable(
          ['Field', 'Type', 'Notes'],
          [
            ['user', 'ObjectId (ref: User)', 'Required, indexed'],
            ['type', 'String', 'Enum: goal_milestone | goal_complete | transaction | portfolio | auto_save | system'],
            ['title', 'String', 'Required — notification headline'],
            ['message', 'String', 'Required — notification body'],
            ['icon', 'String', 'Emoji icon, default: 🔔'],
            ['read', 'Boolean', 'Default: false'],
            ['data', 'Mixed', 'Arbitrary JSON payload for deep linking'],
          ],
          [2200, 2400, 4500]
        ),
        ...spacer(1),

        sectionDivider(),

        // ── 2. API Endpoints
        h1('2. API Endpoints (Full Reference)'),

        h2('2.1 Authentication  —  /api/auth'),
        body('Rate limit: 20 requests per 15 minutes. Auth routes are public unless marked [P].'),
        ...spacer(1),
        fieldTable(
          ['Method', 'Path', 'Auth', 'Request Body', 'Response'],
          [
            ['POST', '/auth/signup', 'Public', '{ fullName, email, password }', '{ token, user }'],
            ['POST', '/auth/login', 'Public', '{ email, password }', '{ token, user }'],
            ['GET', '/auth/me', '[P]', '—', '{ user }'],
            ['PATCH', '/auth/me', '[P]', '{ fullName?, phone? }', '{ user }'],
            ['PATCH', '/auth/change-password', '[P]', '{ oldPassword, newPassword }', '{ message }'],
            ['POST', '/auth/forgot-password', 'Public', '{ email }', '{ message, devToken? }'],
            ['POST', '/auth/reset-password', 'Public', '{ token, newPassword }', '{ message }'],
          ],
          [1100, 2200, 900, 2800, 2100]
        ),
        ...spacer(1),

        h2('2.2 Goals  —  /api/goals'),
        body('All routes protected [P]. Rate limit: 100 req/min.'),
        ...spacer(1),
        fieldTable(
          ['Method', 'Path', 'Plan', 'Notes'],
          [
            ['GET', '/goals', 'Free+', 'Returns all goals for authenticated user'],
            ['POST', '/goals', 'Free+', 'Body: { name, target, deadline?, icon?, color?, autoSave?, autoSaveFrequency? }. Free plan: max 1 goal'],
            ['PATCH', '/goals/:id', 'Free+', 'Partial update. Body: any Goal fields'],
            ['DELETE', '/goals/:id', 'Free+', 'Permanently removes goal'],
            ['POST', '/goals/:id/funds', 'Free+', 'Body: { amount, source? }. Adds to goal.current'],
          ],
          [1100, 2000, 1200, 4800]
        ),
        ...spacer(1),

        h2('2.3 Transactions  —  /api/transactions'),
        body('All routes protected [P]. Rate limit: 100 req/min.'),
        ...spacer(1),
        fieldTable(
          ['Method', 'Path', 'Query / Body', 'Notes'],
          [
            ['GET', '/transactions', '?search, dateFrom, dateTo, minAmount, maxAmount, category, type', 'Returns paginated transactions with all active filters applied'],
            ['POST', '/transactions/send', '{ recipientEmail, amount, note?, cardId? }', 'Creates debit tx for sender + credit tx for recipient'],
          ],
          [1100, 2100, 3300, 2600]
        ),
        ...spacer(1),

        h2('2.4 Portfolio  —  /api/portfolio'),
        body('All routes protected [P] + require Plus plan. Rate limit: 100 req/min.'),
        ...spacer(1),
        fieldTable(
          ['Method', 'Path', 'Body', 'Notes'],
          [
            ['GET', '/portfolio', '—', 'Returns portfolio with all holdings and computed totalValue'],
            ['POST', '/portfolio/holdings', '{ name, ticker, type, shares, avgBuyPrice, currentPrice, color }', 'Adds new holding to portfolio'],
            ['PATCH', '/portfolio/prices', '{ prices: [{ ticker, currentPrice }] }', 'Batch update current prices for multiple tickers'],
            ['DELETE', '/portfolio/holdings/:holdingId', '—', 'Removes holding from portfolio array'],
          ],
          [1100, 2200, 3200, 2600]
        ),
        ...spacer(1),

        h2('2.5 Wallet  —  /api/wallet'),
        body('All routes protected [P]. Rate limit: 100 req/min.'),
        ...spacer(1),
        fieldTable(
          ['Method', 'Path', 'Body / Notes'],
          [
            ['GET', '/wallet', 'Returns array of all cards and bank accounts for user'],
            ['POST', '/wallet', 'Body: { type, bank, last4, holder, expiry, balance?, gradient, accountType }'],
            ['PATCH', '/wallet/:id/default', 'Clears all other defaults → sets this card as isDefault: true'],
            ['PATCH', '/wallet/:id/freeze', 'Toggles isFrozen boolean on card'],
            ['POST', '/wallet/:id/topup', 'Body: { amount }. Increments card.balance'],
            ['DELETE', '/wallet/:id', 'Removes card from user collection'],
          ],
          [1100, 2200, 5800]
        ),
        ...spacer(1),

        h2('2.6 Savings Tracker  —  /api/savings-tracker'),
        body('All routes protected [P]. Rate limit: 100 req/min.'),
        ...spacer(1),
        fieldTable(
          ['Method', 'Path', 'Plan', 'Notes'],
          [
            ['GET', '/savings-tracker', 'Free+', 'Returns tracker with current totals and entry history'],
            ['GET', '/savings-tracker/entries', 'Free+', 'Returns savings entry list'],
            ['PATCH', '/savings-tracker/limits', 'Pro only', 'Body: { dailyLimit, monthlyLimit }'],
            ['POST', '/savings-tracker/surplus', 'Free+', 'Body: { amount, note? }. Manual savings deposit'],
            ['POST', '/savings-tracker/roundup', 'Free+', 'Body: round-up transaction details'],
          ],
          [1100, 2400, 1300, 4300]
        ),
        ...spacer(1),

        h2('2.7 Notifications  —  /api/notifications'),
        body('All routes protected [P].'),
        ...spacer(1),
        fieldTable(
          ['Method', 'Path', 'Notes'],
          [
            ['GET', '/notifications', 'Returns paginated notification list + unreadCount'],
            ['PATCH', '/notifications/read-all', 'Sets read: true on all notifications for user'],
            ['PATCH', '/notifications/:id/read', 'Sets read: true on single notification'],
            ['POST', '/notifications/push-token', 'Body: { token }. Saves Expo push token to User.pushToken'],
            ['PATCH', '/notifications/preferences', 'Body: { goal_done?, goal_50?, ... }. Updates User.notificationPrefs'],
          ],
          [1100, 2600, 5400]
        ),
        ...spacer(1),

        sectionDivider(),

        // ── 3. Auth Flow
        h1('3. Authentication & Session Flow'),

        h2('3.1 Signup Flow'),
        ...[
          'User submits signup form (fullName, email, password)',
          'Client POSTs to POST /api/auth/signup',
          'authController validates input with express-validator',
          'Password hashed with bcryptjs (12 salt rounds)',
          'User document created in MongoDB',
          'JWT signed with JWT_SECRET (payload: { id: user._id })',
          'Mobile: token + user stored in AsyncStorage; navigate to Onboarding',
          'Web: localStorage.removeItem("hasOnboarded") → navigate to /onboarding; token → sessionStorage',
        ].map((t, i) => new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 },
          children: [new TextRun({ text: t, size: 22, color: DARK_TEXT, font: 'Arial' })] })),
        ...spacer(1),

        h2('3.2 Login Flow'),
        ...[
          'User submits email + password',
          'POST /api/auth/login → authController.login',
          'User.findOne({ email }) → user.matchPassword(password)',
          'If match: JWT signed → returned in response',
          'Mobile: stored in AsyncStorage; web: stored in sessionStorage',
          'AuthContext sets user state → protected routes become accessible',
        ].map(t => new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 },
          children: [new TextRun({ text: t, size: 22, color: DARK_TEXT, font: 'Arial' })] })),
        ...spacer(1),

        h2('3.3 Session Restoration (AuthContext)'),
        body('On app/page load, AuthContext calls GET /api/auth/me:'),
        bullet('401/403 response → clearSession(), user set to null'),
        bullet('Network error (Render cold-start) → fallback to stored user from localStorage / AsyncStorage'),
        bullet('Success → user state updated with fresh data from backend'),
        ...spacer(1),

        h2('3.4 Password Reset Flow'),
        ...[
          'User submits email to POST /api/auth/forgot-password',
          'crypto.randomBytes(32).toString("hex") generates reset token',
          'Token stored on User.resetToken, expiry set to now + 1 hour',
          'In production: token emailed via email service',
          'In sandbox/dev: devToken returned in response body (shown in yellow box on UI)',
          'User follows link → GET /reset-password?token=<token>',
          'User submits new password to POST /api/auth/reset-password',
          'Backend validates token + expiry, hashes new password, clears resetToken fields',
        ].map(t => new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 },
          children: [new TextRun({ text: t, size: 22, color: DARK_TEXT, font: 'Arial' })] })),

        sectionDivider(),

        // ── 4. Mobile App Component Structure
        h1('4. Mobile App — Component & Navigation Structure'),

        h2('4.1 Navigator Hierarchy'),
        codeBlock([
          'AppNavigator (Root Stack)',
          '  ├─ OnboardingScreen          (if !hasOnboarded && !user)',
          '  ├─ LoginScreen               (if !user)',
          '  ├─ SignupScreen              (if !user)',
          '  └─ TabNavigator             (if user)',
          '       ├─ DashboardScreen',
          '       ├─ InvestStackNavigator',
          '       │    ├─ PortfolioScreen',
          '       │    ├─ InvestmentScreen',
          '       │    └─ ISAScreen',
          '       ├─ SavingGoalsScreen',
          '       ├─ PaymentsScreen',
          '       └─ MoreStackNavigator',
          '            ├─ MoreMenuScreen',
          '            ├─ WalletScreen',
          '            ├─ SavingsTrackerScreen',
          '            ├─ NotificationsScreen',
          '            ├─ ProfileScreen',
          '            ├─ InsightsScreen',
          '            ├─ FeesScreen',
          '            └─ UpgradeScreen',
        ]),
        ...spacer(1),

        h2('4.2 AuthContext (Mobile)'),
        body('File: src/context/AuthContext.js'),
        bullet('Provides: user, loading, login(), signup(), logout()'),
        bullet('On mount: calls authService.getStoredUser() → then GET /api/auth/me to refresh'),
        bullet('Network error catch: only clearSession on 401/403; network errors fall back to stored user'),
        ...spacer(1),

        h2('4.3 Service Layer Design'),
        body('All services use a shared Axios instance from api.js:'),
        bullet('Base URL: https://hay-m-backend.onrender.com/api'),
        bullet('Timeout: 30 seconds (handles Render free-tier cold starts)'),
        bullet('Request interceptor: reads token from AsyncStorage → adds Authorization: Bearer <token>'),
        bullet('Response interceptor: extracts error.message from response or falls back to error.message'),
        ...spacer(1),

        h2('4.4 Key Screen Logic'),
        h3('DashboardScreen'),
        bullet('Fetches: dashboardService.getDashboard()'),
        bullet('Shows: total balance, savings total, portfolio value, recent transactions, active goals'),
        bullet('Real-time: Socket.IO listener for "transaction" events → re-fetches'),
        h3('SavingGoalsScreen'),
        bullet('CRUD: create, edit (modal), delete (Alert confirm), add funds (modal)'),
        bullet('Plan gate: Free users see upgrade CTA if trying to create a 2nd goal'),
        bullet('Edit/Delete: shown inline in action row (not absolute positioned)'),
        h3('WalletScreen'),
        bullet('Tabs: Cards / Bank Accounts'),
        bullet('Card carousel: FlatList with activeCardIndex state'),
        bullet('Actions: Top Up (modal), Freeze, Set Default, Delete (Alert confirm)'),
        bullet('All currency in GBP (£) with en-GB locale formatting'),
        h3('PaymentsScreen'),
        bullet('Send Money modal: recipientEmail, amount, note'),
        bullet('Filter bar: searchText, categoryFilter, showFilters toggle'),
        bullet('Transaction list: flat list with debit/credit colour coding'),
        h3('NotificationsScreen'),
        bullet('Fetches: GET /api/notifications'),
        bullet('Registers Expo push token (graceful — works without expo-notifications)'),
        bullet('8 preference toggles synced to backend via PATCH /api/notifications/preferences'),
        ...spacer(1),

        sectionDivider(),

        // ── 5. Web App
        h1('5. Web Application — Component & Page Structure'),

        h2('5.1 Route Map (React Router DOM v6)'),
        fieldTable(
          ['Path', 'Page Component', 'Auth Required'],
          [
            ['/', 'LandingPage', 'No'],
            ['/login', 'LoginPage', 'No'],
            ['/signup', 'SignupPage', 'No'],
            ['/forgot-password', 'ForgotPasswordPage', 'No'],
            ['/reset-password', 'ResetPasswordPage', 'No'],
            ['/onboarding', 'OnboardingPage', 'Yes (new user)'],
            ['/dashboard', 'DashboardPage', 'Yes'],
            ['/wallet', 'WalletPage', 'Yes'],
            ['/portfolio', 'PortfolioPage', 'Yes (Plus/Pro)'],
            ['/goals', 'GoalsPage', 'Yes'],
            ['/transactions', 'TransactionsPage', 'Yes'],
            ['/savings-tracker', 'SavingsTrackerPage', 'Yes'],
            ['/notifications', 'NotificationsPage', 'Yes'],
            ['/settings', 'SettingsPage', 'Yes'],
            ['/insights', 'InsightsPage', 'Yes (Plus/Pro)'],
            ['/isa', 'ISAPage', 'Yes (Plus/Pro)'],
            ['/fees', 'FeesPage', 'Yes'],
            ['/upgrade', 'UpgradePage', 'Yes'],
            ['/privacy', 'PrivacyPage', 'No'],
            ['/terms', 'TermsPage', 'No'],
            ['/contact', 'ContactPage', 'No'],
          ],
          [2400, 3400, 3300]
        ),
        ...spacer(1),

        h2('5.2 Layout Component'),
        body('File: website/src/components/Layout.jsx'),
        bullet('Sidebar: 12 navigation items + Settings link'),
        bullet('Sidebar user card: clickable → navigates to /settings'),
        bullet('Header bell icon: clickable → navigates to /notifications'),
        bullet('Header avatar: clickable → navigates to /settings'),
        bullet('Active route highlight: compares location.pathname to NAV_ITEMS'),
        ...spacer(1),

        h2('5.3 AuthContext (Web)'),
        body('File: website/src/context/AuthContext.jsx'),
        bullet('Token storage: sessionStorage (key: haym_web_token)'),
        bullet('User storage: localStorage (key: haym_web_user)'),
        bullet('On mount: GET /api/auth/me with stored token'),
        bullet('Network error: only clearSession on 401/403; other errors fall back to localStorage user'),
        ...spacer(1),

        h2('5.4 SettingsPage Tabs'),
        bullet('Profile — edit fullName + phone; email read-only; PATCH /api/auth/me'),
        bullet('Security — change password via PATCH /api/auth/change-password'),
        bullet('Notifications — 8 toggles synced via PATCH /api/notifications/preferences'),
        bullet('Plan & Billing — current plan card + upgrade CTA'),
        ...spacer(1),

        h2('5.5 GoalsPage'),
        bullet('GoalCard component: progress bar, edit + delete buttons in action row'),
        bullet('Add Funds modal: amount input + source selector'),
        bullet('Edit modal: pre-filled form for name, target, deadline, icon, colour'),
        bullet('Free plan gate: max 1 goal — server enforces, client shows upgrade prompt'),
        ...spacer(1),

        sectionDivider(),

        // ── 6. Push Notification Flow
        h1('6. Push Notification Flow (Detailed)'),
        body('File: backend/services/pushService.js'),
        ...spacer(1),
        codeBlock([
          'async function sendNotification(userId, { type, title, message, icon, data }) {',
          '  // 1. Always save to DB',
          '  const notif = await Notification.create({ user: userId, type, title, message, icon, data });',
          '',
          '  // 2. Look up user push token',
          '  const user = await User.findById(userId).select("pushToken notificationPrefs");',
          '  if (!user?.pushToken) return notif;',
          '',
          '  // 3. Check user preferences',
          '  if (type === "goal_done" && !user.notificationPrefs.goal_done) return notif;',
          '  // ... (check other preference flags)',
          '',
          '  // 4. Send via Expo Push API',
          '  await fetch("https://exp.host/--/api/v2/push/send", {',
          '    method: "POST",',
          '    headers: { "Content-Type": "application/json" },',
          '    body: JSON.stringify({ to: user.pushToken, title, body: message, data })',
          '  });',
          '  return notif;',
          '}',
        ]),
        ...spacer(1),

        sectionDivider(),

        // ── 7. Plan Enforcement
        h1('7. Plan Enforcement Logic'),

        h2('7.1 Server-side Middleware'),
        codeBlock([
          'const PLAN_RANK = { free: 0, plus: 1, pro: 2 };',
          '',
          'function requirePlan(minPlan) {',
          '  return (req, res, next) => {',
          '    const userRank = PLAN_RANK[req.user.plan] ?? 0;',
          '    const reqRank  = PLAN_RANK[minPlan]    ?? 0;',
          '    if (userRank >= reqRank) return next();',
          '    return res.status(403).json({',
          '      message: `This feature requires ${minPlan} plan`,',
          '      requiredPlan: minPlan,',
          '      currentPlan: req.user.plan,',
          '    });',
          '  };',
          '}',
          '',
          '// Usage in routes:',
          'router.get("/", protect, requirePlan("plus"), portfolioController.get);',
          'router.patch("/limits", protect, requirePlan("pro"), savingsTrackerController.updateLimits);',
        ]),
        ...spacer(1),

        h2('7.2 Goal Count Gate (Free Plan)'),
        codeBlock([
          '// In goalController.js createGoal:',
          'if (req.user.plan === "free") {',
          '  const count = await Goal.countDocuments({ user: req.user._id });',
          '  if (count >= 1) {',
          '    return res.status(403).json({ message: "Free plan limited to 1 goal. Upgrade to Plus." });',
          '  }',
          '}',
        ]),
        ...spacer(1),

        sectionDivider(),

        // ── 8. Error Handling
        h1('8. Error Handling & Response Format'),
        body('All API responses follow a consistent format:'),
        ...spacer(1),
        codeBlock([
          '// Success',
          '{ data: <payload>, message?: "..." }',
          '',
          '// Error',
          '{ message: "Human-readable error description" }',
          '',
          '// Validation error (express-validator)',
          '{ errors: [{ field: "email", msg: "Must be valid email" }] }',
        ]),
        ...spacer(1),
        body('Client-side (Axios response interceptor):'),
        codeBlock([
          'api.interceptors.response.use(',
          '  res => res.data,',
          '  err => Promise.reject(new Error(',
          '    err?.response?.data?.message || err.message || "Request failed"',
          '  ))',
          ');',
        ]),
        ...spacer(1),
        body('AuthContext catch logic (prevents session wipe on Render cold-start):'),
        codeBlock([
          '.catch(err => {',
          '  const status = err?.response?.status;',
          '  if (status === 401 || status === 403) {',
          '    clearSession(); setUser(null);',
          '  } else {',
          '    setUser(storedUser); // fallback to cached user',
          '  }',
          '});',
        ]),
      ]
    }
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('D:/mobileapp/docs/HAY-M_LLD.docx', buf);
  console.log('LLD done');
}).catch(e => console.error('LLD error:', e.message));
