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
const GREEN = '059669';
const RED = 'DC2626';
const AMBER = 'D97706';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const mintBorder = { style: BorderStyle.SINGLE, size: 6, color: MINT };

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
function bullet(text, bold = false, color = DARK_TEXT) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, color, font: 'Arial', bold })] });
}
function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } }));
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

function twoColTable(left, right) {
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: [4400, 4700],
    rows: [new TableRow({ children: [
      new TableCell({ borders: noBorders, width: { size: 4400, type: WidthType.DXA },
        margins: { top: 0, bottom: 0, left: 0, right: 200 }, children: left }),
      new TableCell({ borders: noBorders, width: { size: 4700, type: WidthType.DXA },
        margins: { top: 0, bottom: 0, left: 200, right: 0 }, children: right }),
    ]})]
  });
}

function statCard(label, value, sub, bg = NAVY) {
  return new TableCell({
    borders: { top: border, bottom: border, left: border, right: border },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 180, bottom: 180, left: 180, right: 180 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: value, font: 'Arial', size: 48, bold: true, color: MINT })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: label, font: 'Arial', size: 20, bold: true, color: WHITE })] }),
      ...(sub ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: sub, font: 'Arial', size: 16, color: 'A0AEC0' })] })] : []),
    ]
  });
}

function statsRow(stats) {
  const w = Math.floor(9100 / stats.length);
  const widths = stats.map((_, i) => i === stats.length - 1 ? 9100 - w * (stats.length - 1) : w);
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({ children: stats.map((s, i) => statCard(s.label, s.value, s.sub, s.bg || NAVY)) })]
  });
}

function swotTable() {
  const colWidths = [4550, 4550];
  const cell = (title, items, bg, titleColor) => new TableCell({
    borders, shading: { fill: bg, type: ShadingType.CLEAR },
    width: { size: 4550, type: WidthType.DXA }, margins: { top: 140, bottom: 140, left: 160, right: 160 },
    children: [
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: title, font: 'Arial', size: 22, bold: true, color: titleColor })] }),
      ...items.map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 60 },
        children: [new TextRun({ text: t, font: 'Arial', size: 20, color: DARK_TEXT })] }))
    ]
  });
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [
      new TableRow({ children: [
        cell('Strengths', [
          'Dual platform: web + mobile (iOS/Android)',
          'Real API backend with JWT auth + MongoDB',
          'Tiered plan model enables upsell',
          'GBP-native from day 1',
          'Push notifications + real-time Socket.IO',
          'Round-up micro-saving fully implemented',
        ], 'ECFDF5', GREEN),
        cell('Weaknesses', [
          'Backend on Render free tier (cold starts)',
          'No live market data integration yet',
          'No real payment processor (Stripe/Open Banking)',
          'No email service for password resets',
          'Single developer team at MVP stage',
        ], 'FEF2F2', RED),
      ]}),
      new TableRow({ children: [
        cell('Opportunities', [
          '33M+ UK adults underserved by traditional savings',
          'Open Banking API integration (PSD2)',
          'ISA allowance season marketing (April each year)',
          'Employer-sponsored savings partnerships',
          'Crypto/ETF demand among 18-35 demographic',
          'FCA sandbox licence pathway for regulated activities',
        ], 'FFFBEB', AMBER),
        cell('Threats', [
          'Monzo, Starling, Plum, Chip well-funded competitors',
          'FCA regulation requirements for investment features',
          'User trust/security concerns for fintech newcomers',
          'App Store / Play Store review delays',
          'Rising cloud infrastructure costs at scale',
        ], 'F0F4F8', '374151'),
      ]}),
    ]
  });
}

