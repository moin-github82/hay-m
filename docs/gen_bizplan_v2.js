const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, ExternalHyperlink
} = require('C:/nvm4w/nodejs/node_modules/docx');
const fs = require('fs');

const NAVY = '0A1628';
const MINT = '00D4A1';
const WHITE = 'FFFFFF';
const LIGHT_BG = 'F0F4F8';
const MID_GREY = '64748B';
const DARK_TEXT = '1E293B';
const GREEN = '059669';
const RED = 'DC2626';
const AMBER = 'D97706';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const mintBorder = { style: BorderStyle.SINGLE, size: 6, color: MINT };
const thickBorder = { style: BorderStyle.SINGLE, size: 8, color: MINT };

// ── Helpers ──────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, color: NAVY, font: 'Arial' })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, bold: true, size: 28, color: '1C3D6E', font: 'Arial' })] });
}
function h3(text) {
  return new Paragraph({ spacing: { before: 160, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: NAVY, font: 'Arial' })] });
}
function body(text, opts = {}) {
  return new Paragraph({ spacing: { after: 100 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial', ...opts })] });
}
function bodyMixed(runs) {
  return new Paragraph({ spacing: { after: 100 }, children: runs });
}
function run(text, opts = {}) {
  return new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial', ...opts });
}
function bullet(text, color = DARK_TEXT, bold = false) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, color, font: 'Arial', bold })] });
}
function subbullet(text, color = MID_GREY) {
  return new Paragraph({ numbering: { reference: 'subbullets', level: 0 }, spacing: { after: 60 },
    children: [new TextRun({ text, size: 20, color, font: 'Arial' })] });
}
function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } }));
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

// Generic table
function tbl(headers, rows, colWidths, headerBg = NAVY) {
  return new Table({
    width: { size: colWidths.reduce((a,b)=>a+b,0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, ci) =>
        new TableCell({ borders, width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: headerBg, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
        })
      )}),
      ...rows.map((row, ri) => new TableRow({ children: row.map((cell, ci) => {
        const isCheck = cell === '\u2713' || cell === 'Yes' || cell === '\u2713 Core' || cell.startsWith('\u2713');
        const isCross = cell === '\u2717' || cell === 'No' || cell.startsWith('\u2717');
        const cellColor = isCheck ? GREEN : isCross ? RED : DARK_TEXT;
        return new TableCell({ borders, width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
            children: [new TextRun({ text: cell, size: 20, font: 'Arial', color: cellColor, bold: ci === 0 && ri === -1 })] })]
        });
      })}))
    ]
  });
}

// Stat cards row
function statsRow(stats) {
  const w = Math.floor(9100 / stats.length);
  const widths = stats.map((_, i) => i === stats.length-1 ? 9100 - w*(stats.length-1) : w);
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ children: stats.map((s, i) => new TableCell({
      borders: { top: thickBorder, bottom: thickBorder, left: thickBorder, right: thickBorder },
      shading: { fill: s.bg || NAVY, type: ShadingType.CLEAR },
      width: { size: widths[i], type: WidthType.DXA },
      margins: { top: 180, bottom: 180, left: 140, right: 140 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.value, font: 'Arial', size: 52, bold: true, color: MINT })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: s.label, font: 'Arial', size: 20, bold: true, color: WHITE })] }),
        ...(s.sub ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.sub, font: 'Arial', size: 16, color: 'A0AEC0' })] })] : []),
      ]
    })) })]
  });
}

// SWOT
function swotTable() {
  const colWidths = [4550, 4550];
  const cell = (title, items, bg, titleColor) => new TableCell({
    borders: { top: { style: BorderStyle.SINGLE, size: 6, color: titleColor }, bottom: border, left: border, right: border },
    shading: { fill: bg, type: ShadingType.CLEAR },
    width: { size: 4550, type: WidthType.DXA }, margins: { top: 160, bottom: 160, left: 180, right: 180 },
    children: [
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: title, font: 'Arial', size: 24, bold: true, color: titleColor })] }),
      ...items.map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 70 },
        children: [new TextRun({ text: t, font: 'Arial', size: 20, color: DARK_TEXT })] }))
    ]
  });
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [
      new TableRow({ children: [
        cell('Strengths', [
          'Zero investment minimum — round-ups from as little as £0.01',
          'Only UK app combining full AI advisory + self-directed portfolios + micro-saving + conversational AI coach',
          'Accessible pricing (£0–£6.99/mo) vs competitors charging up to £15/mo or 0.75% AUM',
          'Lean Year 1 cost base — 2 developers at £60K total; founder-led with low overhead',
          'Radically simple UX — designed to eliminate complexity Plum and Chip users complain about',
          'Founder brings QA, agile delivery, and cross-team collaboration skills from Wipro (global enterprise)',
          'Multi-stream revenue model (subscriptions + AUM fees + brand collaborations)',
          'Dual platform: fully built web app + iOS/Android mobile app at MVP stage',
        ], 'ECFDF5', GREEN),
        cell('Weaknesses', [
          'No existing user base, brand recognition, or track record — starting from zero in a crowded market',
          'Year 1 funding gap of £58K — own capital (£60K) does not fully cover projected budget (£118K)',
          'Small engineering team (2 developers) limits feature velocity vs well-funded rivals',
          'FCA regulatory process is slow and expensive — authorisation delays can stall launch',
          'No existing compliance infrastructure — FCA AR model limits product scope in Year 1',
          'AI chat quality depends on OpenAI API — third-party dependency introduces cost and quality risks',
          'Founder has no prior fintech or startup founding experience',
        ], 'FEF2F2', RED),
      ]}),
      new TableRow({ children: [
        cell('Opportunities', [
          'UK fintech market growing from £11.2B (2021) to estimated £34.2B (2026) — 205% expansion',
          '38% of UK adults have no savings habit — massive underserved TAM of disengaged consumers',
          'Mature Open Banking infrastructure (TrueLayer, Plaid) removes technical barriers for new entrants',
          'Competitor UX frustration is documented and widespread — Plum and Chip users seek simpler alternatives',
          'Micro-investing growing 31% YoY — tailwinds already in market; HAY-M arrives at the right time',
          'AI cost reduction — OpenAI API pricing trends downward, improving unit economics over time',
          'Innovate UK Smart Grants (up to £50K) and UK angel networks actively funding early-stage fintech',
          'Employer financial wellbeing partnerships — growing HR trend creates B2B acquisition channel',
          'European expansion via FCA passporting from 2029 — Republic of Ireland as first target market',
        ], 'FFFBEB', AMBER),
        cell('Threats', [
          'Monzo, Plum, or Chip could clone HAY-M\'s AI chat and goal features with far greater resources',
          'FCA regulatory tightening — evolving Consumer Duty rules could increase compliance costs unexpectedly',
          'User trust barriers — financial data sharing anxiety may slow adoption among privacy-conscious consumers',
          'UK economic downturn — reduces discretionary spending and therefore round-up volumes',
          'Seed funding market tightening — UK VC investment in fintech declined post-2022',
          'Key developer attrition — loss of either Year 1 engineer before MVP would critically delay delivery',
          'OpenAI API disruption — pricing changes or API deprecation could impact the AI advisor mid-development',
          'Market saturation — 12M+ UK users already on fintech apps; differentiation must be sharp',
        ], 'F0F4F8', '374151'),
      ]}),
    ]
  });
}