function revenueTable() {
  const colWidths = [2000, 2300, 2500, 2300];
  const rows = [
    ['Metric', 'Free', 'Plus', 'Pro'],
    ['Monthly Price', '£0', '£4.99', '£9.99'],
    ['Annual Price', '£0', '£49.99 (save 17%)', '£99.99 (save 17%)'],
    ['Goals', '1 max', 'Unlimited', 'Unlimited'],
    ['Portfolio Access', 'No', 'Yes', 'Yes'],
    ['AI Auto-save', 'No', 'No', 'Yes'],
    ['Advanced Insights', 'No', 'Yes', 'Yes'],
    ['ISA Account', 'No', 'Yes', 'Yes'],
    ['Priority Support', 'No', 'No', 'Yes'],
    ['Target Segment', 'Casual savers', 'Regular savers', 'Active investors'],
  ];
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: colWidths,
    rows: rows.map((row, ri) => new TableRow({
      tableHeader: ri === 0,
      children: row.map((cell, ci) => new TableCell({
        borders,
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: ri === 0 ? NAVY : ci === 0 ? LIGHT_BG : ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ alignment: ci > 0 ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({
          text: cell, font: 'Arial', size: ri === 0 ? 20 : 20, bold: ri === 0 || ci === 0,
          color: ri === 0 ? WHITE : ci === 2 ? '1D4ED8' : ci === 3 ? GREEN : DARK_TEXT,
        })] })]
      }))
    }))
  });
}

function projectionTable() {
  const colWidths = [2000, 1400, 1400, 1400, 1400, 1500];
  const rows = [
    ['Metric', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
    ['Total Users', '500', '2,500', '8,000', '20,000', '50,000'],
    ['Free Users (%)', '80% (400)', '70% (1,750)', '60% (4,800)', '55% (11,000)', '50% (25,000)'],
    ['Plus Users', '80', '600', '2,400', '6,500', '17,500'],
    ['Pro Users', '20', '150', '800', '2,500', '7,500'],
    ['MRR (Plus)', '£399', '£2,994', '£11,976', '£32,435', '£87,325'],
    ['MRR (Pro)', '£200', '£1,499', '£7,992', '£24,975', '£74,925'],
    ['Total MRR', '£599', '£4,493', '£19,968', '£57,410', '£162,250'],
    ['ARR', '£7,188', '£53,916', '£239,616', '£688,920', '£1,947,000'],
  ];
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: colWidths,
    rows: rows.map((row, ri) => new TableRow({
      tableHeader: ri === 0,
      children: row.map((cell, ci) => new TableCell({
        borders,
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: ri === 0 ? NAVY : ri === rows.length - 1 ? '064E3B' : ci === 0 ? LIGHT_BG : ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [new Paragraph({ alignment: ci > 0 ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({
          text: cell, font: 'Arial', size: 19,
          bold: ri === 0 || ci === 0 || ri === rows.length - 1,
          color: ri === 0 ? WHITE : ri === rows.length - 1 ? MINT : DARK_TEXT,
        })] })]
      }))
    }))
  });
}