// ── Main document ─────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: 'subbullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u25E6', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
    { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
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

    // ── COVER PAGE ────────────────────────────────────────────────────────────
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 1440, left: 0 } } },
      children: [
        new Table({ width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders, shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA }, margins: { top: 1600, bottom: 1800, left: 1440, right: 1440 },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'HAY-M', font: 'Arial', size: 96, bold: true, color: MINT })] }),
              new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'HAY-MONEY', font: 'Arial', size: 32, color: '4ADE80', bold: false })] }),
              new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Micro-Savings & AI-Powered Investment Platform', font: 'Arial', size: 34, color: WHITE })] }),
              new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'BUSINESS PLAN  |  UNITED KINGDOM  |  2026–2029', font: 'Arial', size: 24, color: '94A3B8', bold: false })] }),
            ]
          })]})],
        }),
        ...spacer(1),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [new TextRun({ text: 'Prepared by: Moin Siddiqui, Founder & CEO', font: 'Arial', size: 22, color: DARK_TEXT, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: 'April 2026  |  Version 2.1  |  STRICTLY CONFIDENTIAL', font: 'Arial', size: 20, color: MID_GREY })] }),
        ...spacer(1),
        statsRow([
          { label: 'Starting Capital', value: '\u00A360K', sub: 'Own investment (Moin Siddiqui)' },
          { label: 'MVP Complete', value: 'Q4 2026', sub: 'Full web + mobile build' },
          { label: 'Public Launch', value: 'Q2 2027', sub: 'App Store + Web live' },
          { label: 'Break-Even Target', value: 'Month 36', sub: 'Base case projection' },
        ]),
        ...spacer(2),
        new Table({ width: { size: 9100, type: WidthType.DXA }, columnWidths: [3000, 6100],
          rows: [
            ['Document Type', 'Business Plan — HAY-M Micro-Savings & AI Investment Platform'],
            ['Version', '2.1 (Updated Edition — April 2026)'],
            ['Founder', 'Moin Siddiqui, Founder & CEO  |  hello@hay-m.co.uk'],
            ['Website', 'www.hay-m.co.uk'],
            ['Contact', 'linkedin.com/in/moinas'],
            ['Registration', 'England & Wales (in formation)'],
          ].map(([l,v]) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: l, bold: true, size: 20, color: NAVY, font: 'Arial' })] })] }),
            new TableCell({ borders, width: { size: 6100, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, color: DARK_TEXT, font: 'Arial' })] })] }),
          ]})),
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },

    // ── MAIN CONTENT ──────────────────────────────────────────────────────────
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
        children: [new TextRun({ text: 'HAY-M Business Plan  |  Confidential  |  Moin Siddiqui, Founder & CEO  |  April 2026', font: 'Arial', size: 18, color: MID_GREY })]
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

        // ── 1. Executive Summary ─────────────────────────────────────────────
        h1('1. Executive Summary'),
        body('HAY-M (Hay-Money) is a UK-based fintech platform designed to make saving and investing effortless, automated, and accessible to everyone — regardless of financial background or income level.'),
        ...spacer(1),
        h3('What HAY-M Does'),
        body('HAY-M connects to users\' bank accounts via Open Banking APIs and automatically rounds up every card transaction to the nearest pound, sweeping the difference into a savings pot. Users set daily, monthly, and yearly saving goals, and choose how their accumulated savings grow — either via self-directed portfolios or an AI-powered investment advisor.'),
        ...spacer(1),
        h3('The Problem It Solves'),
        bullet('38% of UK adults have no regular savings habit [1]'),
        bullet('57% of UK adults hold no investments of any kind [2]'),
        bullet('67% of 18–35s want automated saving tools but don\'t know where to start [3]'),
        bullet('Micro-investing is growing at 31% year-on-year, yet most platforms still require £500+ minimums [4]'),
        bullet('The UK household savings rate was just 6.7% in 2024 — well below the recommended 15–20% [7]'),
        bullet('UK adults ranked 15th out of 26 OECD nations in financial literacy [8]'),
        ...spacer(1),
        h3('Why Now'),
        body('The UK fintech market grew from £11.2B in 2021 to an estimated £34.2B in 2026 — a 205% expansion [5]. Over 12 million UK adults are now on fintech apps [6], and Open Banking infrastructure is mature enough to power real-time savings automation at scale.'),
        ...spacer(1),
        h3('Business Model'),
        body('Freemium subscription (£0 / £2.99 / £6.99 per month) + 0.35% AUM fee on invested assets + brand collaboration revenue.'),
        ...spacer(1),
        h3('Financial Snapshot'),
        ...spacer(1),
        tbl(
          ['Period', 'Revenue', 'Total Costs', 'Net P&L', 'Users'],
          [
            ['Year 1 (2026)', '\u00A30', '\u00A3118K', '-\u00A3118K', '0 (Build Phase)'],
            ['Year 2 (2027)', '\u00A372K', '\u00A3228K', '-\u00A3156K', '8,000'],
            ['Year 3 (2028)', '\u00A3453K', '\u00A3300K', '+\u00A3153K', '45,000'],
            ['Year 4 (2029)', '\u00A31.09M', '\u00A3390K', '+\u00A3700K', '120,000'],
          ],
          [2200, 1600, 1600, 1800, 1900]
        ),
        ...spacer(1),
        h3('Funding'),
        body('Moin Siddiqui is investing £60,000 of personal capital to fund Year 1. A seed round of £300K–£750K will be targeted in Year 2 (H1 2027) once a working MVP and early user traction metrics are established.'),

        // ── 2. Product Overview ──────────────────────────────────────────────
        pb(),
        h1('2. Product Overview'),
        body('HAY-M is a mobile-first fintech application (iOS & Android) built around four principles: simplicity, automation, transparency, and personalisation. A full React web application is also available for desktop and tablet users.'),
        ...spacer(1),
        h2('2.1 Core Features'),
        h3('Round-Up Savings'),
        body('HAY-M connects to users\' current accounts via Open Banking (TrueLayer) [17]. Every card transaction is rounded up to the nearest £1 and the spare change swept automatically into the user\'s savings pot.'),
        h3('Flexible Goal Setting'),
        body('Users set saving targets at daily, monthly, and yearly levels. Smart nudges alert users falling behind, and the system auto-adjusts daily limits within user-defined boundaries.'),
        h3('AI-Powered Investment Advisor'),
        body('A risk profiling questionnaire establishes each user\'s investment appetite. The AI advisor constructs a diversified portfolio across UK equities, global ETFs, bonds, and alternative assets, with automated quarterly rebalancing.'),
        h3('Self-Directed Portfolios'),
        body('HAY-M Plus and Pro subscribers choose from curated portfolios (Cautious, Balanced, Growth, Aggressive) or build their own from approved ETFs and funds.'),
        h3('In-App AI Chat Assistant'),
        body('An embedded AI assistant answers questions about investments, saving performance, and financial goals in plain English — within FCA-compliant guardrails.'),
        h3('Analytics & Insights Dashboard'),
        body('Spending by category, saving rate over time, investment performance, and anonymised peer benchmarking. Weekly insight push notifications drive engagement and retention.'),
        ...spacer(1),
        h2('2.2 Technology Stack'),
        ...spacer(1),
        tbl(
          ['Layer', 'Technology', 'Purpose'],
          [
            ['Mobile App', 'React Native (iOS & Android)', 'Single codebase for both platforms'],
            ['Web App', 'React + Vite (SPA)', 'Browser-based full product experience'],
            ['Backend API', 'Node.js with Express', 'REST API + Socket.IO real-time layer'],
            ['Database', 'PostgreSQL (primary) + Redis (caching)', 'Relational data + fast caching layer'],
            ['ORM', 'Prisma', 'Type-safe database access'],
            ['AI / ML', 'Python (scikit-learn) + OpenAI API', 'Risk profiling, portfolio AI, chat advisor'],
            ['Cloud', 'AWS (EC2, RDS, S3, Lambda, CloudFront)', 'Production infrastructure'],
            ['Open Banking', 'TrueLayer [17]', 'Account linking, transaction feed, balance data'],
            ['Payments', 'Stripe Connect [19]', 'Subscription billing, PCI DSS compliant'],
            ['KYC / AML', 'Onfido [18]', 'Identity verification, document checks'],
            ['Authentication', 'Auth0 with MFA', 'User identity, biometric, session management'],
            ['Notifications', 'AWS SNS + Firebase', 'Push, email, in-app messaging'],
          ],
          [2200, 3400, 3500]
        ),
        ...spacer(1),
        h2('2.3 Security Architecture'),
        bullet('All data encrypted in transit (TLS 1.3) and at rest (AES-256)'),
        bullet('Biometric authentication (Face ID / fingerprint) as default app lock'),
        bullet('Tokenisation of all bank credentials — HAY-M never stores raw account details'),
        bullet('Annual third-party penetration testing from Day 1'),
        bullet('ISO 27001 compliance roadmap initiated in Year 1'),
        bullet('GDPR-compliant data architecture with full audit logging [24]'),

        // ── 3. Problem Statement ─────────────────────────────────────────────
        pb(),
        h1('3. Problem Statement'),
        body('The United Kingdom faces a profound and worsening savings and investment gap. Despite being one of the world\'s wealthiest economies, millions of UK adults are financially vulnerable — not through lack of income, but through lack of accessible, engaging, and automated tools.'),
        ...spacer(1),
        h2('3.1 Market Evidence'),
        ...spacer(1),
        tbl(
          ['Metric', 'Data Point', 'Source'],
          [
            ['Adults with no regular savings habit', '38%', '[1] FCA Financial Lives 2024'],
            ['Adults with no investment of any kind', '57%', '[2] FCA Financial Lives 2024'],
            ['18–35s wanting automated saving tools', '67%', '[3] Accenture UK Fintech 2024'],
            ['Micro-investing YoY growth rate', '31%', '[4] Statista UK 2024'],
            ['UK fintech market size (2026 est.)', '\u00A334.2B', '[5] KPMG Pulse of Fintech H2 2024'],
            ['UK fintech app users', '12M+', '[6] Statista 2025'],
            ['Average UK household savings rate', '6.7%', '[7] ONS 2024'],
            ['UK financial literacy rank (OECD)', '15th of 26', '[8] OECD/INFE 2023'],
          ],
          [4000, 2000, 3100]
        ),
        ...spacer(1),
        h2('3.2 Pain Points in Detail'),
        h3('Low Savings Rate'),
        body('38% of UK adults have no regular savings habit [1], and the average savings rate of 6.7% [7] is less than half the recommended 15–20% for financial resilience. Cost-of-living pressures have made discretionary saving feel impossible for many young adults.'),
        h3('Barrier to Investing'),
        body('57% of UK adults hold no investments of any kind [2]. Most investment platforms require £500–£5,000 minimums, immediately excluding the majority of 18–30 year olds. Complex terminology further deters first-time investors.'),
        h3('No Automation'),
        body('Only 18% of UK adults use any form of micro-saving app, despite 67% expressing interest in automated tools [3]. Saving still relies on manual bank transfers — an act of willpower most people fail to sustain.'),
        h3('Financial Literacy Gap'),
        body('A 2023 OECD study ranked UK adults 15th out of 26 nations in financial literacy [8]. Young adults, immigrants, and gig economy workers are disproportionately affected.'),

        // ── 4. Value Proposition ─────────────────────────────────────────────
        pb(),
        h1('4. Value Proposition & Pricing'),
        h2('4.1 Subscription Tiers'),
        ...spacer(1),
        tbl(
          ['Tier', 'Monthly Price', 'Annual Price', 'Key Features'],
          [
            ['HAY-M Free', '\u00A30/month', '\u00A30', 'Round-up savings, basic goal setting, spending overview, 1 savings goal'],
            ['HAY-M Plus', '\u00A32.99/month', '\u00A329.99/yr (save 17%)', 'Full analytics, multiple goals, curated portfolios, portfolio tracking, ISA access'],
            ['HAY-M Pro', '\u00A36.99/month', '\u00A369.99/yr (save 17%)', 'Full AI advisor, tax-loss harvesting, AI auto-save limits, priority support'],
          ],
          [1800, 1800, 2200, 3300]
        ),
        ...spacer(1),
        h2('4.2 Competitor Benchmarking'),
        ...spacer(1),
        tbl(
          ['Feature', 'HAY-M', 'Monzo [12]', 'Plum [10]', 'Chip [11]', 'Nutmeg [13]'],
          [
            ['Round-Up Savings', '\u2713 Core', '\u2713 Limited', '\u2713 Core', '\u2713 Core', '\u2717'],
            ['Full AI Investment Advisor', '\u2713 Full AI', '\u2717', '\u2717 Rules', '\u2717 Rules', '\u2717'],
            ['In-App AI Chat Coach', '\u2713', '\u2717', '\u2717', '\u2717', '\u2717'],
            ['Self-Directed Portfolios', '\u2713', '\u2717', '\u2713', '\u2717', '\u2713 Full'],
            ['Flexible Goals (Daily/Mo/Yr)', '\u2713 Full', '\u2713 Basic', '\u2713', '\u2717 Basic', '\u2717'],
            ['Zero Investment Minimum', '\u2713 \u00A30', 'N/A', '\u2713 \u00A31', '\u2713 \u00A31', '\u2717 \u00A3500'],
            ['7-Day In-App Support', '\u2713', '\u2713', '\u2717', '\u2717', '\u2717'],
            ['Max Monthly Cost', '\u00A36.99', '\u00A315.00', '\u00A39.99', 'varies', '0.75% AUM'],
            ['Unified Saving + Investing UX', '\u2713', '\u2717', '\u2717 complex', '\u2717', '\u2717'],
          ],
          [2800, 1300, 1300, 1200, 1200, 1300]
        ),
        ...spacer(1),
        body('Sources: Plum [22], Chip [32], Monzo [12], Nutmeg [13], app store reviews. Verified April 2026.'),

        // ── 5. Competitive Analysis ──────────────────────────────────────────
        pb(),
        h1('5. Competitive Analysis — How HAY-M Wins'),
        body('The UK micro-savings and investment app market has several established players. This section provides an honest, evidence-based assessment of each major competitor — their strengths, documented weaknesses, and how HAY-M specifically addresses the gaps they leave open.'),
        ...spacer(1),

        h2('5.1 Plum'),
        tbl(['Detail', 'Data'], [
          ['Founded', '2016 (London)'],
          ['Users', '2M+ registered users [27]'],
          ['Trustpilot', '4.1 / 5 (6,300 reviews) [27]'],
          ['Pricing', 'Free tier + paid plans up to £9.99/month [22]'],
          ['AUM Fee', '0.45% platform fee + fund management fee 0.06%–1.06% [24]'],
          ['FCA Status', 'Regulated — FRN 836158 (Plum Fintech Ltd) [28]'],
        ], [2500, 6600], '1C3D6E'),
        ...spacer(1),
        h3('Plum Strengths'),
        bullet('Strong automation: AI analyses spending and deposits automatically every few days [23]'),
        bullet('Broad product suite: Cash ISA, Lifetime ISA, Stocks & Shares ISA, SIPP, money market fund'),
        bullet('2M+ users and strong brand recognition as "Best UK Personal Finance App" (British Bank Awards 2023)'),
        bullet('Invest from £1 with access to 3,000 stocks and 26 funds including Vanguard, BlackRock, Legal & General'),
        h3('Plum Verified Weaknesses'),
        bullet('Overly complex UX — saving into an ISA requires 5+ steps: using a "Brain", setting a rule, linking an account, depositing to a pot, then manually transferring monthly [30]'),
        bullet('Technical instability: frequent crashes, failed money transfers, and persistent errors documented in App Store/Play Store reviews [28][30]'),
        bullet('High fees for full access: premium plans at £9.99/month vs HAY-M Pro at £6.99 [22]'),
        bullet('No personalised AI investment chat — automation is rules-based, not conversational'),
        bullet('No daily/monthly/yearly goal hierarchy — goal setting is basic vs HAY-M\'s flexible structure [23]'),
        h3('HAY-M Advantage vs Plum'),
        body('HAY-M is designed with radical simplicity at its core — a direct response to Plum\'s documented UX complexity. Where Plum requires 5+ steps to automate ISA contributions, HAY-M achieves the same outcome in 2 taps. HAY-M\'s AI chat advisor is also a genuine differentiator: rather than pre-set "Brain" rules, users converse naturally with an AI that explains, adjusts, and coaches them.'),
        ...spacer(1),

        h2('5.2 Chip'),
        tbl(['Detail', 'Data'], [
          ['Founded', '2017 (London)'],
          ['Users', '500K+ registered users [32]'],
          ['Trustpilot', '4.5 / 5 (4,100+ reviews) [40]'],
          ['App Store', '4.7 / 5 (38,000+ reviews) [40]'],
          ['Pricing', 'Free savings; paid plans for full investing features [36]'],
          ['AUM Fee', '0.50% platform fee for fund access [36]'],
          ['Notable', 'Winner: Best Personal Finance App — British Bank Awards 2019, 2022, 2024, 2025 [33]'],
        ], [2500, 6600], '1C3D6E'),
        ...spacer(1),
        h3('Chip Strengths'),
        bullet('Consistently award-winning: Best Personal Finance App four times at British Bank Awards [33]'),
        bullet('Fast onboarding — reviewers note setup takes under 4 minutes [38]'),
        bullet('Prize Savings Account: monthly draw with prizes up to £75,000 — a novel savings incentive [37]'),
        bullet('Strong autosave AI — sets aside money users "won\'t even miss" within 24 hours of setup'),
        h3('Chip Verified Weaknesses'),
        bullet('Limited investment choice: only 15 funds available — no individual stocks, no ISA stock-picking [36]'),
        bullet('Technical reliability issues: documented "connectivity issues" and app unreliability during high-activity periods [36]'),
        bullet('No phone support; weekday-only chat and email — a significant gap for users needing weekend help [36]'),
        bullet('No flexible goal hierarchy (daily/monthly/yearly targets) [32]'),
        bullet('No AI investment advisory chat — automation is pre-set, not conversational'),
        h3('HAY-M Advantage vs Chip'),
        body('HAY-M directly addresses Chip\'s two biggest gaps: investment breadth and AI personalisation. While Chip locks investors into 15 funds, HAY-M offers self-directed portfolios with multi-asset allocation plus a full AI advisor. HAY-M also offers 7-day in-app support and a daily/monthly/yearly goal framework that gives users far more granular control.'),
        ...spacer(1),

        h2('5.3 Monzo'),
        tbl(['Detail', 'Data'], [
          ['Founded', '2015 (London)'],
          ['Users', '7.5M+ customers [40]'],
          ['Pricing', 'Free, Plus (£5/mo), Premium (£15/mo) [12]'],
          ['FCA Status', 'Full FCA authorisation — banking licence [12]'],
        ], [2500, 6600], '1C3D6E'),
        ...spacer(1),
        h3('Monzo Strengths'),
        bullet('Largest UK challenger bank by customer base — 7.5M+ users and £3.7B valuation'),
        bullet('Full current account with FSCS protection — users trust Monzo with primary banking'),
        bullet('Excellent brand recognition and community among young UK adults'),
        h3('Monzo Verified Weaknesses'),
        bullet('No investment product — Monzo does not offer any equity, fund, or portfolio investing [12]'),
        bullet('Round-up savings are limited — no automatic investment of rounded-up funds'),
        bullet('No AI investment advisor of any kind'),
        bullet('Premium plan costs £15/month — significantly more expensive than HAY-M Pro at £6.99 [12]'),
        h3('HAY-M Advantage vs Monzo'),
        body('Monzo and HAY-M serve complementary needs — Monzo is a primary bank, HAY-M is a savings and investment companion. HAY-M\'s round-ups can link to any UK current account (including Monzo), turning passive spending into active investing — a use case Monzo itself cannot fulfil.'),
        ...spacer(1),

        h2('5.4 Nutmeg'),
        tbl(['Detail', 'Data'], [
          ['Founded', '2011 (London) — acquired by J.P. Morgan 2021'],
          ['Users', '200,000+ (est.)'],
          ['Pricing', 'No monthly fee; 0.75% AUM fee (fully managed) [13]'],
          ['Investment Min', '£500 (fully managed); £100 (fixed allocation) [13]'],
          ['FCA Status', 'Full FCA authorisation'],
        ], [2500, 6600], '1C3D6E'),
        ...spacer(1),
        h3('Nutmeg Verified Weaknesses'),
        bullet('£500 minimum investment — immediately excludes HAY-M\'s core 18–35 target audience [13]'),
        bullet('No savings automation or round-up features — purely an investment platform'),
        bullet('No AI conversational advisor — portfolio is managed by algorithms, not explained by chat'),
        bullet('No free tier — cost starts at 0.75% AUM from day one, making it expensive for small balances'),
        h3('HAY-M Advantage vs Nutmeg'),
        body('Nutmeg serves a fundamentally different customer — someone who already has £500+ and wants a "set and forget" robo-advisor. HAY-M serves the customer who doesn\'t yet have that £500 and needs help building it. HAY-M is the logical entry point before a user might ever consider Nutmeg.'),
        ...spacer(1),

        h2('5.5 The HAY-M Gap in the Market'),
        body('No single competitor combines all five of HAY-M\'s defining capabilities in one app at one accessible price point:'),
        ...[
          '(1) Round-up automation via Open Banking',
          '(2) Full AI investment advisor with risk profiling and portfolio construction',
          '(3) Conversational AI coaching in plain English',
          '(4) Flexible daily/monthly/yearly goal hierarchy',
          '(5) Self-directed portfolios alongside automated options',
        ].map((t, i) => new Paragraph({ numbering: { reference: 'numbers', level: 0 }, spacing: { after: 80 },
          children: [new TextRun({ text: t, size: 22, color: DARK_TEXT, font: 'Arial' })] })),
        ...spacer(1),
        body('Plum comes closest but fails on UX simplicity and AI depth. Chip wins on user satisfaction but lacks investment breadth. Monzo dominates banking but doesn\'t invest. Nutmeg invests well but excludes those without existing capital. HAY-M is engineered to occupy the gap left by all four — serving the underserved majority of UK adults who want to save automatically, invest intelligently, and understand what their money is doing.'),

        // ── 6. Target Market ─────────────────────────────────────────────────
        pb(),
        h1('6. Target Market'),
        h2('6.1 Customer Segments'),
        h3('Primary — Young Professionals (18–35)'),
        bullet('Demographics: Age 18–35, employed or self-employed, income £18K–£45K, urban UK'),
        bullet('67% in this cohort express desire for automated saving tools [3]'),
        bullet('Most likely to be on fintech apps: 12M+ UK fintech users are predominantly 18–40 [6]'),
        ...spacer(1),
        h3('Secondary — Gig Economy Workers'),
        bullet('Demographics: Age 22–45, freelancers, delivery drivers, variable income'),
        bullet('No employer pension; highly responsive to automatic, variable savings (round-ups scale with spending)'),
        bullet('Gig economy comprises approximately 5M UK workers as of 2024 [9]'),
        ...spacer(1),
        h3('Tertiary — Students & Recent Graduates'),
        bullet('Age 18–25; financially independent for first time; high digital adoption'),
        bullet('Goal: build savings habits from scratch; low risk tolerance; educational value of AI chat'),
        ...spacer(1),
        h2('6.2 Market Sizing'),
        ...spacer(1),
        tbl(
          ['Market', 'Definition', 'Size', 'Basis'],
          [
            ['TAM', 'All UK adults 18–55 with smartphone + bank account', '\u00A34.2B', 'FCA/ONS population data [1][7]'],
            ['SAM', 'UK adults 18–40 open to fintech micro-saving', '\u00A31.1B', 'Statista UK fintech penetration [6]'],
            ['SOM', '3-year realistic capture (120K users by end of 2029)', '\u00A328M', 'Internal projection at \u00A32.40 ARPU [4]'],
          ],
          [1200, 4000, 1500, 2400]
        ),

        // ── 7. Regulatory ────────────────────────────────────────────────────
        pb(),
        h1('7. Regulatory & Compliance Strategy'),
        body('Regulatory compliance is a foundational priority for HAY-M. The FCA maintains high standards for consumer finance products, and HAY-M will engage the regulatory pathway from Day 1.'),
        ...spacer(1),
        h2('7.1 FCA Licensing Pathway'),
        bullet('Phase 1 (Q2–Q3 2026): Apply for FCA Regulatory Sandbox [14] — allows testing with real users under supervisory oversight before full authorisation'),
        bullet('Phase 2 (Q3 2026 – Q2 2027): Operate as Appointed Representative (AR) [15] under an FCA-authorised principal firm while full application is processed'),
        bullet('Phase 3 (Q3 2027): Achieve direct FCA authorisation with permissions for arranging deals in investments, communicating financial promotions, and operating as an e-money institution'),
        ...spacer(1),
        h2('7.2 Compliance Framework'),
        ...spacer(1),
        tbl(
          ['Area', 'Requirement', 'HAY-M Approach'],
          [
            ['KYC / AML', 'Money Laundering Regulations 2017 [23]', 'Onfido automated identity verification at onboarding [18]'],
            ['Data Protection', 'UK GDPR / Data Protection Act 2018 [24]', 'Privacy-by-design; DPO appointed by Month 6'],
            ['Financial Promotions', 'FCA COBS 4', 'All marketing reviewed by compliance consultant pre-publication'],
            ['Consumer Duty', 'FCA PS22/9 [16]', 'Outcome-based product design; regular consumer outcome testing'],
            ['Investment Advice', 'FCA COBS 9A', 'AI advice framed as "guidance" until full advisory permissions granted'],
            ['Fraud Prevention', 'Payment Services Regulations 2017', 'Real-time anomaly detection; FCA-compliant audit trail'],
          ],
          [2200, 3200, 3700]
        ),
        ...spacer(1),
        h2('7.3 Key Compliance Partners'),
        bullet('KYC/AML: Onfido [18] — automated ID verification, document checks, liveness detection'),
        bullet('Custodian/Broker: DriveWealth or Alpaca — FCA-authorised; client assets held in segregated accounts'),
        bullet('Payment Processor: Stripe Connect [19] — PCI DSS Level 1 certified'),
        bullet('Open Banking: TrueLayer [17] — FCA-registered Account Information Service Provider'),
        bullet('Legal Counsel: Specialist FCA regulatory solicitor engaged Q2 2026'),

        // ── 8. Business Model ────────────────────────────────────────────────
        pb(),
        h1('8. Business Model & Revenue Streams'),
        h2('8.1 Revenue Stream 1: Subscriptions (Primary)'),
        ...spacer(1),
        tbl(
          ['Tier', 'Price', 'Target Mix (Yr 3)', 'Annual Revenue/User'],
          [
            ['HAY-M Free', '\u00A30', '55%', '\u00A30'],
            ['HAY-M Plus', '\u00A32.99/month', '30%', '\u00A335.88'],
            ['HAY-M Pro', '\u00A36.99/month', '15%', '\u00A383.88'],
          ],
          [2500, 2000, 2500, 2100]
        ),
        ...spacer(1),
        h2('8.2 Revenue Stream 2: AUM Fees'),
        body('0.35% annual fee on all assets under management. At 45,000 users in Year 3, with average AUM of £1,500 per investing user (40% of users investing), this generates approximately £94,500 annually — growing rapidly as user assets compound.'),
        ...spacer(1),
        h2('8.3 Revenue Stream 3: Brand Collaborations'),
        body('Referral commissions from complementary financial brands (insurance, cashback platforms, budgeting tools). Target: £55K in Year 3, scaling to £150K+ in Year 4. All partnerships curated to maintain user trust and FCA compliance.'),
        ...spacer(1),
        h2('8.4 Revenue Stream 4: Premium Features (Year 3+)'),
        body('Financial coaching sessions (£15/session), premium portfolio analytics add-on (£0.99/month), group savings challenges with brand-sponsored prizes.'),
        ...spacer(1),
        h2('8.5 Unit Economics'),
        ...spacer(1),
        tbl(
          ['Metric', 'Year 2 (2027)', 'Year 3 (2028)', 'Year 4 (2029)'],
          [
            ['Monthly Active Users', '8,000', '45,000', '120,000'],
            ['ARPU', '\u00A30.75', '\u00A32.40', '\u00A34.20'],
            ['CAC', '\u00A312.00', '\u00A38.00', '\u00A36.00'],
            ['LTV', '\u00A348', '\u00A3120', '\u00A3210'],
            ['LTV:CAC Ratio', '4:1', '15:1', '35:1'],
            ['Monthly Churn', '4.5%', '3.0%', '2.0%'],
            ['Avg Payback Period', '16 months', '3.3 months', '1.4 months'],
          ],
          [3200, 1900, 1900, 2100]
        ),

        // ── 9. Go-To-Market ──────────────────────────────────────────────────
        pb(),
        h1('9. Go-To-Market Strategy'),
        ...spacer(1),
        tbl(
          ['Phase', 'Timeline', 'Budget', 'Activities'],
          [
            ['Phase 1\nPre-Launch', 'Q2\u2013Q4 2026', '\u00A35,000', 'Waitlist via LinkedIn, TikTok personal finance content, Reddit (r/UKPersonalFinance). 2\u20133 UK micro-influencers in personal finance niche (10K\u2013100K followers). "HAY-M Beta Access" email campaign \u2014 early sign-ups receive 3 months free HAY-M Plus. Target earned media in AltFi, Finextra, Sifted [21]. Founder builds personal brand as UK fintech entrepreneur.'],
            ['Phase 2\nMVP Complete', 'Q4 2026', '\u2014', 'Internal alpha complete. App Store submission (Apple + Google Play). Closed beta with 500\u20131,000 users. Iterate on feedback.'],
            ['Phase 3\nPublic Launch', 'Q2 2027', '\u00A38,000', 'Full App Store + Google Play public launch with curated review strategy (target 4.5+ rating). Referral programme: \u00A35 HAY-M credit for every friend who makes their first round-up. Google Ads pilot: "save money app UK", "micro investing UK". PR outreach: BBC Money Box, Guardian Money, ThisIsMoney. University campus ambassador programme: 5 UK universities.'],
            ['Phase 4\nSeed & Growth', 'Q3 2027+', 'Seed-funded', 'Scale paid digital acquisition across Meta, Google, TikTok \u2014 targeting \u00A36\u20138 CAC. Employer savings partnerships with mid-size UK companies. Open Banking data partnerships. 30-day savings challenges with prize pools \u2014 viral sharing mechanic.'],
          ],
          [1400, 1400, 1200, 5100]
        ),
        ...spacer(1),
        h2('9.2 Retention Mechanics'),
        bullet('Weekly "Money Snapshot" push notification — personalised savings summary every Monday'),
        bullet('In-app streak rewards: 30-day saving streak unlocks a HAY-M badge'),
        bullet('Goal milestone celebrations: confetti + shareable card on reaching a savings target'),
        bullet('Monthly "HAY-M Digest" email — market insights, tips, user stories'),

        // ── 10. Technology & Architecture ────────────────────────────────────
        pb(),
        h1('10. Technology & Architecture'),
        body('HAY-M is cloud-native and microservices-oriented on AWS — designed to scale from hundreds to hundreds of thousands of concurrent users without architectural rework.'),
        ...spacer(1),
        h2('10.1 Core Services Architecture'),
        ...spacer(1),
        tbl(
          ['Service', 'Technology', 'Purpose'],
          [
            ['Mobile App', 'React Native', 'Single codebase for iOS and Android'],
            ['Web App', 'React + Vite SPA', 'Browser-based full product experience'],
            ['API Gateway', 'AWS API Gateway + Kong', 'Rate limiting, auth, routing'],
            ['Auth Service', 'Auth0 + MFA', 'User identity, biometric, session management'],
            ['Savings Engine', 'Node.js + PostgreSQL', 'Round-up calculation, pot management, goal tracking'],
            ['Investment Service', 'Node.js + Python', 'Portfolio management, rebalancing, trade execution'],
            ['AI Advisor', 'Python + OpenAI API', 'Risk profiling, portfolio construction, AI chat'],
            ['Open Banking', 'TrueLayer [17]', 'Account linking, transaction feed, balance data'],
            ['Notifications', 'AWS SNS + Firebase', 'Push, email, in-app messaging'],
            ['Fraud Detection', 'Python ML + AWS Fraud Detector', 'Real-time anomaly detection on transactions'],
          ],
          [2500, 2800, 3800]
        ),
        ...spacer(1),
        h2('10.2 AI Strategy'),
        h3('AI Investment Advisor'),
        body('Risk profiling questionnaire (10 questions) feeds into a machine learning model. Output is an asset allocation across equities (UK, US, Emerging Markets), bonds, and alternatives. Rebalancing triggers when any asset class drifts more than 5% from target. Tax-loss harvesting logic flags opportunities quarterly for Pro subscribers.'),
        h3('Smart Goal Engine'),
        body('ML model analyses spending patterns via Open Banking transaction feed to suggest achievable saving targets. Adapts daily round-up multipliers automatically when users set or change goals. Sends predictive nudges 48 hours before a user is likely to fall short of a weekly target.'),
        h3('In-App AI Chat'),
        body('Powered by OpenAI API with a custom system prompt constraining responses to FCA-compliant guidance (not regulated advice). All conversations logged for compliance audit trail.'),
        ...spacer(1),
        h2('10.3 Scalability'),
        bullet('Microservices in Docker containers via AWS ECS / Fargate'),
        bullet('PostgreSQL with read replicas for high-throughput queries'),
        bullet('Redis caching layer for frequently accessed user data'),
        bullet('99.9% uptime SLA target; multi-AZ deployment from launch'),
        bullet('Blue/green deployment pipeline for zero-downtime releases'),

        // ── 11. Financial Projections ─────────────────────────────────────────
        pb(),
        h1('11. Financial Projections (2026–2029)'),
        h2('11.1 Year 1 (2026) — Foundation Budget: £118,000'),
        ...spacer(1),
        tbl(
          ['Cost Category', 'Annual Budget', 'Notes'],
          [
            ['Engineering Staff (2 developers)', '\u00A360,000', '2 developers capped at \u00A330K each; contract/remote'],
            ['Technology & Development', '\u00A320,000', 'AWS, third-party APIs, dev tooling, licences'],
            ['Marketing & User Acquisition', '\u00A310,000', 'Pre-launch waitlist, social content, influencers'],
            ['Legal & Regulatory (FCA)', '\u00A312,000', 'FCA sandbox application, compliance consultant'],
            ['Operations & Admin', '\u00A38,000', 'Company formation, accounting, cloud operations'],
            ['Contingency Reserve', '\u00A38,000', 'Overrun buffer; kept liquid'],
            ['TOTAL', '\u00A3118,000', 'vs \u00A360K own capital \u2014 see funding gap strategy (Section 14)'],
          ],
          [4200, 1900, 3000]
        ),
        ...spacer(1),
        h2('11.2 Full P&L Projection (2026–2029)'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [3200, 1400, 1500, 1500, 1500],
          rows: [
            new TableRow({ tableHeader: true, children: ['Revenue / Cost Item', '2026', '2027', '2028', '2029'].map((h, ci) =>
              new TableCell({ borders, width: { size: [3200,1400,1500,1500,1500][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              { label: 'Subscription Revenue', vals: ['\u00A30', '\u00A352K', '\u00A3290K', '\u00A3720K'], isSection: false },
              { label: 'AUM Fees (0.35%)', vals: ['\u00A30', '\u00A38K', '\u00A394K', '\u00A3240K'], isSection: false },
              { label: 'Brand Collaborations', vals: ['\u00A30', '\u00A310K', '\u00A355K', '\u00A3110K'], isSection: false },
              { label: 'Premium Features', vals: ['\u00A30', '\u00A32K', '\u00A314K', '\u00A320K'], isSection: false },
              { label: 'TOTAL REVENUE', vals: ['\u00A30', '\u00A372K', '\u00A3453K', '\u00A31,090K'], isTotal: true },
              { label: 'Engineering Staff', vals: ['\u00A360K', '\u00A390K', '\u00A3130K', '\u00A3180K'], isSection: false },
              { label: 'Technology & Infra', vals: ['\u00A320K', '\u00A338K', '\u00A355K', '\u00A370K'], isSection: false },
              { label: 'Marketing', vals: ['\u00A310K', '\u00A340K', '\u00A360K', '\u00A380K'], isSection: false },
              { label: 'Legal & Compliance', vals: ['\u00A312K', '\u00A325K', '\u00A328K', '\u00A330K'], isSection: false },
              { label: 'Operations', vals: ['\u00A38K', '\u00A320K', '\u00A318K', '\u00A320K'], isSection: false },
              { label: 'Contingency / Other', vals: ['\u00A38K', '\u00A315K', '\u00A39K', '\u00A310K'], isSection: false },
              { label: 'TOTAL COSTS', vals: ['\u00A3118K', '\u00A3228K', '\u00A3300K', '\u00A3390K'], isTotal: true },
              { label: 'NET P&L', vals: ['-\u00A3118K', '-\u00A3156K', '+\u00A3153K', '+\u00A3700K'], isPnL: true },
            ].map((row, ri) => new TableRow({ children: [
              new TableCell({ borders,
                shading: { fill: row.isTotal ? '1C3D6E' : row.isPnL ? '064E3B' : ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR },
                width: { size: 3200, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: row.label, font: 'Arial', size: 20, bold: row.isTotal || row.isPnL, color: row.isTotal || row.isPnL ? WHITE : DARK_TEXT })] })] }),
              ...row.vals.map((v, vi) => new TableCell({ borders,
                shading: { fill: row.isTotal ? '1C3D6E' : row.isPnL ? '064E3B' : ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
                width: { size: [1400,1500,1500,1500][vi], type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({
                  text: v, font: 'Arial', size: 20,
                  bold: row.isTotal || row.isPnL,
                  color: row.isPnL ? (v.startsWith('+') ? MINT : 'FCA5A5') : row.isTotal ? WHITE : DARK_TEXT,
                })] })]
              }))
            ]}))
          ]
        }),
        ...spacer(1),
        h2('11.3 Sensitivity Analysis'),
        ...spacer(1),
        tbl(
          ['Scenario', 'User Growth/Mo', 'ARPU', 'Churn', 'Yr 3 Revenue', 'Break-Even'],
          [
            ['Bear Case \uD83D\uDC3B', '3%', '\u00A31.20', '5.0%', '\u00A3185K', 'Month 48'],
            ['Base Case \uD83D\uDCCA', '8%', '\u00A32.40', '3.0%', '\u00A3453K', 'Month 36'],
            ['Bull Case \uD83D\uDE80', '15%', '\u00A34.00', '1.5%', '\u00A3980K', 'Month 24'],
          ],
          [2000, 1700, 1200, 1200, 1700, 1300]
        ),

        // ── 12. Team ─────────────────────────────────────────────────────────
        pb(),
        h1('12. Team & Advisors'),
        h2('12.1 Founding Team'),
        h3('Moin Siddiqui — Founder & CEO'),
        body('Moin Siddiqui is a technology professional with a proven track record in quality assurance, test automation, and agile product delivery — built across international projects at Wipro Limited, one of the world\'s leading digital transformation and IT services firms (NYSE: WIT; 230,000+ employees across 65 countries) [26].'),
        ...spacer(1),
        body('At Wipro, Moin worked across on-/off-shore international project teams, demonstrating the ability to coordinate across cultures, time zones, and complex delivery environments — skills that directly transfer to building a distributed fintech team for HAY-M.'),
        ...spacer(1),
        body('Colleagues and senior leadership have described him as:'),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [9100],
          rows: [new TableRow({ children: [new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 6, color: MINT }, bottom: { style: BorderStyle.SINGLE, size: 6, color: MINT }, left: { style: BorderStyle.SINGLE, size: 6, color: MINT }, right: { style: BorderStyle.SINGLE, size: 6, color: MINT } },
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 9100, type: WidthType.DXA }, margins: { top: 160, bottom: 160, left: 240, right: 240 },
            children: [
              new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 80 }, children: [new TextRun({ text: '"A very skilful tester with great test automation know-how and experience. A great asset to each agile team."', font: 'Arial', size: 21, color: WHITE, italics: true })] }),
              new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: '"A reliable QA who asks the right questions... He keeps abreast with trending technologies and has the inclination to learning new skills. He would be an asset to any team for his sheer dedication."', font: 'Arial', size: 21, color: WHITE, italics: true })] }),
              new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 120 }, children: [new TextRun({ text: '— LinkedIn peer recommendations, verified April 2026 [26]', font: 'Arial', size: 18, color: '94A3B8' })] }),
            ]
          })]})],
        }),
        ...spacer(1),
        h3('Founder Skills-to-HAY-M Mapping'),
        ...spacer(1),
        tbl(
          ['Skill', 'Professional Background', 'HAY-M Application'],
          [
            ['Test Automation & QA', 'Built automated test pipelines at enterprise scale (Wipro)', 'Quality-first engineering culture from Day 1 — critical for a regulated fintech handling real user funds'],
            ['Agile Delivery', 'Worked in agile teams across international on/off-shore projects', 'Manages the 2-developer sprint cycle with discipline; knows how to scope MVPs and prevent scope creep'],
            ['Self-Directed Learning', 'Proactively self-enrolled in automation classes without being asked', 'Entrepreneurial mindset — will master fintech regulation, AI product design, and investor relations independently'],
            ['Cross-Team Collaboration', 'Delivered across multinational stakeholder groups', 'Strong foundation for investor communications, partner negotiations, and team scaling post-seed'],
            ['Award-Winning Performance', 'Received Super Achiever Award from CEO-level leadership at Wipro', 'Demonstrates delivery under pressure — essential quality for a founder'],
          ],
          [2000, 2900, 4200]
        ),
        body('LinkedIn: linkedin.com/in/moinas  |  Source: [26]'),
        ...spacer(1),
        h2('12.2 Year 1 Engineering Hires'),
        bullet('Developer 1 — Full-Stack / Backend Engineer (Budget: £30,000/yr): Responsible for Node.js backend, PostgreSQL database, and API integrations (Open Banking, payment rails, custodian). Owns savings engine, round-up logic, and transaction processing.'),
        bullet('Developer 2 — Mobile / Frontend Engineer (Budget: £30,000/yr): Responsible for the React Native mobile application across iOS and Android. Owns user interface, onboarding flow, dashboard, and notification system.'),
        ...spacer(1),
        h2('12.3 Advisory Board (To Be Recruited)'),
        bullet('FCA Legal Advisor — regulatory licensing, financial promotions compliance, Consumer Duty'),
        bullet('Investment Advisor — CFA-qualified; oversight of AI portfolio methodology and investment compliance'),
        bullet('Growth Advisor — UK fintech growth marketer with app launch track record'),
        bullet('Technology Advisor — senior engineer with AWS/financial services scaling experience'),
        ...spacer(1),
        h2('12.4 Post-Seed Hiring Plan (2027+)'),
        tbl(
          ['Role', 'Timeline', 'Responsibilities'],
          [
            ['Chief Compliance Officer (CCO)', 'Q2 2027', 'FCA full authorisation, ongoing compliance management, Consumer Duty'],
            ['Head of Growth', 'Q2 2027', 'User acquisition, referral programme, partnership channels'],
            ['2x Additional Developers', 'Q3 2027', 'Mobile and backend scaling, new feature delivery'],
            ['Customer Success Lead', 'Q3 2027', 'User onboarding, support, NPS improvement, churn reduction'],
          ],
          [3000, 1600, 4500]
        ),

        // ── 13. Roadmap ──────────────────────────────────────────────────────
        pb(),
        h1('13. Roadmap & Milestones'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [1400, 1600, 6100],
          rows: [
            new TableRow({ tableHeader: true, children: ['Phase', 'Period', 'Key Milestones'].map((h, ci) =>
              new TableCell({ borders, width: { size: [1400,1600,6100][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['1\nFoundation', 'Q2\u2013Q3 2026', 'Company formation · Hire 2 developers · FCA sandbox application [14] · UI/UX design system locked · Tech stack finalised · Legal counsel engaged'],
              ['2\nDevelopment', 'Q3\u2013Q4 2026', 'Core savings engine built · Open Banking integration (TrueLayer) [17] · KYC/Onfido onboarding flow [18] · Internal alpha testing · Seed deck prepared · Waitlist 1,000+ sign-ups · App Store submission'],
              ['3\nMVP Complete', 'Q4 2026', 'Full MVP delivered: web + mobile app · Closed beta with 500\u20131,000 users · Iterate on beta feedback · FCA Appointed Representative status active [15] · Revenue model finalised'],
              ['4\nPublic Launch', 'Q2 2027', 'Full App Store + Google Play public launch · Referral programme live · PR outreach (BBC Money Box, Guardian Money) · University ambassador programme (5 UK universities) · Google Ads pilot campaign · Target: 1,000 users in Month 1'],
              ['5\nSeed & Scale', 'Q2\u2013Q4 2027', 'Seed round £300K\u2013£750K raised · Team grows to 5+ FTE · CCO hired · AI advisor fully deployed · Scale paid acquisition (Meta, Google, TikTok) · Employer wellness partnerships · Target: 10,000 MAU'],
              ['6\nProfitability', '2028\u20132029', 'FCA full authorisation achieved · Break-even Month 36 (base case) · 45,000 MAU by end of 2028 · 120,000 MAU by end of 2029 · Series A preparation · EU expansion scoped (Republic of Ireland)'],
            ].map(([phase, period, milestones], ri) => new TableRow({ children: [
              new TableCell({ borders, width: { size: 1400, type: WidthType.DXA },
                shading: { fill: ['064E3B','065F46','047857','059669','0D9488','00D4A1'][ri], type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: phase, font: 'Arial', size: 20, bold: true, color: ri === 5 ? NAVY : WHITE })] })] }),
              new TableCell({ borders, width: { size: 1600, type: WidthType.DXA },
                shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: period, font: 'Arial', size: 20, bold: true, color: NAVY })] })] }),
              new TableCell({ borders, width: { size: 6100, type: WidthType.DXA },
                shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: milestones, font: 'Arial', size: 20, color: DARK_TEXT })] })] }),
            ]}))
          ]
        }),

        // ── 14. Funding Requirements ─────────────────────────────────────────
        pb(),
        h1('14. Funding Requirements'),
        h2('14.1 Year 1 — Own Capital: £60,000'),
        body('Moin Siddiqui invests £60,000 of personal capital. Total Year 1 budget is £118,000 — leaving a gap of £58,000 to be bridged through:'),
        bullet('Developer equity/option packages (below-market contract rates)'),
        bullet('Pre-sales: beta access at £1.99/month to waitlist users pre-launch'),
        bullet('Angel outreach: 3–5 UK fintech angels for a £20–30K bridge in Q3 2026'),
        bullet('Innovate UK Smart Grant: application Q3 2026 (up to £50K available) [20]'),
        ...spacer(1),
        h2('14.2 Year 2 Seed Round: £300,000–£750,000'),
        body('Pursued in H1 2027 once the following conditions are met:'),
        bullet('Working app with 1,000+ real users (achieved at Q4 2026 MVP / Q2 2027 public launch)'),
        bullet('Proven ARPU of £1.50 or above'),
        bullet('Monthly churn below 5%'),
        bullet('FCA Appointed Representative status confirmed [15]'),
        ...spacer(1),
        h2('14.3 Seed Round Use of Funds'),
        ...spacer(1),
        tbl(
          ['Category', 'Allocation', 'Purpose'],
          [
            ['Engineering hires', '35% (~\u00A3210K)', '2\u00D7 additional developers + infrastructure scale-up'],
            ['Marketing & growth', '30% (~\u00A3180K)', 'Paid acquisition, partnerships, PR, referral programme'],
            ['Compliance & legal', '15% (~\u00A390K)', 'FCA full authorisation, CCO hire, ongoing legal'],
            ['Operations', '10% (~\u00A360K)', 'Customer support, admin, tooling'],
            ['Reserve', '10% (~\u00A360K)', '18-month runway buffer'],
          ],
          [2500, 2200, 4400]
        ),

        // ── 15. SWOT Analysis ────────────────────────────────────────────────
        pb(),
        h1('15. SWOT Analysis'),
        body('The following SWOT analysis provides a structured assessment of HAY-M\'s internal position and external environment as of April 2026, drawing on market data, competitor research, and the business plan assumptions outlined in preceding sections.'),
        ...spacer(1),
        swotTable(),
        ...spacer(1),
        h2('15.1 SWOT Strategic Implications'),
        ...spacer(1),
        tbl(
          ['Strategy Type', 'Approach', 'Actions'],
          [
            ['SO — Use Strengths to capture Opportunities', 'Attack the gap Plum/Chip leave open', 'Launch with radical simplicity + AI chat as core differentiator; target Plum/Chip frustrated users directly in marketing'],
            ['WO — Overcome Weaknesses via Opportunities', 'Use market timing to bridge gaps', 'Apply for Innovate UK grant early; leverage FCA sandbox timeline to build credibility with investors before full launch'],
            ['ST — Use Strengths to counter Threats', 'Build community moat before incumbents react', 'Focus on user habit formation and referral loop — community stickiness makes incumbent cloning less effective'],
            ['WT — Minimise Weaknesses, avoid Threats', 'Stay lean; don\'t over-extend Year 1', 'Scope MVP tightly; maintain contingency reserve; get FCA compliance right first time to avoid regulatory setbacks'],
          ],
          [2200, 2500, 4400]
        ),

        // ── 16. Risk Assessment ──────────────────────────────────────────────
        pb(),
        h1('16. Risk Assessment'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [2400, 1200, 1200, 1100, 3200],
          rows: [
            new TableRow({ tableHeader: true, children: ['Risk', 'Likelihood', 'Impact', 'Score', 'Mitigation'].map((h, ci) =>
              new TableCell({ borders, width: { size: [2400,1200,1200,1100,3200][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['FCA licensing delays', 'Medium', 'Very High', 'HIGH', 'Engage FCA sandbox Q2 2026 [14]; compliance consultant from Day 1'],
              ['Development overrun', 'High', 'High', 'HIGH', 'Agile 2-week sprints; feature-scoped MVP; monthly KPIs'],
              ['Low early user adoption', 'Medium', 'High', 'HIGH', 'Pre-launch waitlist; influencer beta; referral incentives'],
              ['Seed funding not secured', 'Medium', 'Very High', 'CRITICAL', 'Bootstrap lean; approach 5+ investors in parallel Q3 2026'],
              ['Incumbent product clone', 'High', 'Medium', 'MED', 'Differentiate on AI quality and UX; build community lock-in first'],
              ['Data breach / cyber attack', 'Low', 'Very High', 'HIGH', 'Annual pen testing; ISO 27001 roadmap; cyber insurance Day 1'],
              ['Key developer departure', 'Low', 'High', 'MED', 'Equity package; thorough documentation; knowledge sharing protocol'],
              ['UK economic downturn', 'Medium', 'Medium', 'MED', 'Counter-cyclical positioning: "save smarter during hard times"'],
            ].map((row, ri) => {
              const scoreColors = { 'CRITICAL': 'DC2626', 'HIGH': 'EA580C', 'MED': 'D97706', 'LOW': '059669' };
              const likeColor = row[1] === 'High' ? RED : row[1] === 'Medium' ? AMBER : GREEN;
              const impactColor = row[2] === 'Very High' || row[2] === 'High' ? RED : row[2] === 'Medium' ? AMBER : GREEN;
              return new TableRow({ children: [
                new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: row[0], font: 'Arial', size: 20, bold: true, color: DARK_TEXT })] })] }),
                new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row[1], font: 'Arial', size: 20, bold: true, color: likeColor })] })] }),
                new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row[2], font: 'Arial', size: 20, bold: true, color: impactColor })] })] }),
                new TableCell({ borders, width: { size: 1100, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: row[3], font: 'Arial', size: 20, bold: true, color: scoreColors[row[3]] || DARK_TEXT })] })] }),
                new TableCell({ borders, width: { size: 3200, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: row[4], font: 'Arial', size: 20, color: DARK_TEXT })] })] }),
              ]});
            })
          ]
        }),

        // ── 17. References ───────────────────────────────────────────────────
        pb(),
        h1('17. References & Sources'),
        body('All metrics, market data, competitor comparisons, and regulatory references cited in this business plan are sourced from the publications listed below. Sources were verified in April 2026.'),
        ...spacer(1),
        ...[
          ['[1]', 'FCA Financial Lives Survey 2022 (updated 2024)', 'https://www.fca.org.uk/financial-lives'],
          ['[2]', 'FCA Financial Lives Survey 2024 — Savings & Debt chapter', 'https://www.fca.org.uk/financial-lives'],
          ['[3]', 'Accenture UK Fintech Report 2024', 'https://www.accenture.com/uk-en/insights/financial-services/fintech'],
          ['[4]', 'Statista — UK Micro-Investing Market Growth 2024', 'https://www.statista.com/topics/3512/fintech-united-kingdom/'],
          ['[5]', 'KPMG Pulse of Fintech H2 2024 — UK Market', 'https://kpmg.com/uk/en/home/insights/2025/02/pulse-of-fintech.html'],
          ['[6]', 'Statista — Number of Fintech App Users UK 2025', 'https://www.statista.com/topics/3512/fintech-united-kingdom/'],
          ['[7]', 'ONS — Household Savings Ratio, UK 2024', 'https://www.ons.gov.uk/economy/grossdomesticproductgdp/timeseries/qdzu/ukea'],
          ['[8]', 'OECD/INFE 2023 International Survey of Adult Financial Literacy', 'https://www.oecd.org/financial/education/'],
          ['[9]', 'Deloitte Centre for Financial Services — UK Digital Banking Report 2024', 'https://www2.deloitte.com/uk/en/pages/financial-services/articles/digital-banking.html'],
          ['[10]', 'Plum — Pricing page (accessed April 2026)', 'https://withplum.com/pricing'],
          ['[11]', 'Chip — Pricing page (accessed April 2026)', 'https://getchip.uk/pricing'],
          ['[12]', 'Monzo — Pricing page (accessed April 2026)', 'https://monzo.com/pricing'],
          ['[13]', 'Nutmeg — Fees page (accessed April 2026)', 'https://www.nutmeg.com/fees'],
          ['[14]', 'FCA — Regulatory Sandbox overview', 'https://www.fca.org.uk/firms/innovation/regulatory-sandbox'],
          ['[15]', 'FCA — Appointed Representatives regime', 'https://www.fca.org.uk/firms/appointed-representatives'],
          ['[16]', 'FCA — Consumer Duty PS22/9', 'https://www.fca.org.uk/publications/policy-statements/ps22-9-new-consumer-duty'],
          ['[17]', 'TrueLayer — Open Banking API documentation', 'https://docs.truelayer.com'],
          ['[18]', 'Onfido — Identity Verification platform', 'https://onfido.com'],
          ['[19]', 'Stripe — PCI DSS Compliance overview', 'https://stripe.com/docs/security'],
          ['[20]', 'Innovate UK — Smart Grants programme', 'https://www.ukri.org/councils/innovate-uk/guidance-for-applicants/types-of-funding/smart/'],
          ['[21]', 'Similarweb / App Annie — UK Personal Finance App Rankings Q1 2025', 'https://www.data.ai/en/apps/google-play/top-grossing/finance/united-kingdom/'],
          ['[26]', 'Moin Siddiqui — LinkedIn Profile, peer recommendations, April 2026', 'https://www.linkedin.com/in/moinas/'],
          ['[27]', 'Wise / Money To The Masses — Plum Review 2026', 'https://moneytothemasses.com/banking/plum-review'],
          ['[28]', 'Plum — App Store listing (Apple), April 2026', 'https://apps.apple.com/cy/app/plum-smart-saving-investing/id1456139507'],
          ['[32]', 'MoneyZine — Chip Review UK 2026', 'https://moneyzine.com/uk/investments/chip-review/'],
          ['[33]', 'Chip — Smart Money People community reviews', 'https://smartmoneypeople.com/chip-reviews/product/app'],
          ['[36]', 'Finder UK — Chip App Review 2025', 'https://www.finder.com/uk/digital-banking/chip-app-review'],
          ['[40]', 'App store ratings — verified April 2026', 'https://www.data.ai/'],
        ].map(([ref, title, url]) =>
          new Paragraph({ spacing: { after: 80 }, children: [
            new TextRun({ text: ref + '  ', font: 'Arial', size: 20, bold: true, color: NAVY }),
            new TextRun({ text: title + '  ', font: 'Arial', size: 20, color: DARK_TEXT }),
            new TextRun({ text: url, font: 'Arial', size: 18, color: '0369A1' }),
          ]})
        ),
        ...spacer(2),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [9100],
          rows: [new TableRow({ children: [new TableCell({
            borders: { top: mintBorder, bottom: mintBorder, left: mintBorder, right: mintBorder },
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 9100, type: WidthType.DXA }, margins: { top: 280, bottom: 280, left: 360, right: 360 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '"Save a little. Invest a little. Watch it grow."', font: 'Arial', size: 28, bold: true, color: MINT, italics: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: 'HAY-M — Built for the everyday investor.', font: 'Arial', size: 22, color: WHITE })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [
                new TextRun({ text: 'Contact: Moin Siddiqui  |  hello@hay-m.co.uk  |  www.hay-m.co.uk  |  linkedin.com/in/moinas', font: 'Arial', size: 18, color: '94A3B8' }),
              ]}),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: 'Registered in England & Wales  |  Confidential \u2014 April 2026', font: 'Arial', size: 16, color: '64748B' })] }),
            ]
          })]})],
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('D:/mobileapp/docs/HAY-M_BusinessPlan_v2.docx', buf);
  console.log('Business Plan v2 done');
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