const doc = new Document({
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
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
    // COVER
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 1440, left: 0 } } },
      children: [
        new Table({ width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders, shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA }, margins: { top: 1800, bottom: 1800, left: 1440, right: 1440 },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'HAY-M', font: 'Arial', size: 80, bold: true, color: MINT })] }),
              new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: 'Business Plan', font: 'Arial', size: 48, bold: true, color: WHITE })] }),
              new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'UK Micro-Savings & Investment Platform', font: 'Arial', size: 28, color: 'A0AEC0' })] }),
              new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: 'Web Application  +  iOS & Android Mobile App', font: 'Arial', size: 24, color: '64748B' })] }),
            ]
          })]})],
        }),
        ...spacer(2),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400, after: 160 }, children: [new TextRun({ text: 'April 2026  |  Confidential', font: 'Arial', size: 26, color: MID_GREY })] }),
        ...spacer(1),
        statsRow([
          { label: 'Platform', value: '2', sub: 'Web + Mobile' },
          { label: 'Markets', value: '1', sub: 'United Kingdom' },
          { label: 'Currency', value: 'GBP', sub: '£ Sterling' },
          { label: 'Plans', value: '3', sub: 'Free / Plus / Pro' },
        ]),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },
    // MAIN
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
        children: [new TextRun({ text: 'HAY-M — Business Plan  |  Confidential  |  April 2026', font: 'Arial', size: 18, color: MID_GREY })]
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

        // ── 1. Executive Summary
        h1('1. Executive Summary'),
        body('HAY-M is a UK-based micro-savings and investment platform that makes building wealth accessible to everyone — not just the financially privileged. By enabling users to save in small increments (round-ups, manual deposits), invest from £1 in diversified assets, and track their financial goals in real time, HAY-M empowers a generation of everyday savers and first-time investors.'),
        ...spacer(1),
        body('The platform is available as a React web application and a React Native mobile app (iOS & Android), backed by a Node.js/Express API and MongoDB database. A three-tier subscription model (Free, Plus, Pro) drives recurring revenue while keeping core features accessible to the broadest audience.'),
        ...spacer(1),
        body('Key facts at a glance:', { bold: true }),
        bullet('Product: Micro-savings + investment platform (SaaS, B2C fintech)'),
        bullet('Market: United Kingdom — 33M+ adults with less than £1,000 in savings'),
        bullet('Revenue model: Freemium SaaS subscriptions (monthly and annual)'),
        bullet('Technology: React Native (mobile) + React/Vite (web) + Node.js + MongoDB'),
        bullet('Currency: GBP (£), en-GB locale throughout'),
        bullet('Current stage: MVP fully built, pre-launch'),
        ...spacer(1),

        // ── 2. Problem & Solution
        pb(),
        h1('2. Problem & Solution'),
        h2('2.1 The Problem'),
        body('The UK savings gap is widening. Key pain points for target users:'),
        bullet('33 million UK adults have less than £1,000 in savings (FCA Financial Lives Survey)'),
        bullet('Traditional banks offer near-zero interest on easy-access accounts'),
        bullet('Investment platforms feel complex, expensive, or require minimum deposits of £100+'),
        bullet('No single app combines micro-saving, goal tracking, investment, and a digital wallet'),
        bullet('Round-up saving and auto-save features are limited to a few well-funded neobanks (Monzo, Starling) but not independent investment apps'),
        ...spacer(1),
        h2('2.2 The Solution — HAY-M'),
        body('HAY-M solves this by combining three core capabilities in one product:'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [3033, 3033, 3034],
          rows: [new TableRow({ children: [
            ...[
              ['💰 Save', 'Round-up transactions, manual deposits, goal-based saving with auto-save schedules', '064E3B'],
              ['📈 Invest', 'Portfolio of stocks, ETFs, crypto, bonds from £1. ISA account support for tax-efficient growth', '1E3A5F'],
              ['💳 Wallet', 'Digital wallet with multiple debit cards and linked bank accounts. Send money peer-to-peer', NAVY],
            ].map(([icon, desc, bg]) => new TableCell({
              borders,
              shading: { fill: bg, type: ShadingType.CLEAR },
              width: { size: 3033, type: WidthType.DXA },
              margins: { top: 200, bottom: 200, left: 160, right: 160 },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: icon, font: 'Arial', size: 36 })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: icon.split(' ')[1], font: 'Arial', size: 24, bold: true, color: MINT })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: desc, font: 'Arial', size: 18, color: 'A0AEC0' })] }),
              ]
            }))
          ]})]
        }),

        // ── 3. Market Opportunity
        pb(),
        h1('3. Market Opportunity'),
        h2('3.1 Target Market'),
        body('Primary target: UK adults aged 18–40 who are:'),
        bullet('First-time investors looking for a low-barrier entry point'),
        bullet('Millennials and Gen Z who are comfortable with mobile-first finance apps'),
        bullet('Salaried workers with irregular savings habits'),
        bullet('Students and early-career professionals starting to build wealth'),
        ...spacer(1),
        h2('3.2 Market Size'),
        ...spacer(1),
        statsRow([
          { label: 'UK Adults with < £1k savings', value: '33M+', sub: 'Primary addressable market', bg: NAVY },
          { label: 'UK Fintech Market Size (2025)', value: '£11B', sub: 'Growing at 15% CAGR', bg: '1C3D6E' },
          { label: 'UK ISA account holders', value: '12M', sub: 'Tax-efficient investment users', bg: '1E3A5F' },
          { label: 'Mobile Banking Users UK', value: '54M', sub: 'Platform adoption tailwind', bg: '312E81' },
        ]),
        ...spacer(1),
        h2('3.3 Competitive Landscape'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [2200, 1700, 1700, 1700, 1800],
          rows: [
            new TableRow({ tableHeader: true, children: ['Competitor', 'Micro-saving', 'Investment', 'Wallet', 'Price/mo'].map((h, ci) =>
              new TableCell({ borders, width: { size: [2200,1700,1700,1700,1800][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...([
              ['HAY-M', 'Yes', 'Yes', 'Yes', 'Free–£9.99'],
              ['Monzo', 'Pots only', 'No', 'Yes (bank)', '£5 Plus'],
              ['Chip', 'Yes (AI)', 'Yes (limited)', 'No', '£3.99'],
              ['Plum', 'Yes', 'Yes', 'No', '£2.99'],
              ['Freetrade', 'No', 'Yes', 'No', '£4.99+'],
              ['Revolut', 'Vaults', 'Yes (crypto)', 'Yes', '£2.99+'],
            ]).map((row, ri) => new TableRow({ children: row.map((cell, ci) =>
              new TableCell({ borders, width: { size: [2200,1700,1700,1700,1800][ci], type: WidthType.DXA },
                shading: { fill: ri === 0 ? '064E3B' : ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ alignment: ci > 0 ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({
                  text: cell, size: 20, font: 'Arial', bold: ri === 0,
                  color: ri === 0 ? MINT : cell === 'Yes' ? GREEN : cell === 'No' ? RED : DARK_TEXT,
                })] })]
              })
            )}))
          ]
        }),
        ...spacer(1),
        body('Key differentiator: HAY-M is the only platform combining micro-saving with round-ups, full investment portfolio management, and a multi-card digital wallet — all in one GBP-native product available on both web and mobile.'),

        // ── 4. Product
        pb(),
        h1('4. Product Overview'),
        h2('4.1 Web Application'),
        body('The HAY-M web app is a React SPA (Single Page Application) built with Vite. It offers the full product experience through a browser, targeting desktop and tablet users. Key pages:'),
        bullet('Dashboard — balance overview, recent transactions, goal progress summary'),
        bullet('Goals — create up to 1 (Free) or unlimited (Plus/Pro) savings goals with auto-save'),
        bullet('Wallet — manage debit cards and linked bank accounts, top-up, freeze, send money'),
        bullet('Portfolio — investment holdings, allocation chart, performance metrics (Plus/Pro)'),
        bullet('Savings Tracker — micro-savings history, round-up log, AI limits (Pro)'),
        bullet('Notifications — full notification history with 8 preference toggles'),
        bullet('Settings — edit profile, change password, notification preferences, plan management'),
        bullet('ISA Account — tax-efficient savings (Plus/Pro)'),
        ...spacer(1),
        h2('4.2 Mobile Application (iOS & Android)'),
        body('Built with React Native + Expo SDK 55, distributed via Apple App Store and Google Play. Key screens:'),
        bullet('Onboarding — 4-slide animated carousel for first-time users'),
        bullet('Dashboard — real-time balance, goals overview, quick actions'),
        bullet('Payments — send money, contact list, transaction history with search and filters'),
        bullet('Wallet — card carousel, bank accounts, top-up modal, freeze toggle'),
        bullet('SavingGoals — goal cards with progress bars, add/edit/delete'),
        bullet('Portfolio — holdings list, chart, performance (Plus/Pro)'),
        bullet('Profile — stats, plan badge, change password'),
        bullet('Notifications — real-time notifications with push (if permission granted)'),
        ...spacer(1),
        h2('4.3 Key Features Delivered (MVP)'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [200, 3600, 700, 700, 900, 900, 1100],
          rows: [
            new TableRow({ tableHeader: true, children: ['#', 'Feature', 'Web', 'Mobile', 'Free', 'Plus', 'Pro'].map((h, ci) =>
              new TableCell({ borders, width: { size: [200,3600,700,700,900,900,1100][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 18, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['1', 'User Authentication (signup, login, forgot/reset password)', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['2', 'Onboarding wizard / carousel', 'Yes (5-step)', 'Yes (4-slide)', 'Yes', 'Yes', 'Yes'],
              ['3', 'Dashboard with balance & insights', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['4', 'Savings Goals (CRUD + add funds)', 'Yes', 'Yes', '1 goal', 'Unlimited', 'Unlimited'],
              ['5', 'Digital Wallet (cards + bank accounts)', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['6', 'Send Money (P2P transfers)', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['7', 'Transaction History + Filters', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['8', 'Investment Portfolio', 'Yes', 'Yes', 'No', 'Yes', 'Yes'],
              ['9', 'Savings Tracker + Round-ups', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['10', 'AI Auto-save Limits', 'Yes', 'Yes', 'No', 'No', 'Yes'],
              ['11', 'ISA Account', 'Yes', 'Yes', 'No', 'Yes', 'Yes'],
              ['12', 'Push Notifications (8 types)', 'No', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['13', 'In-app Notifications + Preferences', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['14', 'Settings / Profile Management', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
              ['15', 'Plan Upgrade Flow', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes'],
            ].map((row, ri) => new TableRow({ children: row.map((cell, ci) =>
              new TableCell({ borders, width: { size: [200,3600,700,700,900,900,1100][ci], type: WidthType.DXA },
                shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
                margins: { top: 60, bottom: 60, left: 100, right: 100 },
                children: [new Paragraph({ alignment: ci > 1 ? AlignmentType.CENTER : ci === 0 ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({
                  text: cell, size: 18, font: 'Arial',
                  color: cell === 'Yes' || cell === 'Unlimited' ? GREEN : cell === 'No' ? RED : DARK_TEXT,
                })] })]
              })
            )}))
          ]
        }),

        // ── 5. Revenue Model
        pb(),
        h1('5. Revenue Model'),
        h2('5.1 Subscription Tiers'),
        body('HAY-M operates a freemium SaaS model with three tiers:'),
        ...spacer(1),
        revenueTable(),
        ...spacer(1),
        h2('5.2 Additional Revenue Streams (Future)'),
        bullet('Referral programme — £10 credit per referred paying user'),
        bullet('Partner financial products — ISA provider commission, insurance referrals'),
        bullet('Premium data insights — anonymised aggregate spending/savings reports for FCA/research'),
        bullet('Employer wellness programme — B2B bulk licencing for corporate savings benefits'),
        bullet('Cashback partnerships — merchant cashback via spending categories'),
        ...spacer(1),
        h2('5.3 Revenue Projections (5-Year)'),
        body('Conservative projections based on 40% annual user growth and 20% free-to-paid conversion rate:'),
        ...spacer(1),
        projectionTable(),
        ...spacer(1),
        body('Break-even projected at Month 18–24 assuming lean team of 3–5 and cloud infrastructure costs under £2,000/month.'),

        // ── 6. Go-to-Market Strategy
        pb(),
        h1('6. Go-to-Market Strategy'),
        h2('6.1 Launch Phases'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [1400, 2300, 5400],
          rows: [
            new TableRow({ tableHeader: true, children: ['Phase', 'Timeline', 'Activities'].map((h, ci) =>
              new TableCell({ borders, width: { size: [1400,2300,5400][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['Phase 1\nMVP', 'Q2 2026\n(Now)', 'App Store & Play Store submission. Website launch. Social media presence (Twitter/X, Instagram, TikTok). Waitlist sign-up. Beta tester recruitment (500 users)'],
              ['Phase 2\nBeta', 'Q3 2026', 'Closed beta with 500 users. Iterate on feedback. FCA sandbox application. Press coverage in UK fintech media. Referral programme launch'],
              ['Phase 3\nGrowth', 'Q4 2026', 'Public launch. App Store featured placement push. Influencer partnerships (personal finance TikTok/YouTube). ISA season campaign (Jan-April). Google Ads + Meta ads'],
              ['Phase 4\nScale', '2027+', 'Open Banking API integration (Plaid/TrueLayer). Real payment processing (Stripe). Employer wellness partnerships. Series A fundraising preparation'],
            ].map(([phase, time, acts], ri) => new TableRow({ children: [
              new TableCell({ borders, width: { size: 1400, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? '064E3B' : '065F46', type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: phase, font: 'Arial', size: 20, bold: true, color: MINT })] })] }),
              new TableCell({ borders, width: { size: 2300, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: time, font: 'Arial', size: 20, bold: true, color: NAVY })] })] }),
              new TableCell({ borders, width: { size: 5400, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: acts, font: 'Arial', size: 20, color: DARK_TEXT })] })] }),
            ]}))
          ]
        }),
        ...spacer(1),
        h2('6.2 Customer Acquisition Channels'),
        bullet('App Store Optimisation (ASO) — keyword targeting: "UK savings app", "micro savings", "round up savings"'),
        bullet('Content marketing — personal finance blog, ISA guides, savings tips (SEO)'),
        bullet('Social media — TikTok/Instagram short-form finance content (#UKMoney, #SavingsTips)'),
        bullet('Referral programme — users earn in-app rewards for referring friends'),
        bullet('Fintech community — Product Hunt launch, Indie Hackers, Reddit r/UKPersonalFinance'),
        bullet('PR — fintech media (AltFi, FinTech Futures, This Is Money)'),

        // ── 7. SWOT
        pb(),
        h1('7. SWOT Analysis'),
        ...spacer(1),
        swotTable(),

        // ── 8. Technology & Operations
        pb(),
        h1('8. Technology & Operations'),
        h2('8.1 Current Infrastructure'),
        bullet('Backend: Render.com free tier (Node.js) — £0/month (cold starts acceptable at MVP stage)'),
        bullet('Database: MongoDB Atlas free tier (512MB) — £0/month'),
        bullet('Website hosting: Vercel/Netlify free tier — £0/month'),
        bullet('Mobile: Expo Go for testing; Expo EAS Build for production (£0 for limited builds)'),
        bullet('Total current infrastructure cost: £0/month'),
        ...spacer(1),
        h2('8.2 Scaling Infrastructure Plan'),
        bullet('Month 6 (500 users): Upgrade Render to Starter plan (£7/mo), Atlas M2 (£9/mo)'),
        bullet('Month 12 (2,500 users): Render Standard (£21/mo), Atlas M10 (£57/mo), Redis for Socket.IO scaling'),
        bullet('Month 24 (8,000 users): Dedicated VPS or AWS EC2, Atlas M20, CDN for assets'),
        bullet('Year 3+ (20,000+ users): Kubernetes cluster, multi-region MongoDB, dedicated DevOps hire'),
        ...spacer(1),
        h2('8.3 Regulatory Roadmap'),
        bullet('FCA Sandbox — apply for sandbox licence to test regulated investment features'),
        bullet('FCA Authorisation — required before offering investment products to retail clients'),
        bullet('PSD2 / Open Banking — TrueLayer or Plaid integration for bank account read access'),
        bullet('GDPR Compliance — DPA registration, privacy policy, data retention policies'),
        bullet('AML/KYC — identity verification (Onfido or Jumio) required before payment processing'),

        // ── 9. Team & Roles
        pb(),
        h1('9. Team & Hiring Plan'),
        h2('9.1 Current Team'),
        body('HAY-M was built by a founding developer with full-stack expertise across React Native, React, Node.js, and MongoDB. The MVP is feature-complete across both platforms.'),
        ...spacer(1),
        h2('9.2 Hiring Roadmap'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [2400, 1800, 4900],
          rows: [
            new TableRow({ tableHeader: true, children: ['Role', 'Timeline', 'Responsibilities'].map((h, ci) =>
              new TableCell({ borders, width: { size: [2400,1800,4900][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['Co-founder / CTO', 'Now', 'Technical architecture, backend, mobile, DevOps'],
              ['Growth Marketing Manager', 'Month 3', 'ASO, content, social media, referral programme'],
              ['UI/UX Designer', 'Month 6', 'Design system, mobile/web polish, user research'],
              ['Backend Developer', 'Month 9', 'API scaling, Open Banking integration, payment processing'],
              ['Compliance Officer', 'Month 12', 'FCA authorisation, GDPR, AML/KYC, legal'],
              ['Customer Success', 'Month 12', 'User onboarding, support, churn reduction'],
            ].map(([role, time, resp], ri) => new TableRow({ children: [
              new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: role, font: 'Arial', size: 20, bold: true, color: NAVY })] })] }),
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: time, font: 'Arial', size: 20, color: MID_GREY })] })] }),
              new TableCell({ borders, width: { size: 4900, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: resp, font: 'Arial', size: 20, color: DARK_TEXT })] })] }),
            ]}))
          ]
        }),

        // ── 10. Financial Summary
        pb(),
        h1('10. Financial Summary & Funding Ask'),
        h2('10.1 Cost Structure'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [3500, 1800, 1900, 1900],
          rows: [
            new TableRow({ tableHeader: true, children: ['Cost Item', 'Year 1', 'Year 2', 'Year 3'].map((h, ci) =>
              new TableCell({ borders, width: { size: [3500,1800,1900,1900][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['Infrastructure (cloud, hosting)', '£500', '£3,000', '£15,000'],
              ['Salaries & Contractors', '£0', '£60,000', '£180,000'],
              ['Marketing & Advertising', '£2,000', '£15,000', '£50,000'],
              ['Legal & Compliance (FCA)', '£3,000', '£20,000', '£30,000'],
              ['App Store Fees (15%)', '£1,078', '£8,087', '£35,942'],
              ['Miscellaneous / Ops', '£500', '£3,000', '£10,000'],
              ['Total Costs', '£7,078', '£109,087', '£320,942'],
            ].map(([item, y1, y2, y3], ri) => new TableRow({ children: [
              new TableCell({ borders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: ri === 6 ? NAVY : ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: item, font: 'Arial', size: 20, bold: ri === 6, color: ri === 6 ? WHITE : NAVY })] })] }),
              ...[y1, y2, y3].map(v => new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: ri === 6 ? NAVY : ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: v, font: 'Arial', size: 20, bold: ri === 6, color: ri === 6 ? MINT : DARK_TEXT })] })] })),
            ]}))
          ]
        }),
        ...spacer(1),
        h2('10.2 Funding Ask'),
        body('HAY-M is seeking seed funding of £150,000 to:'),
        bullet('£60,000 — First full-time hire (Growth Marketing Manager + part-time designer)'),
        bullet('£30,000 — FCA authorisation and legal/compliance costs'),
        bullet('£30,000 — Marketing budget (Year 1 user acquisition, App Store promotion)'),
        bullet('£20,000 — Infrastructure upgrade + Open Banking API integration'),
        bullet('£10,000 — Operational reserve (6-month runway buffer)'),
        ...spacer(1),
        body('With £150k seed, projected MRR at end of Year 2 is £4,493/month (£53,916 ARR) with 2,500 users and 30% paid conversion. Break-even achieved in Month 20.'),
        ...spacer(1),

        // ── 11. Milestones
        pb(),
        h1('11. Key Milestones & Roadmap'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [2000, 7100],
          rows: [
            new TableRow({ tableHeader: true, children: ['Milestone', 'Description'].map((h, ci) =>
              new TableCell({ borders, width: { size: ci === 0 ? 2000 : 7100, type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['Achieved', 'MVP fully built: web + mobile app with auth, goals, wallet, portfolio, payments, notifications, onboarding, settings, forgot password, parity fixes'],
              ['Q2 2026', 'App Store + Play Store submission and approval'],
              ['Q2 2026', 'Website public launch + ProductHunt launch day'],
              ['Q2 2026', 'First 100 beta users onboarded'],
              ['Q3 2026', 'FCA sandbox application submitted'],
              ['Q3 2026', 'Referral programme live; 500 users'],
              ['Q3 2026', 'Stripe payment integration for subscription billing'],
              ['Q4 2026', 'Open Banking integration (TrueLayer / Plaid)'],
              ['Q4 2026', 'Real email service for password resets (SendGrid/Mailgun)'],
              ['Q4 2026', '2,000 users; first £4,000 MRR'],
              ['Q1 2027', 'FCA authorisation received'],
              ['Q2 2027', 'ISA season campaign (April) — biggest marketing push'],
              ['Q4 2027', '10,000 users; £20,000 MRR'],
              ['2028', 'Series A preparation; £162k ARR run rate'],
            ].map(([ms, desc], ri) => new TableRow({ children: [
              new TableCell({ borders, width: { size: 2000, type: WidthType.DXA },
                shading: { fill: ri === 0 ? '064E3B' : ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: ms, font: 'Arial', size: 20, bold: true, color: ri === 0 ? MINT : NAVY })] })] }),
              new TableCell({ borders, width: { size: 7100, type: WidthType.DXA },
                shading: { fill: ri === 0 ? '065F46' : ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: desc, font: 'Arial', size: 20, color: ri === 0 ? 'D1FAE5' : DARK_TEXT })] })] }),
            ]}))
          ]
        }),

        // ── 12. Risk
        pb(),
        h1('12. Risk Register'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [2400, 1200, 1200, 4300],
          rows: [
            new TableRow({ tableHeader: true, children: ['Risk', 'Likelihood', 'Impact', 'Mitigation'].map((h, ci) =>
              new TableCell({ borders, width: { size: [2400,1200,1200,4300][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['FCA regulation delays', 'High', 'High', 'Operate in FCA sandbox first; legal counsel engaged early'],
              ['Low user retention', 'Medium', 'High', 'Gamification, streak rewards, push notifications, personalised insights'],
              ['Competitor fast-follow', 'Medium', 'Medium', 'First-mover advantage; tight product iteration cycle'],
              ['Backend cold-start latency', 'High', 'Low', 'Upgrade Render at 500 users; graceful fallback already implemented'],
              ['App Store rejection', 'Low', 'High', 'App Store guidelines audit before submission; TestFlight beta first'],
              ['Data breach / security', 'Low', 'Very High', 'JWT + bcrypt + rate limiting; penetration test before launch'],
              ['Funding not secured', 'Medium', 'Medium', 'MVP proves product; bootstrap on free infrastructure initially'],
            ].map(([risk, like, impact, mit], ri) => {
              const likeColor = like === 'High' ? RED : like === 'Medium' ? AMBER : GREEN;
              const impactColor = impact === 'High' || impact === 'Very High' ? RED : impact === 'Medium' ? AMBER : GREEN;
              return new TableRow({ children: [
                new TableCell({ borders, width: { size: 2400, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: risk, font: 'Arial', size: 20, bold: true, color: DARK_TEXT })] })] }),
                new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: like, font: 'Arial', size: 20, bold: true, color: likeColor })] })] }),
                new TableCell({ borders, width: { size: 1200, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: impact, font: 'Arial', size: 20, bold: true, color: impactColor })] })] }),
                new TableCell({ borders, width: { size: 4300, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: mit, font: 'Arial', size: 20, color: DARK_TEXT })] })] }),
              ]});
            })
          ]
        }),

        // ── 13. Conclusion
        pb(),
        h1('13. Conclusion'),
        body('HAY-M arrives at exactly the right moment. The UK savings crisis, growing distrust of traditional banks, the explosion of mobile-first finance, and the surge of interest in retail investing among younger generations all create a perfect market opportunity.'),
        ...spacer(1),
        body('With a fully built MVP across web and mobile, a lean cost structure, and a clear path to FCA regulation and revenue, HAY-M is positioned to become the go-to savings and investment companion for the 33 million UK adults who deserve better tools to build wealth.'),
        ...spacer(1),
        body('We are not just building an app — we are building a habit: the habit of saving a little, investing a little, and watching it all grow.'),
        ...spacer(2),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [9100],
          rows: [new TableRow({ children: [new TableCell({
            borders: { top: mintBorder, bottom: mintBorder, left: mintBorder, right: mintBorder },
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 9100, type: WidthType.DXA },
            margins: { top: 300, bottom: 300, left: 400, right: 400 },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '"Save a little. Invest a little. Watch it grow."', font: 'Arial', size: 28, bold: true, color: MINT, italics: true })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160 }, children: [new TextRun({ text: 'HAY-M — Built for the everyday investor.', font: 'Arial', size: 22, color: WHITE })] }),
            ]
          })]})],
        }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('D:/mobileapp/docs/HAY-M_BusinessPlan.docx', buf);
  console.log('Business Plan done');
}).catch(e => console.error('Business Plan error:', e.message));
