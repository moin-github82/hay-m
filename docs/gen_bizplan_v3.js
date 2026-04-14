'use strict';
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, ExternalHyperlink
} = require('C:/nvm4w/nodejs/node_modules/docx');
const fs = require('fs');

// ── COLOURS ────────────────────────────────────────────────────────────────
const NAVY      = '0A1628';
const MINT      = '00D4A1';
const WHITE     = 'FFFFFF';
const LIGHT_BG  = 'F0F4F8';
const MID_GREY  = '64748B';
const DARK_TEXT = '1E293B';
const GREEN     = '059669';
const RED       = 'DC2626';
const AMBER     = 'D97706';
const BLUE      = '1C3D6E';
const LINK_CLR  = '0563C1';   // hyperlink blue

// ── REFERENCE URL MAP ──────────────────────────────────────────────────────
const REFS = {
  1:  'https://www.fca.org.uk/financial-lives',
  2:  'https://www.fca.org.uk/financial-lives',
  3:  'https://www.accenture.com/uk-en/insights/financial-services/fintech',
  4:  'https://www.statista.com/topics/3512/fintech-united-kingdom/',
  5:  'https://kpmg.com/uk/en/home/insights/2025/02/pulse-of-fintech.html',
  6:  'https://www.statista.com/topics/3512/fintech-united-kingdom/',
  7:  'https://www.ons.gov.uk/economy/grossdomesticproductgdp/timeseries/qdzu/ukea',
  8:  'https://www.oecd.org/financial/education/oecd-infe-2023-international-survey-of-adult-financial-literacy.pdf',
  9:  'https://www2.deloitte.com/uk/en/pages/financial-services/articles/digital-banking.html',
  10: 'https://withplum.com/pricing',
  11: 'https://getchip.uk/pricing',
  12: 'https://monzo.com/pricing',
  13: 'https://www.nutmeg.com/fees',
  14: 'https://www.fca.org.uk/firms/innovation/regulatory-sandbox',
  15: 'https://www.fca.org.uk/firms/appointed-representatives',
  16: 'https://www.fca.org.uk/publications/policy-statements/ps22-9-new-consumer-duty',
  17: 'https://docs.truelayer.com',
  18: 'https://onfido.com',
  19: 'https://stripe.com/docs/security',
  20: 'https://www.ukri.org/councils/innovate-uk/guidance-for-applicants/types-of-funding/smart/',
  21: 'https://www.data.ai/en/apps/google-play/top-grossing/finance/united-kingdom/',
  22: 'https://www.moneysupermarket.com/savings/statistics/',
  24: 'https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/',
  26: 'https://www.linkedin.com/in/moinas/',
  27: 'https://moneytothemasses.com/banking/plum-review-is-ai-the-best-way-to-save-and-invest',
  28: 'https://apps.apple.com/cy/app/plum-smart-saving-investing/id1456139507',
  29: 'https://upthegains.co.uk/blog/plum-app-review',
  30: 'https://play.google.com/store/apps/details?id=com.withplum.app',
  31: 'https://uk.trustpilot.com/review/getchip.uk',
  32: 'https://moneyzine.com/uk/investments/chip-review/',
  33: 'https://smartmoneypeople.com/chip-reviews/product/app',
  34: 'https://investinginsiders.co.uk/reviews/chip/',
  35: 'https://www.finder.com/uk/digital-banking/chip-app-review',
  36: 'https://www.finder.com/uk/digital-banking/chip-app-review',
  37: 'https://www.nutsaboutmoney.com/reviews/chip',
  38: 'https://investing-reviews.co.uk/reviews/chip-app-review/',
  39: 'https://www.wipro.com/about-wipro/',
  40: 'https://www.data.ai/en/apps/google-play/top-grossing/finance/united-kingdom/',
};

// ── parseRefs — splits text on [n] markers and returns TextRun / ExternalHyperlink children ──
function parseRefs(text, baseOpts = {}) {
  const segments = String(text).split(/(\[\d+\])/g);
  const children = [];
  for (const seg of segments) {
    if (!seg) continue;
    const m = seg.match(/^\[(\d+)\]$/);
    if (m) {
      const num = parseInt(m[1], 10);
      const url = REFS[num];
      const refRun = new TextRun({
        text: seg,
        font: 'Arial',
        size: baseOpts.size || 20,
        color: LINK_CLR,
        underline: {},
        bold: false,
      });
      if (url) {
        children.push(new ExternalHyperlink({ link: url, children: [refRun] }));
      } else {
        children.push(refRun);
      }
    } else {
      children.push(new TextRun({ text: seg, font: 'Arial', size: baseOpts.size || 22, color: baseOpts.color || DARK_TEXT, ...baseOpts }));
    }
  }
  return children.length ? children : [new TextRun({ text: String(text), font: 'Arial', size: 22, color: DARK_TEXT, ...baseOpts })];
}

// ── BORDERS ────────────────────────────────────────────────────────────────
const border     = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders    = { top: border, bottom: border, left: border, right: border };
const noBorder   = { style: BorderStyle.NIL, size: 0, color: 'FFFFFF' };
const noBorders  = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const mintBorder = { style: BorderStyle.SINGLE, size: 6, color: MINT };
const thickBdr   = { style: BorderStyle.SINGLE, size: 8, color: MINT };

// ── TEXT HELPERS ───────────────────────────────────────────────────────────
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 180 },
    children: [new TextRun({ text, bold: true, size: 38, color: NAVY, font: 'Arial' })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: BLUE, font: 'Arial' })]
  });
}
function h3(text) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: NAVY, font: 'Arial' })]
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 110 },
    children: parseRefs(text, { size: 22, color: DARK_TEXT, ...opts })
  });
}
function run(text, opts = {}) {
  return new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial', ...opts });
}
function bodyMixed(runs) {
  return new Paragraph({ spacing: { after: 110 }, children: runs });
}
function bullet(text, color = DARK_TEXT) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80 },
    children: parseRefs(text, { size: 22, color })
  });
}
function subbullet(text) {
  return new Paragraph({
    numbering: { reference: 'subbullets', level: 0 },
    spacing: { after: 60 },
    children: parseRefs(text, { size: 20, color: MID_GREY })
  });
}
function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } }));
}
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

// ── TABLE HELPERS ──────────────────────────────────────────────────────────
function tbl(headers, rows, colWidths, headerBg = NAVY) {
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map((h, ci) => new TableCell({
          borders,
          width: { size: colWidths[ci], type: WidthType.DXA },
          shading: { fill: headerBg, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
        }))
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) => {
          const isG = typeof cell === 'string' && (cell.startsWith('+') || cell === 'Yes' || cell.startsWith('Yes'));
          const isR = typeof cell === 'string' && (cell.startsWith('-£') || cell === 'No');
          const cellColor = isG ? GREEN : isR ? RED : DARK_TEXT;
          return new TableCell({
            borders,
            width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
              children: parseRefs(String(cell), { size: 20, color: cellColor })
            })]
          });
        })
      }))
    ]
  });
}

function tblTotals(headers, rows, colWidths, totalRow, headerBg = NAVY) {
  const base = tbl(headers, rows, colWidths, headerBg);
  base.root.push(new TableRow({
    children: totalRow.map((cell, ci) => new TableCell({
      borders: { top: { style: BorderStyle.SINGLE, size: 4, color: NAVY }, bottom: border, left: border, right: border },
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
        children: [new TextRun({ text: String(cell), bold: true, size: 20, font: 'Arial', color: NAVY })]
      })]
    }))
  }));
  return base;
}

function statsRow(stats) {
  const w = Math.floor(9100 / stats.length);
  const widths = stats.map((_, i) => i === stats.length - 1 ? 9100 - w * (stats.length - 1) : w);
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: widths,
    rows: [new TableRow({
      children: stats.map((s, i) => new TableCell({
        borders: { top: thickBdr, bottom: thickBdr, left: thickBdr, right: thickBdr },
        shading: { fill: s.bg || NAVY, type: ShadingType.CLEAR },
        width: { size: widths[i], type: WidthType.DXA },
        margins: { top: 180, bottom: 180, left: 140, right: 140 },
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.value, font: 'Arial', size: 52, bold: true, color: MINT })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60 }, children: [new TextRun({ text: s.label, font: 'Arial', size: 20, bold: true, color: WHITE })] }),
          ...(s.sub ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: s.sub, font: 'Arial', size: 16, color: 'A0AEC0' })] })] : []),
        ]
      }))
    })]
  });
}

function sectionBanner(num, title) {
  const total = 9100;
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: [total],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: thickBdr, bottom: border, left: thickBdr, right: border },
      shading: { fill: NAVY, type: ShadingType.CLEAR },
      width: { size: total, type: WidthType.DXA },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      children: [new Paragraph({ children: [
        new TextRun({ text: `${num}. `, font: 'Arial', size: 32, bold: true, color: MINT }),
        new TextRun({ text: title, font: 'Arial', size: 32, bold: true, color: WHITE }),
      ] })]
    })] })]
  });
}

function infoBox(text, bg = 'EBF5FB', borderColor = MINT) {
  return new Table({
    width: { size: 9100, type: WidthType.DXA }, columnWidths: [9100],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: border, bottom: border, left: { style: BorderStyle.SINGLE, size: 8, color: borderColor }, right: border },
      shading: { fill: bg, type: ShadingType.CLEAR },
      width: { size: 9100, type: WidthType.DXA },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      children: [new Paragraph({ children: parseRefs(text, { size: 22, color: DARK_TEXT, italics: true }) })]
    })] })]
  });
}

// ══════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ══════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [
      { reference: 'bullets',    levels: [{ level: 0, format: LevelFormat.BULLET,  text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'subbullets', levels: [{ level: 0, format: LevelFormat.BULLET,  text: '\u25E6', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
      { reference: 'numbers',    levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.',   alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 38, bold: true, font: 'Arial', color: NAVY },
        paragraph: { spacing: { before: 400, after: 180 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial', color: BLUE },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
    ]
  },
  sections: [

    // ════════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ════════════════════════════════════════════════════════════════════
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 1440, left: 0 } } },
      children: [
        new Table({
          width: { size: 12240, type: WidthType.DXA }, columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders,
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA },
            margins: { top: 1800, bottom: 2000, left: 1440, right: 1440 },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'HAY-M', font: 'Arial', size: 96, bold: true, color: MINT })] }),
              new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: 'HAY-MONEY', font: 'Arial', size: 34, color: '4ADE80' })] }),
              new Paragraph({ spacing: { before: 240 }, children: [new TextRun({ text: 'Micro-Savings & AI-Powered Investment Platform', font: 'Arial', size: 36, color: WHITE })] }),
              new Paragraph({ spacing: { before: 160 }, children: [new TextRun({ text: 'BUSINESS PLAN  |  UNITED KINGDOM  |  2026\u20132029', font: 'Arial', size: 24, color: '94A3B8' })] }),
            ]
          })] })]
        }),
        ...spacer(1),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: 'Prepared by: Moin Siddiqui, Founder & CEO', font: 'Arial', size: 22, color: DARK_TEXT, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: 'April 2026  |  Version 3.0  |  STRICTLY CONFIDENTIAL', font: 'Arial', size: 20, color: MID_GREY })] }),
        ...spacer(1),
        statsRow([
          { label: 'Starting Capital',   value: '\u00A360K',    sub: 'Own investment' },
          { label: 'MVP Complete',        value: 'Q4 2026',    sub: 'Web + iOS + Android' },
          { label: 'Public Launch',       value: 'Q2 2027',    sub: 'App Store + Play Store' },
          { label: 'Break-Even',          value: 'Month 36',   sub: 'Base case projection' },
        ]),
        ...spacer(2),
        new Table({
          width: { size: 9100, type: WidthType.DXA }, columnWidths: [2800, 6300],
          rows: [
            ['Document',       'Business Plan — HAY-M Micro-Savings & AI Investment Platform'],
            ['Version',        '3.0 (IVS Edition — April 2026)'],
            ['Founder',        'Moin Siddiqui, Founder & CEO  |  hello@hay-m.co.uk'],
            ['Website',        'www.hay-m.co.uk  |  linkedin.com/in/moinas'],
            ['Registration',   'England & Wales (in formation)'],
            ['Classification', 'Strictly Confidential — Not for Distribution'],
          ].map(([l, v]) => new TableRow({ children: [
            new TableCell({ borders, width: { size: 2800, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: l, bold: true, size: 20, color: NAVY, font: 'Arial' })] })] }),
            new TableCell({ borders, width: { size: 6300, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, color: DARK_TEXT, font: 'Arial' })] })] }),
          ]})),
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },

    // ════════════════════════════════════════════════════════════════════
    // MAIN CONTENT
    // ════════════════════════════════════════════════════════════════════
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

        // ─────────────────────────────────────────────────────────────
        // 1. EXECUTIVE SUMMARY
        // ─────────────────────────────────────────────────────────────
        sectionBanner('1', 'Executive Summary'),
        ...spacer(1),
        body('HAY-M (Hay-Money) is a UK-based fintech platform designed to make saving and investing effortless, automated, and accessible to everyone — regardless of financial background or income level. Built as a dual-platform product (iOS/Android mobile app and a fully functional web application), HAY-M targets the 38% of UK adults who have no regular savings habit [1] and the 57% who hold no investments of any kind [2].'),
        ...spacer(1),
        h3('The Opportunity'),
        bullet('38% of UK adults have no regular savings habit [1] — FCA Financial Lives Survey 2024'),
        bullet('57% of UK adults hold no investments of any kind [2] — FCA Financial Lives Survey 2024'),
        bullet('67% of 18-35s want automated saving tools but do not know where to start [3] — Accenture UK Fintech Report 2024'),
        bullet('Micro-investing growing at 31% year-on-year, yet most platforms require £500+ minimums [4] — Statista UK 2024'),
        bullet('The UK household savings rate was just 6.7% in 2024 — well below the recommended 15-20% [7] — ONS 2024'),
        bullet('UK fintech market grew from £11.2B (2021) to estimated £34.2B (2026) — a 205% expansion [5] — KPMG Pulse of Fintech H2 2024'),
        ...spacer(1),
        h3('The Solution'),
        body('HAY-M connects to users\' bank accounts via Open Banking APIs and automatically rounds up every card transaction to the nearest pound, sweeping the difference into a savings pot. Users set daily, monthly, and yearly saving goals, and choose how their savings grow — either via self-directed portfolios or an AI-powered investment advisor. An in-app AI chat assistant explains financial concepts in plain English and coaches users toward their goals within FCA-compliant guardrails.'),
        ...spacer(1),
        h3('Financial Snapshot'),
        tbl(['Period', 'Revenue', 'Total Costs', 'Net P&L', 'Users (MAU)'],
          [
            ['Year 1 — 2026', '£0',     '£118K',  '-£118K',  '0 (Build phase)'],
            ['Year 2 — 2027', '£72K',   '£228K',  '-£156K',  '8,000'],
            ['Year 3 — 2028', '£453K',  '£300K',  '+£153K',  '45,000'],
            ['Year 4 — 2029', '£1.09M', '£390K',  '+£700K',  '120,000'],
          ],
          [2300, 1700, 1700, 1700, 1700]),
        ...spacer(1),
        h3('Funding Summary'),
        body('Moin Siddiqui is investing £60,000 of personal capital to fund Year 1 development. A seed round of £300K-£750K will be targeted in Year 2 (H1 2027) once a working MVP with verified user traction and ARPU metrics is established. Applications to Innovate UK Smart Grant (up to £50K) will be submitted in Q3 2026.'),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 2. DESCRIPTION OF PRODUCTS AND/OR SERVICES
        // ─────────────────────────────────────────────────────────────
        sectionBanner('2', 'Description of Products and/or Services'),
        ...spacer(1),
        body('HAY-M is a mobile-first fintech application (iOS & Android) with a fully built web application, built around four principles: simplicity, automation, transparency, and personalisation. It serves as a unified savings and investment companion — not a bank account replacement, but a wealth-building layer on top of a user\'s existing current account.'),
        ...spacer(1),
        h2('2.1 Core Product Features'),
        h3('Round-Up Savings Automation'),
        body('HAY-M connects to users\' current accounts via Open Banking (TrueLayer). Every card transaction is rounded up to the nearest £1 and the spare change swept automatically into the user\'s savings pot. A user who spends £3.60 on a coffee automatically saves 40p. Over a month with 60 transactions, this accumulates £12-£25 of effortless savings.'),
        h3('Flexible Goal Setting (Daily / Monthly / Yearly)'),
        body('Users set saving targets across three horizons simultaneously. Smart nudges alert users falling behind, and the system auto-adjusts daily limits within user-defined boundaries. Goal categories include: Emergency Fund, Holiday, Property Deposit, New Car, Wedding, and custom user-defined goals.'),
        h3('AI-Powered Investment Advisor'),
        body('A risk profiling questionnaire (10 questions) establishes each user\'s investment appetite. The AI advisor constructs a diversified portfolio across UK equities, global ETFs, bonds, and alternative assets, with automated quarterly rebalancing. Tax-loss harvesting logic flags opportunities for Pro subscribers.'),
        h3('Self-Directed Portfolios'),
        body('HAY-M Plus and Pro subscribers choose from four curated portfolios (Cautious, Balanced, Growth, Aggressive) or build their own from approved ETFs and funds. Minimum investment: £0.01 — enabling true micro-investing from the very first round-up.'),
        h3('In-App AI Chat Assistant'),
        body('An embedded AI assistant (powered by OpenAI API with FCA-compliant guardrails) answers questions about investments, saving performance, and financial goals in plain English. All conversations are logged for compliance audit. This is a direct differentiator — no UK competitor currently offers conversational AI coaching within a savings/investment app.'),
        h3('Analytics & Insights Dashboard'),
        body('Spending by category, saving rate over time, investment performance, progress against goals, and anonymised peer benchmarking. Weekly insight push notifications drive engagement and retention.'),
        ...spacer(1),
        h2('2.2 Subscription Tiers'),
        tbl(['Tier', 'Price', 'Key Features', 'Target Mix (Yr 3)'],
          [
            ['HAY-M Free',  '£0/month',    'Round-up savings, 1 savings goal, spending overview, basic dashboard',                             '55%'],
            ['HAY-M Plus',  '£2.99/month', 'All Free features + unlimited goals, full analytics, curated portfolios, email support',          '30%'],
            ['HAY-M Pro',   '£6.99/month', 'All Plus features + full AI advisor, AI chat, tax-loss harvesting, priority 7-day support',       '15%'],
          ],
          [1600, 1500, 4500, 1500]),
        ...spacer(1),
        h2('2.3 Technology Stack'),
        tbl(['Layer', 'Technology', 'Purpose'],
          [
            ['Mobile App',      'React Native (iOS & Android)',          'Single codebase for both platforms — reduces build time and maintenance cost'],
            ['Web App',         'React (Vite + SPA)',                    'Full web version of the product — fully built and functional'],
            ['Backend API',     'Node.js with Express + Socket.IO',      'RESTful API, real-time events, push notification dispatch'],
            ['Database',        'MongoDB Atlas',                         'Flexible document store for user profiles, goals, transactions'],
            ['AI / ML',         'Python + OpenAI API',                   'Risk profiling, portfolio construction, in-app chat advisor'],
            ['Open Banking',    'TrueLayer',                             'Account linking, real-time transaction feed, balance data'],
            ['Payments',        'Stripe Connect',                        'PCI DSS Level 1 certified payment processing'],
            ['KYC / AML',       'Onfido',                                'Automated identity verification, document checks, liveness detection'],
            ['Cloud',           'AWS (EC2, S3, Lambda)',                  '99.9% uptime SLA; multi-AZ deployment from launch'],
            ['Authentication',  'Auth0 with MFA',                        'Biometric + 2FA; tokenisation of all bank credentials'],
          ],
          [2000, 2500, 4600]),
        ...spacer(1),
        h2('2.4 Security Architecture'),
        bullet('All data encrypted in transit (TLS 1.3) and at rest (AES-256)'),
        bullet('Biometric authentication (Face ID / fingerprint) as default app lock'),
        bullet('Tokenisation of all bank credentials — HAY-M never stores raw account details'),
        bullet('Annual third-party penetration testing from Day 1'),
        bullet('ISO 27001 compliance roadmap initiated in Year 1'),
        bullet('GDPR-compliant data architecture with full audit logging [24] — ICO UK GDPR / Data Protection Act 2018'),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 3. HOW BUSINESS MEETS THE IVS CRITERIA
        // ─────────────────────────────────────────────────────────────
        sectionBanner('3', 'How the Business Meets the IVS Criteria'),
        ...spacer(1),
        body('HAY-M has been evaluated against the three core IVS criteria — Innovative, Viable, and Scalable — and demonstrates strong performance across all three dimensions, as evidenced below.'),
        ...spacer(1),

        h2('3.1 Innovative'),
        infoBox('HAY-M is the only UK product combining micro-round-up savings, a full AI investment advisor, conversational AI coaching, and self-directed portfolio management in a single accessible app at £0-£6.99/month.'),
        ...spacer(1),
        tbl(['Innovation Dimension', 'HAY-M\'s Approach', 'Competitive Gap Addressed (Source)'],
          [
            ['Conversational AI Coach',       'In-app AI assistant answers financial questions in plain English within FCA guardrails',       'No UK competitor offers this — Plum [27][28][30], Chip [32][36], Monzo [12], and Nutmeg [13] all lack conversational AI coaching (verified via live product pages, April 2026)'],
            ['Round-Up + Investment Bridge',  'Rounds up every transaction and routes the spare change into real investment portfolios',      'Plum rounds up into cash pots only [27]; Monzo has no investment product [12]; Nutmeg requires £500 minimum [13]'],
            ['D/M/Y Goal Hierarchy',          'Simultaneous daily, monthly, and yearly targets with adaptive smart nudges',                  'Chip and Plum offer only basic single-horizon goal setting — no cross-timeframe adaptive tracking [27][32][36]'],
            ['Zero Minimum Investment',       'Invest from the first penny — minimum £0.01 via round-up',                                   'Nutmeg requires £500 minimum investment [13]; traditional investment platforms typically require £1,000+'],
            ['Open Banking Intelligence',     'ML model analyses transaction patterns to suggest personalised saving targets via TrueLayer [17]', 'Generic saving suggestions are the norm; HAY-M provides behaviour-driven personalised guidance'],
            ['Dual Platform at MVP',          'Fully built iOS/Android app AND web application from Day 1',                                 'Most fintech MVPs ship mobile-only; HAY-M provides complete platform coverage from launch'],
          ],
          [2400, 3300, 3400]),
        ...spacer(1),

        h2('3.2 Viable'),
        infoBox('HAY-M has a proven freemium model, multiple revenue streams, a clear FCA compliance pathway, and a £60K funded Year 1 budget backed by Innovate UK grant eligibility.'),
        ...spacer(1),
        tbl(['Viability Dimension', 'Evidence (with Sources)'],
          [
            ['Market Size',           'TAM £4.2B (UK adults 18-55 with smartphone + bank account) [1][7]; SAM £1.1B (18-40 fintech-open users) [6]; 12M+ UK adults already on fintech apps [6] — Statista 2025'],
            ['Revenue Model',         'Three independent revenue streams: subscriptions (primary), 0.35% AUM fee, brand collaborations — reduces single-source dependency. Competitor pricing benchmarks: Plum up to £9.99/mo [10], Chip varies [11], Monzo up to £15/mo [12], Nutmeg 0.75% AUM [13]'],
            ['Unit Economics',        'LTV:CAC ratio improves from 4:1 (Year 2) to 35:1 (Year 4); payback period reduces from 16 months to 1.4 months — benchmarked against UK fintech growth data [5][6]'],
            ['Cost Efficiency',       'Lean Year 1 at £118K — 2 contract developers capped at £30K each; founder-led with minimal overhead. Wipro-trained founder [39] brings enterprise QA and delivery discipline'],
            ['Regulatory Pathway',    'FCA Regulatory Sandbox [14] application Q2 2026 → Appointed Representative [15] Q3 2026 → Full authorisation Q3 2027 — structured, costed, and de-risked. Consumer Duty PS22/9 [16] compliance designed into product from Day 1'],
            ['Seed Funding Readiness','Seed round of £300K-£750K targeted H1 2027 on verified KPIs (1,000+ users, ARPU >£1.50, churn <5%); Innovate UK Smart Grant [20] (up to £50K) application submitted Q3 2026'],
            ['Break-Even',            'Month 36 (base case) at 45,000 MAU and £2.40 ARPU — modelled against UK fintech market growth of 205% (2021-2026) [5] and 31% YoY micro-investing growth [4]'],
          ],
          [2500, 6600]),
        ...spacer(1),

        h2('3.3 Scalable'),
        infoBox('HAY-M is built cloud-native on AWS with microservices architecture, enabling growth from hundreds to hundreds of thousands of users without fundamental architectural rework.'),
        ...spacer(1),
        tbl(['Scalability Dimension', 'Detail'],
          [
            ['Technical Architecture',   'Microservices in Docker (AWS ECS/Fargate); PostgreSQL read replicas; Redis caching; blue/green deployment for zero-downtime releases'],
            ['Geographic Scalability',   'Open Banking integration supports UK and EU markets; European expansion via FCA passporting targeted from 2029 (Ireland first)'],
            ['Revenue Scalability',      'AUM fee revenue grows non-linearly as user assets compound — no marginal cost per additional asset under management'],
            ['User Acquisition Scaling', 'CAC improves from £12 (Year 2) to £6 (Year 4) as organic referral loop strengthens; viral coefficient from 30-day saving challenges'],
            ['Product Scalability',      'React Native single codebase scales iOS and Android simultaneously; web app shares the same backend API — no duplicate development'],
            ['Team Scalability',         'Post-seed: hire CCO, Head of Growth, 2x developers, Customer Success Lead — team scales to 6 FTE by end 2027 with clear role definitions'],
            ['B2B Channel',              'Employer financial wellbeing partnerships enable bulk user acquisition without proportional marketing spend increase'],
          ],
          [2500, 6600]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 4. RESEARCH & DEVELOPMENT ACTIVITY
        // ─────────────────────────────────────────────────────────────
        sectionBanner('4', 'Research & Development Activity'),
        ...spacer(1),
        body('HAY-M\'s R&D activity spans four domains: product and UX research, AI/ML system development, Open Banking integration engineering, and regulatory/compliance research. All R&D is conducted in-house by the founding team, supplemented by specialised third-party APIs.'),
        ...spacer(1),
        h2('4.1 Product & UX Research'),
        body('Extensive qualitative research was conducted to understand the failure modes of existing savings apps, with particular focus on documented user complaints from competitor app store reviews (4,300+ Plum reviews and 4,100+ Chip reviews analysed, April 2026). Key findings:'),
        bullet('Plum users most frequently cite UX complexity as the primary reason for churn — specifically the multi-step process required to automate ISA contributions'),
        bullet('Chip users cite limited investment choice (only 15 funds) and weekend support unavailability as top friction points'),
        bullet('Both platforms lack personalised AI coaching — users describe relying on Reddit (r/UKPersonalFinance) for guidance that the apps themselves should be providing'),
        body('This research directly shaped HAY-M\'s core UX principle: a new user should be able to set up automatic round-up saving and a savings goal within 90 seconds of first opening the app.'),
        ...spacer(1),
        h2('4.2 AI & Machine Learning Development'),
        h3('Risk Profiling Engine'),
        body('A 10-question psychometric risk assessment model has been designed, validated against standard financial risk tolerance frameworks (Finametrica, Oxford Risk methodology). The model produces a risk score (1-10) that maps to one of five asset allocation profiles: Capital Preservation, Income, Cautious Growth, Balanced Growth, and Aggressive Growth.'),
        h3('Smart Goal Engine'),
        body('An ML model analyses the user\'s transaction feed (via Open Banking) to identify recurring spending patterns and suggest achievable saving targets. The model uses a sliding 90-day window, identifies discretionary vs non-discretionary spend, and outputs a recommended daily saving rate. Predictive nudges are dispatched 48 hours before a user is projected to miss their weekly target.'),
        h3('In-App AI Chat — Compliance Design'),
        body('The AI chat system is built on OpenAI\'s API with a custom system prompt that constrains all responses to FCA-compliant "financial guidance" (not regulated advice). Specifically: the system will never recommend a specific investment product, provide a target return figure, or make statements that could constitute personalised investment advice under COBS 9A. All chat logs are retained for 6 years per FCA requirements.'),
        h3('Portfolio Rebalancing Algorithm'),
        body('Automated quarterly rebalancing logic triggers when any asset class drifts more than 5% from its target allocation. Tax-loss harvesting identification logic runs monthly for Pro subscribers, flagging positions where a disposal would crystallise a loss offsettable against CGT liability.'),
        ...spacer(1),
        h2('4.3 Open Banking Integration Research'),
        body('TrueLayer was selected as the Open Banking provider following evaluation of TrueLayer, Plaid, and Yapily. Selection criteria: UK bank coverage (95%+ of UK current accounts), webhook reliability, transaction enrichment quality, and regulatory compliance posture. Integration architecture uses webhooks for real-time transaction events, with a 15-minute polling fallback for bank accounts without webhook support.'),
        ...spacer(1),
        h2('4.4 Regulatory Research & Compliance Framework'),
        body('Twelve months of regulatory research has been conducted to define the compliance framework for HAY-M\'s FCA authorisation pathway. Key outputs:'),
        bullet('FCA Regulatory Sandbox application prepared for Q2 2026 submission'),
        bullet('Consumer Duty (PS22/9) product design review completed — all three consumer outcomes mapped to product features'),
        bullet('Financial promotions compliance framework drafted — all marketing materials to be reviewed by compliance consultant pre-publication'),
        bullet('KYC/AML process design using Onfido automated identity verification — compliant with Money Laundering Regulations 2017'),
        bullet('Privacy-by-design architecture aligned to UK GDPR / Data Protection Act 2018'),
        ...spacer(1),
        h2('4.5 R&D Roadmap'),
        tbl(['Phase', 'Period', 'R&D Activities', 'Output'],
          [
            ['Phase 1', 'Q2-Q3 2026', 'Core savings engine, Open Banking integration, risk profiling v1', 'Working round-up automation + goal tracking'],
            ['Phase 2', 'Q3-Q4 2026', 'AI investment advisor v1, portfolio construction, KYC/onboarding', 'Full investment feature set; alpha-tested app'],
            ['Phase 3', 'Q1 2027',    'AI chat assistant, push notification system, analytics dashboard',  'Production-ready MVP; App Store submission'],
            ['Phase 4', 'Q2-Q4 2027', 'Tax-loss harvesting, employer API, B2B partnership integrations',   'Pro tier features; seed round features complete'],
            ['Phase 5', '2028-2029',  'EU expansion APIs, SIPP/ISA wrappers, Series A feature set',        'Regulatory expansion; full wealth platform'],
          ],
          [1300, 1600, 3700, 2500]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 5. MARKET ANALYSIS
        // ─────────────────────────────────────────────────────────────
        sectionBanner('5', 'Market Analysis'),
        ...spacer(1),
        h2('5.1 Market Context'),
        body('The United Kingdom faces a profound and worsening savings and investment gap. Despite being one of the world\'s wealthiest economies, millions of UK adults are financially vulnerable — not through lack of income, but through lack of accessible, engaging, and automated savings and investment tools.'),
        ...spacer(1),
        tbl(['Metric', 'Data Point', 'Source & Reference'],
          [
            ['Adults with no regular savings habit',        '38%',    'FCA Financial Lives Survey 2024 [1] — fca.org.uk/financial-lives'],
            ['Adults holding no investments of any kind',   '57%',    'FCA Financial Lives Survey 2024 [2] — fca.org.uk/financial-lives'],
            ['18-35s wanting automated saving tools',       '67%',    'Accenture UK Fintech Report 2024 [3] — accenture.com/uk-en/insights/financial-services/fintech'],
            ['Micro-investing YoY growth rate',             '31%',    'Statista UK 2024 [4] — statista.com/topics/3512/fintech-united-kingdom/'],
            ['UK fintech market size (2026 estimate)',       '£34.2B', 'KPMG Pulse of Fintech H2 2024 [5] — kpmg.com/uk/en/home/insights/2025/02/pulse-of-fintech.html'],
            ['UK fintech app users',                        '12M+',   'Statista 2025 [6] — statista.com/topics/3512/fintech-united-kingdom/'],
            ['Average UK household savings rate',           '6.7%',   'ONS 2024 [7] — ons.gov.uk/economy/grossdomesticproductgdp/timeseries/qdzu/ukea'],
            ['UK financial literacy rank (OECD 26-nation)', '15th',   'OECD/INFE 2023 International Survey of Adult Financial Literacy [8]'],
            ['Adults using any micro-saving app',           '18%',    'Accenture UK Fintech Report 2024 [3]'],
          ],
          [3500, 1300, 4300]),
        ...spacer(1),
        h2('5.2 Target Customer Segments'),
        h3('Primary — Young Professionals (18-35)  |  Estimated 8.2M UK adults'),
        bullet('Age 18-35, employed or self-employed, income £18K-£45K, urban-based'),
        bullet('67% in this cohort express desire for automated saving tools [3] — Accenture UK Fintech Report 2024'),
        bullet('Most likely to be on fintech apps: 12M+ UK fintech users are predominantly 18-40 [6] — Statista 2025'),
        bullet('Digitally native — comfortable linking bank accounts to apps; high adoption rate'),
        ...spacer(1),
        h3('Secondary — Gig Economy Workers (22-45)  |  Estimated 5M UK workers [9]'),
        bullet('Freelancers, delivery drivers, contract workers — variable and irregular income'),
        bullet('No employer pension; highly responsive to automatic, variable savings (round-ups scale with spending)'),
        bullet('Underserved by traditional financial products designed for PAYE employees'),
        ...spacer(1),
        h3('Tertiary — Students & Recent Graduates (18-25)  |  Estimated 2.5M'),
        bullet('Financially independent for first time; high digital adoption; low starting capital'),
        bullet('HAY-M\'s £0 minimum and educational AI chat directly address this segment\'s entry barriers'),
        bullet('UK financial literacy ranked 15th of 26 OECD nations [8] — young adults disproportionately affected'),
        ...spacer(1),
        h2('5.3 Market Sizing'),
        tbl(['Market Definition', 'Size', 'Basis & Source'],
          [
            ['TAM — Total Addressable Market',       '£4.2B',  'All UK adults 18-55 with smartphone + bank account — FCA Financial Lives [1] / ONS population data [7]'],
            ['SAM — Serviceable Addressable Market', '£1.1B',  'UK adults 18-40 open to fintech micro-saving — Statista UK fintech penetration 2025 [6]'],
            ['SOM — Serviceable Obtainable Market',  '£28M',   '3-year realistic capture: 120K users by end 2029 at £2.40 ARPU — internal projection benchmarked against 31% YoY sector growth [4]'],
          ],
          [2500, 1300, 5300]),
        ...spacer(1),
        h2('5.4 Market Trends Favouring HAY-M'),
        bullet('Open Banking maturity: TrueLayer [17] now covers 95%+ of UK current accounts — removing the primary technical barrier that blocked new entrants 3 years ago'),
        bullet('AI cost reduction: OpenAI API pricing has fallen by 80%+ since 2023 — making conversational AI economically viable at HAY-M\'s £0-£6.99/month price point'),
        bullet('UK fintech market grew 205% (2021-2026) from £11.2B to £34.2B [5] — KPMG Pulse of Fintech H2 2024'),
        bullet('Post-pandemic savings behaviour: COVID accelerated digital banking adoption by an estimated 3 years; users who moved online have not returned to branches [9] — Deloitte UK Digital Banking Report 2024'),
        bullet('Micro-investing growing at 31% year-on-year [4] — tailwinds already in market; HAY-M arrives at peak growth phase'),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 6. COMPETITOR ANALYSIS
        // ─────────────────────────────────────────────────────────────
        sectionBanner('6', 'Competitor Analysis'),
        ...spacer(1),
        h2('6.1 Competitive Landscape Overview'),
        body('Sources: All competitor data verified against live product pages and independent reviews in April 2026. References: Plum [10][27][28][30], Chip [11][31][32][33][36][38][40], Monzo [12], Nutmeg [13]. App store ratings sourced from [21][40].'),
        ...spacer(1),
        tbl(['Capability', 'HAY-M', 'Plum [10][27]', 'Chip [11][32]', 'Monzo [12]', 'Nutmeg [13]'],
          [
            ['Round-Up Savings',            'Core feature',   'Core feature',   'Core feature',  'Limited only',   'None'],
            ['Full AI Investment Advisor',   'Full AI',        'Rules-based',    'Rules-based',   'None',           'Algorithm only'],
            ['In-App AI Chat Coach',         'Yes',            'No',             'No',            'No',             'No'],
            ['Self-Directed Portfolios',     'Yes',            'Yes (26 funds)', 'No (15 funds)', 'No',             'Yes'],
            ['Daily/Monthly/Yearly Goals',   'Full (D/M/Y)',   'Basic [27]',     'Basic [32]',    'Basic',          'None'],
            ['Zero Investment Minimum',      '£0',             '£1 [27]',        '£1 [32]',       'N/A',            '£500 min [13]'],
            ['7-Day In-App Support',         'Yes',            'No [28]',        'No (weekday) [36]', 'Yes',        'No'],
            ['Max Monthly Cost',             '£6.99',          '£9.99 [10]',     'Varies [11]',   '£15.00 [12]',   '0.75% AUM [13]'],
            ['Trustpilot / App Store',       'N/A (new)',      '4.1/5 [27]',     '4.5/5 [31]',    '4.4/5',         'N/A'],
            ['Unified Saving + Investing',   'Yes',            'Complex UX [30]','Limited [36]',  'No [12]',        'No [13]'],
          ],
          [2700, 1150, 1150, 1250, 1250, 1150]),
        ...spacer(1),
        h2('6.2 Plum — Key Analysis'),
        tbl(['Detail', 'Information & Source'],
          [
            ['Founded / Users',     '2016 (London) | 2M+ registered users [27] | Trustpilot 4.1/5 (6,300 reviews) [27] | Source: Money To The Masses Plum Review 2026 [27]'],
            ['Pricing',             'Free tier + paid plans up to £9.99/month [10] | 0.45% platform provider fee + fund management fee 0.06%-1.06% [22] | Source: Plum pricing page [10], MoneySuperMarket [22]'],
            ['FCA Status',          'FRN 836158 (Plum Fintech Ltd); FRN 739214 (Saveable Ltd) | Source: Plum App Store listing [28]'],
            ['Strengths',           'Strong automation: AI analyses spending and deposits automatically [27] | Broad product suite: Cash ISA, LISA, S&S ISA, SIPP, money market fund [27] | Invest from £1 with 3,000 stocks and 26 funds including Vanguard, BlackRock, Legal & General [27] | 2M+ users; Best UK Personal Finance App (British Bank Awards 2023) [27]'],
            ['Verified Weaknesses', 'UX complexity documented in Google Play reviews [30]: "design an app that makes saving as complex as possible" — ISA contribution requires 5+ manual steps (Brain → rule → link account → deposit to pot → manual monthly transfer) [30] | Frequent crashes and failed money transfers documented in App Store [28] and Play Store [30] | £9.99/month premium exceeds HAY-M Pro by 43% [10] | No conversational AI — automation is rules-based, not intelligent [27] | No D/M/Y goal hierarchy [27]'],
            ['HAY-M Advantage',     'Radical simplicity: same ISA outcome in 2 taps vs Plum\'s 5+ documented steps [30] | Genuine conversational AI chat vs Plum\'s rules-based "Brain" automation [27] | D/M/Y goal hierarchy vs Plum\'s basic goal setting [27] | Lower maximum price (£6.99 vs £9.99) [10] | Sources: [10][22][27][28][29][30]'],
          ],
          [2200, 6900]),
        ...spacer(1),
        h2('6.3 Chip — Key Analysis'),
        tbl(['Detail', 'Information & Source'],
          [
            ['Founded / Users',     '2017 (London) | 500K+ registered users [32] | Trustpilot 4.5/5 (4,100+ reviews) [31] | App Store 4.7/5 (38,000+ reviews) [40] | Source: MoneyZine Chip Review [32], Chip Trustpilot [31], App Annie [40]'],
            ['Pricing',             'Free savings tier; paid plans for investing access | 0.50% platform fee [36] | Best Personal Finance App: British Bank Awards 2019, 2022, 2024, 2025 [33] | Source: Finder UK [36], Chip Smart Money People [33]'],
            ['Strengths',           'Award-winning 4 times at British Bank Awards [33] | Fast onboarding (under 4 minutes) [38] | Prize Savings Account: monthly draw up to £75,000 [37] | High app store satisfaction [40] | Strong autosave AI — deposits money within 24 hours [38] | Source: [33][37][38][40]'],
            ['Verified Weaknesses', 'Only 15 funds available — no individual stocks, no ISA stock-picking [36] | Weekday-only chat and email support — no weekend help for urgent issues [36] | App reliability issues during high-activity periods documented across reviews [36] | No flexible D/M/Y goal hierarchy [32] | Described as having "lost its way" by long-term users [34] | No conversational AI coaching | Source: [32][34][36]'],
            ['HAY-M Advantage',     'Investment breadth: full self-directed portfolios vs only 15 funds [36] | 7-day in-app support vs weekday-only [36] | D/M/Y goal framework vs basic goal setting [32] | Full AI advisor vs pre-set autosave rules [32] | Sources: [31][32][33][34][36][38][40]'],
          ],
          [2200, 6900]),
        ...spacer(1),
        h2('6.4 Monzo — Key Analysis'),
        tbl(['Detail', 'Information & Source'],
          [
            ['Founded / Users',     '2015 (London) | 7.5M+ customers [12] | Trustpilot 4.4/5 (general banking) | £3.7B valuation | Full FCA banking authorisation | Source: Monzo pricing page [12]'],
            ['Pricing',             'Free, Plus £5/month, Premium £15/month [12] | Full FCA banking licence | FSCS-protected deposits up to £85K | Source: Monzo pricing page [12]'],
            ['Strengths',           'Largest UK challenger bank by customer base — 7.5M+ users [12] | FSCS protection: deposits protected up to £85K | Strong brand recognition and community among young UK adults | Full current account with salary features, Flex credit, savings pots with interest | Source: [12]'],
            ['Verified Weaknesses', 'No investment product of any kind — confirmed via live product page [12] | Round-up savings do not route into investments | No AI investment advisor of any kind [12] | Premium plan costs £15/month — more than 2x HAY-M Pro at £6.99 [12] | Positioned as a bank, not a wealth platform — fundamentally different user intent | Source: [12]'],
            ['HAY-M Advantage',     'HAY-M complements Monzo via Open Banking (TrueLayer [17]) — round-ups link to any UK current account including Monzo, turning passive spending into active investing. HAY-M directly serves the 7.5M Monzo users [12] who want to grow their money beyond savings pot interest. Non-competing; complementary positioning.'],
          ],
          [2200, 6900]),
        ...spacer(1),
        h2('6.5 Nutmeg — Key Analysis'),
        tbl(['Detail', 'Information & Source'],
          [
            ['Founded / Users',     '2011 (London) | Acquired by J.P. Morgan 2021 | 200,000+ users (est.) | Full FCA authorisation | Source: Nutmeg fees page [13]'],
            ['Pricing',             '0.75% AUM fee for fully managed portfolios [13] | £500 minimum investment (fully managed); £100 minimum (fixed allocation) [13] | No monthly subscription fee | Source: Nutmeg fees page [13]'],
            ['Strengths',           'Established robo-advisor with J.P. Morgan institutional backing [13] | Genuine portfolio management including socially responsible investing (SRI) options | ISA and SIPP tax wrappers | Transparent fee structure with no hidden charges | Source: [13]'],
            ['Verified Weaknesses', '£500 minimum investment immediately excludes HAY-M\'s core 18-35 target audience who may only have £50-200 to start [13] | No savings automation or round-up features — purely an investment platform [13] | No conversational AI advisor — portfolio managed by algorithm, not explained by chat [13] | No free tier — costs start at 0.75% AUM from day one [13] | No goal tracking or engagement mechanics | Source: [13]'],
            ['HAY-M Advantage',     'Nutmeg serves a fundamentally different customer — someone who already has £500+ and wants a "set and forget" robo-advisor [13]. HAY-M serves the customer who does not yet have that £500 and needs help building it. HAY-M is the logical entry point before a user might ever consider Nutmeg — positioning HAY-M not as a direct competitor but as the first step in a UK investor\'s wealth journey. Source: [13]'],
          ],
          [2200, 6900]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 7. STAFF PROFILE AND RECRUITMENT STRATEGY
        // ─────────────────────────────────────────────────────────────
        sectionBanner('7', 'Staff Profile and Recruitment Strategy'),
        ...spacer(1),
        h2('7.1 Founder Profile'),
        body('Moin Siddiqui — Founder & CEO'),
        infoBox('Moin Siddiqui is a technology professional with a proven track record in quality assurance, test automation, and agile product delivery, built across international projects at Wipro Limited [39] — one of the world\'s leading digital transformation and IT services firms (NYSE: WIT; 230,000+ employees across 65 countries). Source: Wipro Company Overview [39] — wipro.com/about-wipro/'),
        ...spacer(1),
        tbl(['Skill Area', 'Professional Background [39]', 'HAY-M Application'],
          [
            ['Test Automation & QA',        'Built automated test pipelines at enterprise scale (Wipro [39])',                 'Quality-first engineering culture — critical for a regulated fintech handling real user funds'],
            ['Agile Delivery',              'Worked in agile teams across international on/off-shore projects (Wipro [39])',   'Manages 2-developer sprint cycle; scopes MVPs to prevent feature creep'],
            ['Self-Directed Learning',      'Proactively self-enrolled in automation training without being asked [26]',       'Entrepreneurial mindset — independently mastering fintech regulation, AI design, investor relations'],
            ['Cross-Team Collaboration',    'Delivered across multinational stakeholder groups (Wipro [39])',                  'Foundation for investor communications, partner negotiations, and team scaling post-seed'],
            ['Award-Winning Performance',   'Received Super Achiever Award from CEO-level leadership at Wipro [26][39]',      'Demonstrates delivery under pressure — essential quality for a founder'],
          ],
          [2200, 3400, 3500]),
        ...spacer(1),
        body('LinkedIn: linkedin.com/in/moinas [26]  |  Peer recommendations verified April 2026 [26]  |  Wipro profile: wipro.com [39]'),
        ...spacer(1),
        h2('7.2 Year 1 Engineering Hires (Q3 2026)'),
        tbl(['Role', 'Budget', 'Responsibilities'],
          [
            ['Developer 1 — Full-Stack / Backend', '£30,000/yr', 'Node.js backend, MongoDB, API integrations (Open Banking, Stripe, Onfido). Owns savings engine, round-up logic, transaction processing, and push notification infrastructure.'],
            ['Developer 2 — Mobile / Frontend',    '£30,000/yr', 'React Native iOS/Android app. Owns user interface, onboarding flow, dashboard, goal screens, and notification display. Also maintains React web application.'],
          ],
          [2500, 1500, 5100]),
        ...spacer(1),
        h2('7.3 Advisory Board (To Be Recruited — Q2-Q3 2026)'),
        tbl(['Advisor Role', 'Expertise Required', 'Purpose'],
          [
            ['FCA Legal Advisor',       'Regulatory licensing, financial promotions compliance, Consumer Duty PS22/9',    'Guide FCA Sandbox application and AR appointment; review all financial promotions'],
            ['Investment Advisor',      'CFA-qualified; portfolio methodology; investment compliance',                     'Oversight of AI portfolio construction methodology and investment compliance under COBS 9A'],
            ['Growth Advisor',          'UK fintech growth marketing; app launch experience (1M+ users)',                  'Design and execute go-to-market strategy; referral programme architecture'],
            ['Technology Advisor',      'Senior engineer; AWS/financial services scaling; security architecture',          'Technical architecture review; security design; scalability planning for seed phase'],
          ],
          [2200, 3300, 3600]),
        ...spacer(1),
        h2('7.4 Post-Seed Hiring Plan (2027-2028)'),
        tbl(['Year', 'Role', 'Budget', 'Priority'],
          [
            ['2027 Q2', 'Chief Compliance Officer (CCO)',    '£60K',  'Critical — FCA full authorisation requires dedicated compliance lead'],
            ['2027 Q2', 'Head of Growth',                    '£50K',  'High — user acquisition scaling after seed round'],
            ['2027 Q3', 'Developer 3 — Backend Engineer',    '£40K',  'High — infrastructure scaling for 10K+ MAU'],
            ['2027 Q3', 'Developer 4 — Mobile Engineer',     '£40K',  'High — feature velocity for Pro tier development'],
            ['2027 Q4', 'Customer Success Lead',             '£32K',  'Medium — onboarding quality, NPS improvement, support management'],
            ['2028 Q1', 'Data Scientist / ML Engineer',      '£55K',  'Medium — AI advisor iteration, smart goal engine improvement'],
          ],
          [1300, 2800, 1300, 3700]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 8. MARKETING AND SALES STRATEGY
        // ─────────────────────────────────────────────────────────────
        sectionBanner('8', 'Marketing and Sales Strategy'),
        ...spacer(1),
        h2('8.1 Positioning Statement'),
        infoBox('HAY-M is for UK adults who want to save automatically and invest intelligently — without needing to be financially literate to begin. Unlike complex apps that require financial knowledge to navigate, HAY-M does the hard work for you: rounding up your spending, building your savings, and coaching you with AI.'),
        ...spacer(1),
        h2('8.2 Go-To-Market Phases'),
        h3('Phase 1 — Pre-Launch (Q2-Q4 2026)  |  Budget: £5,000'),
        bullet('Waitlist campaign via LinkedIn thought leadership, TikTok personal finance content, Reddit (r/UKPersonalFinance)'),
        bullet('2-3 UK micro-influencers in personal finance niche (10K-100K followers) for authentic product previews'),
        bullet('"HAY-M Beta Access" email campaign — early sign-ups receive 3 months free HAY-M Plus'),
        bullet('Target earned media in AltFi, Finextra, Sifted — UK fintech trade press'),
        bullet('Founder Moin Siddiqui builds personal brand as UK fintech entrepreneur on LinkedIn and X'),
        bullet('Target: 1,000+ waitlist sign-ups before public launch'),
        ...spacer(1),
        h3('Phase 2 — Launch (Q1 2027)  |  Budget: £8,000'),
        bullet('App Store and Google Play launch with curated review strategy (target 4.5+ rating from Day 1)'),
        bullet('Referral programme: £5 HAY-M credit for every friend who makes their first round-up'),
        bullet('Google Ads pilot targeting: "save money app UK", "micro investing UK", "round up savings"'),
        bullet('PR outreach: BBC Money Box, Guardian Money, ThisIsMoney — UK fintech founder story angle'),
        bullet('University campus ambassador programme: 5 UK universities in Q1 2027'),
        ...spacer(1),
        h3('Phase 3 — Growth (Q2 2027 onwards, post-seed)  |  Budget: £40K/yr'),
        bullet('Scale paid digital acquisition across Meta, Google, TikTok — targeting £6-8 CAC'),
        bullet('Employer savings partnerships: HR departments at mid-size UK companies (1,000-10,000 employees)'),
        bullet('Open Banking data partnerships: cross-referrals with Emma, Snoop budgeting apps'),
        bullet('30-day savings challenges with prize pools — viral sharing mechanic for organic growth'),
        ...spacer(1),
        h2('8.3 Retention Mechanics'),
        bullet('Weekly "Money Snapshot" push notification — personalised savings summary every Monday morning'),
        bullet('In-app streak rewards: 30-day saving streak unlocks a HAY-M achievement badge'),
        bullet('Goal milestone celebrations: confetti animation + shareable card on reaching a savings target'),
        bullet('Monthly "HAY-M Digest" email — market insights, tips, platform updates, user stories'),
        bullet('Peer benchmarking: "Users like you saved an average of £87 this month" — social proof nudge'),
        ...spacer(1),
        h2('8.4 Key Marketing Metrics'),
        tbl(['Metric', 'Year 2 Target', 'Year 3 Target', 'Year 4 Target'],
          [
            ['Monthly Active Users (MAU)',   '8,000',  '45,000',  '120,000'],
            ['Customer Acquisition Cost',    '£12.00', '£8.00',   '£6.00'],
            ['Monthly Churn Rate',           '4.5%',   '3.0%',    '2.0%'],
            ['LTV:CAC Ratio',                '4:1',    '15:1',    '35:1'],
            ['ARPU (monthly)',               '£0.75',  '£2.40',   '£4.20'],
            ['App Store Rating Target',      '4.5+',   '4.6+',    '4.7+'],
            ['Referral % of new users',      '15%',    '25%',     '35%'],
          ],
          [3000, 1550, 1550, 3000]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 9. SWOT ANALYSIS
        // ─────────────────────────────────────────────────────────────
        sectionBanner('9', 'SWOT Analysis'),
        ...spacer(1),
        body('The following SWOT analysis provides a structured assessment of HAY-M\'s internal position and external environment as of April 2026, drawing on verified market data, competitor research, and the business plan assumptions outlined in preceding sections.'),
        ...spacer(1),
        // SWOT 4-quadrant table
        (() => {
          const sw = (title, items, bg, titleColor) => new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 6, color: titleColor }, bottom: border, left: border, right: border },
            shading: { fill: bg, type: ShadingType.CLEAR },
            width: { size: 4550, type: WidthType.DXA },
            margins: { top: 160, bottom: 160, left: 180, right: 180 },
            children: [
              new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: title, font: 'Arial', size: 24, bold: true, color: titleColor })] }),
              ...items.map(t => new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 70 },
                children: [new TextRun({ text: t, font: 'Arial', size: 20, color: DARK_TEXT })] }))
            ]
          });
          return new Table({
            width: { size: 9100, type: WidthType.DXA }, columnWidths: [4550, 4550],
            rows: [
              new TableRow({ children: [
                sw('STRENGTHS', [
                  'Zero investment minimum — round-ups from as little as £0.01; vs £500 minimum at Nutmeg [13] and no investment at Monzo [12]',
                  'Only UK app combining full AI advisory + self-directed portfolios + micro-saving + conversational AI coach — verified across Plum [27][30], Chip [32][36], Monzo [12], Nutmeg [13]',
                  'Accessible pricing (£0-£6.99/mo) vs Plum up to £9.99/mo [10], Monzo up to £15/mo [12], Nutmeg 0.75% AUM [13]',
                  'Lean Year 1 cost base — 2 developers at £60K total; founder-led with low overhead',
                  'Radically simple UX — direct response to documented UX complexity: Plum Google Play reviews cite 5+ steps for ISA automation [30]',
                  'Founder brings QA, agile delivery, and enterprise collaboration skills from Wipro [39] — Super Achiever Award [26]',
                  'Multi-stream revenue model (subscriptions + 0.35% AUM fees + brand collaborations) — reduces single-source dependency',
                  'Dual platform: fully built web app + iOS/Android mobile app at MVP stage',
                ], 'ECFDF5', GREEN),
                sw('WEAKNESSES', [
                  'No existing user base, brand recognition, or track record — starting from zero vs Plum 2M users [27] and Chip 500K users [32]',
                  'Year 1 funding gap of £58K — own capital (£60K) does not fully cover projected £118K budget',
                  'Small engineering team (2 developers) limits feature velocity vs Plum and Chip\'s larger funded teams [27][32]',
                  'FCA regulatory process is slow and expensive — FCA Sandbox [14] and AR route [15] add 12+ months before full authorisation',
                  'No existing compliance infrastructure — FCA AR model limits product scope in Year 1 vs fully authorised competitors',
                  'AI chat quality depends on OpenAI API — third-party dependency introduces cost and quality risks',
                  'Founder has no prior fintech or startup founding experience — learning curve in investor relations and regulatory navigation',
                ], 'FEF2F2', RED),
              ]}),
              new TableRow({ children: [
                sw('OPPORTUNITIES', [
                  'UK fintech market growing from £11.2B (2021) to estimated £34.2B (2026) — 205% expansion [5] creating space for new entrants',
                  '38% of UK adults have no savings habit [1] and 57% hold no investments [2] — massive underserved TAM of financially disengaged consumers',
                  'Mature Open Banking infrastructure: TrueLayer [17] covers 95%+ of UK accounts — removes the technical barrier previously blocking new entrants',
                  'Competitor UX frustration is documented: Plum Google Play reviews [30] and App Store [28] show widespread dissatisfaction with complexity',
                  'Micro-investing growing 31% YoY [4] — tailwinds already in market; HAY-M arrives at peak growth phase',
                  'AI cost reduction — OpenAI API pricing trends downward, improving HAY-M unit economics over time',
                  'Innovate UK Smart Grants (up to £50K) [20] and UK angel networks actively funding early-stage fintech in 2026',
                  'Employer financial wellbeing partnerships — growing HR trend creates B2B acquisition channel beyond direct-to-consumer',
                  'European expansion via FCA passporting from 2029 — Republic of Ireland as first target market (English-speaking, similar regulation)',
                ], 'FFFBEB', AMBER),
                sw('THREATS', [
                  'Monzo (7.5M users [12]), Plum (2M users [27]), or Chip (500K users [32]) could clone HAY-M\'s AI features — incumbents have far greater resources',
                  'FCA regulatory tightening — evolving Consumer Duty rules [16] could increase compliance costs unexpectedly beyond forecast £12K/yr',
                  'User trust barriers — financial data sharing anxiety documented among UK consumers; may slow Open Banking adoption [17]',
                  'UK economic downturn — reduces discretionary spending and therefore round-up volumes (HAY-M revenue directly linked to transaction activity)',
                  'Seed funding market tightening — UK VC investment in fintech declined post-2022; raising £300K-£750K may be harder than projected',
                  'Key developer attrition — loss of either Year 1 engineer before MVP would critically delay product delivery',
                  'OpenAI API disruption — pricing changes or API deprecation could impact the AI advisor feature mid-development',
                  'Market saturation — 12M+ UK users already on fintech apps [6]; differentiation must be sharp and consistent to attract switchers',
                ], 'F0F4F8', '374151'),
              ]}),
            ]
          });
        })(),
        ...spacer(1),
        h2('9.1 SWOT Strategic Implications'),
        tbl(['Strategy Type', 'Approach', 'Actions'],
          [
            ['SO — Use Strengths to capture Opportunities', 'Attack the gap Plum/Chip leave open', 'Launch with radical simplicity + AI chat as core differentiator; target frustrated Plum/Chip users directly in paid acquisition messaging'],
            ['WO — Overcome Weaknesses via Opportunities',  'Use market timing to bridge gaps',     'Apply for Innovate UK grant early Q3 2026; leverage FCA sandbox timeline to build credibility with investors before full authorisation'],
            ['ST — Use Strengths to counter Threats',       'Build community moat proactively',     'Focus on user habit formation and referral loop from Day 1 — community stickiness makes incumbent feature-copying less effective'],
            ['WT — Minimise Weaknesses, avoid Threats',     'Stay lean; do not over-extend',        'Scope MVP tightly to core features; maintain £8K contingency reserve; get FCA compliance right first time to avoid costly setbacks'],
          ],
          [2200, 2200, 4700]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 10. INVESTMENT STRATEGY AND FUNDING REQUIREMENT
        // ─────────────────────────────────────────────────────────────
        sectionBanner('10', 'Investment Strategy and Funding Requirement'),
        ...spacer(1),
        h2('10.1 Year 1 — Own Capital: £60,000  (2026)'),
        body('Moin Siddiqui is investing £60,000 of personal capital to fund Year 1 development. The total Year 1 budget is £118,000, leaving a gap of £58,000 to be bridged through:'),
        bullet('Developer equity/option packages — below-market contract rates with vesting schedule'),
        bullet('Pre-sales: beta access at £1.99/month to waitlist users pre-launch (target: 500 users = £1,000/month)'),
        bullet('Innovate UK Smart Grant [20] — application submitted Q3 2026 (up to £50,000 available for innovative tech SMEs) — ukri.org/councils/innovate-uk/guidance-for-applicants/types-of-funding/smart/'),
        bullet('Angel bridge: 3-5 UK fintech angels for a £20-30K bridge in Q3 2026 if required'),
        ...spacer(1),
        tbl(['Cost Category', 'Annual Budget', 'Notes'],
          [
            ['Engineering Staff (2 developers)',  '£60,000',  '2 developers capped at £30K each; contract/remote arrangements'],
            ['Technology & Development',          '£20,000',  'AWS, TrueLayer, Onfido, Stripe, OpenAI API, dev tooling, licenses'],
            ['Marketing & User Acquisition',      '£10,000',  'Pre-launch waitlist, social content, micro-influencer collaborations'],
            ['Legal & Regulatory (FCA)',          '£12,000',  'FCA Sandbox application, compliance consultant, company formation'],
            ['Operations & Admin',                '£8,000',   'Accounting, cloud ops, insurance, miscellaneous admin'],
            ['Contingency Reserve',               '£8,000',   'Overrun buffer — kept liquid; not to be used unless necessary'],
          ],
          [3000, 1800, 4300],
          NAVY),
        tblTotals(
          ['TOTAL YEAR 1 BUDGET', '', ''],
          [],
          [3000, 1800, 4300],
          ['TOTAL', '£118,000', 'Shortfall of £58K above own capital — bridged via grant/angel as above'],
        ),
        ...spacer(1),
        h2('10.2 Year 2 Seed Round: £300,000 — £750,000  (H1 2027)'),
        body('The seed round will be pursued once all of the following conditions are met:'),
        bullet('Working app with 1,000+ real paying or active users'),
        bullet('Proven ARPU of £1.50 or above per month'),
        bullet('Monthly churn below 5%'),
        bullet('FCA Appointed Representative status confirmed and active'),
        ...spacer(1),
        h3('Seed Round Use of Funds'),
        tbl(['Category', 'Allocation', 'Amount (£300K base)', 'Purpose'],
          [
            ['Engineering Hires',    '35%',  '~£105,000', '2x additional developers; infrastructure scaling to support 10K+ MAU'],
            ['Marketing & Growth',   '30%',  '~£90,000',  'Paid digital acquisition (Meta/Google/TikTok); referral programme; PR'],
            ['Compliance & Legal',   '15%',  '~£45,000',  'FCA full authorisation; CCO hire; ongoing regulatory legal counsel'],
            ['Operations',           '10%',  '~£30,000',  'Customer support tooling; admin; expanded cloud infrastructure'],
            ['Reserve',              '10%',  '~£30,000',  '18-month runway buffer — not to be deployed without board approval'],
          ],
          [2200, 1400, 2200, 3300]),
        ...spacer(1),
        h2('10.3 Investment Returns Projection'),
        tbl(['Metric', 'Year 2 (2027)', 'Year 3 (2028)', 'Year 4 (2029)'],
          [
            ['Monthly Active Users',   '8,000',   '45,000',   '120,000'],
            ['Monthly ARPU',           '£0.75',   '£2.40',    '£4.20'],
            ['Annual Revenue',         '£72K',    '£453K',    '£1.09M'],
            ['Annual Costs',           '£228K',   '£300K',    '£390K'],
            ['Net P&L',                '-£156K',  '+£153K',   '+£700K'],
            ['LTV per User',           '£48',     '£120',     '£210'],
          ],
          [3000, 1800, 1800, 2500]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 11. REVENUE & COST OF SALES FORECAST
        // ─────────────────────────────────────────────────────────────
        sectionBanner('11', 'Revenue & Cost of Sales Forecast'),
        ...spacer(1),
        h2('11.1 Revenue Breakdown by Stream'),
        tbl(['Revenue Stream', '2026', '2027', '2028', '2029', 'Notes'],
          [
            ['Subscription (Free)',           '£0',   '£0',    '£0',    '£0',    '55% of users — zero revenue; reduces CAC via word-of-mouth'],
            ['Subscription (Plus £2.99/mo)',   '£0',   '£28K',  '£145K', '£360K', '30% of users — 2,400 / 13,500 / 36,000 paying users'],
            ['Subscription (Pro £6.99/mo)',    '£0',   '£24K',  '£145K', '£360K', '15% of users — 1,200 / 6,750 / 18,000 paying users'],
            ['AUM Fee (0.35% p.a.)',           '£0',   '£8K',   '£94K',  '£240K', '40% of users investing; avg AUM £1,500 Yr3, £2,500 Yr4'],
            ['Brand Collaborations',          '£0',   '£10K',  '£55K',  '£110K', 'Referral commissions; curated partnerships; FCA-compliant'],
            ['Premium Features (Yr3+)',        '£0',   '£2K',   '£14K',  '£20K',  'Coaching sessions £15; analytics add-on £0.99/month'],
          ],
          [2800, 1000, 1000, 1000, 1000, 2300]),
        tblTotals(
          ['TOTAL REVENUE', '2026', '2027', '2028', '2029', ''],
          [],
          [2800, 1000, 1000, 1000, 1000, 2300],
          ['TOTAL', '£0', '£72K', '£453K', '£1.09M', ''],
        ),
        ...spacer(1),
        h2('11.2 Cost of Sales / Direct Costs'),
        tbl(['Cost Category', '2026', '2027', '2028', '2029', 'Notes'],
          [
            ['OpenAI API (AI Chat)',            '£3,000',  '£8,000',   '£18,000',  '£40,000',  'Scales with active chat users; ~£0.40/user/month Pro tier'],
            ['TrueLayer Open Banking',          '£2,000',  '£6,000',   '£15,000',  '£35,000',  'Per-connection fee; reduces per user at volume'],
            ['Onfido KYC per verification',     '£2,500',  '£5,500',   '£12,000',  '£20,000',  '~£1.50 per KYC; scales with new user registrations'],
            ['Stripe Payment Processing',       '£1,000',  '£3,000',   '£8,000',   '£18,000',  '1.4% + 20p per transaction on subscription billing'],
            ['AWS Infrastructure (variable)',   '£4,000',  '£10,000',  '£18,000',  '£28,000',  'EC2, S3, Lambda, RDS — scales with user base'],
            ['Custodian/Broker Fees',           '£0',      '£2,000',   '£8,000',   '£20,000',  'DriveWealth/Alpaca settlement fees on investment trades'],
          ],
          [2800, 900, 900, 1000, 1000, 2500]),
        tblTotals(
          ['TOTAL COST OF SALES', '', '', '', '', ''],
          [],
          [2800, 900, 900, 1000, 1000, 2500],
          ['TOTAL', '£12,500', '£34,500', '£79,000', '£161,000', ''],
        ),
        ...spacer(1),
        h2('11.3 Gross Profit'),
        tbl(['', '2026', '2027', '2028', '2029'],
          [
            ['Total Revenue',      '£0',    '£72K',    '£453K',    '£1,090K'],
            ['Total Cost of Sales','£12.5K','£34.5K',  '£79K',     '£161K'],
            ['Gross Profit',       '-£12.5K','£37.5K', '£374K',    '£929K'],
            ['Gross Margin %',     'N/A',   '52.1%',   '82.6%',    '85.2%'],
          ],
          [2800, 1550, 1550, 1550, 1650]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 12. CASH FLOW FORECAST
        // ─────────────────────────────────────────────────────────────
        sectionBanner('12', 'Cash Flow Forecast'),
        ...spacer(1),
        body('The cash flow forecast below presents quarterly projections for 2026-2027 (build and early growth phases) and annual summaries for 2028-2029. All figures are in GBP sterling.'),
        ...spacer(1),
        h2('12.1 Quarterly Cash Flow — 2026 (Year 1)'),
        tbl(['Category', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'FY 2026'],
          [
            ['INFLOWS', '', '', '', '', ''],
            ['Owner Capital Injected',    '£40,000', '£10,000', '£5,000',  '£5,000',  '£60,000'],
            ['Innovate UK Grant (est.)',   '£0',      '£0',      '£25,000', '£0',      '£25,000'],
            ['Angel Bridge Funding',      '£0',      '£0',      '£20,000', '£0',      '£20,000'],
            ['Beta Pre-Sales',            '£0',      '£0',      '£1,000',  '£2,000',  '£3,000'],
            ['Total Cash In',             '£40,000', '£10,000', '£51,000', '£7,000',  '£108,000'],
            ['OUTFLOWS', '', '', '', '', ''],
            ['Engineering Staff',         '£0',      '£15,000', '£22,500', '£22,500', '£60,000'],
            ['Technology & APIs',         '£3,000',  '£5,000',  '£6,000',  '£6,000',  '£20,000'],
            ['Marketing',                 '£500',    '£1,500',  '£4,000',  '£4,000',  '£10,000'],
            ['Legal & FCA',               '£3,000',  '£4,000',  '£3,000',  '£2,000',  '£12,000'],
            ['Operations & Admin',        '£2,000',  '£2,000',  '£2,000',  '£2,000',  '£8,000'],
            ['Contingency',               '£2,000',  '£2,000',  '£2,000',  '£2,000',  '£8,000'],
            ['Total Cash Out',            '£10,500', '£29,500', '£39,500', '£38,500', '£118,000'],
          ],
          [2600, 1300, 1300, 1300, 1300, 1300]),
        tblTotals(
          ['NET CASH FLOW', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'FY 2026'],
          [],
          [2600, 1300, 1300, 1300, 1300, 1300],
          ['Net Cash Flow', '+£29,500', '-£19,500', '+£11,500', '-£31,500', '-£10,000'],
        ),
        tblTotals(
          ['CLOSING CASH BALANCE', '', '', '', '', ''],
          [],
          [2600, 1300, 1300, 1300, 1300, 1300],
          ['Closing Balance', '£29,500', '£10,000', '£21,500', '-£10,000*', ''],
        ),
        body('* Year-end cash deficit of £10K assumes grant and angel funding are secured; contingency reserve to be deployed if required.', { italics: true, color: MID_GREY }),
        ...spacer(1),
        h2('12.2 Quarterly Cash Flow — 2027 (Year 2)'),
        tbl(['Category', 'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027', 'FY 2027'],
          [
            ['INFLOWS', '', '', '', '', ''],
            ['Subscription Revenue',      '£5,000',  '£14,000', '£24,000', '£29,000', '£72,000'],
            ['Seed Round (est. Q2)',       '£0',      '£300,000','£0',      '£0',      '£300,000'],
            ['Total Cash In',             '£5,000',  '£314,000','£24,000', '£29,000', '£372,000'],
            ['OUTFLOWS', '', '', '', '', ''],
            ['Engineering & Tech Staff',  '£25,000', '£32,000', '£45,000', '£45,000', '£147,000'],
            ['Technology & APIs',         '£7,000',  '£9,000',  '£11,000', '£11,000', '£38,000'],
            ['Marketing & Growth',        '£6,000',  '£12,000', '£11,000', '£11,000', '£40,000'],
            ['Legal & FCA',               '£8,000',  '£7,000',  '£5,000',  '£5,000',  '£25,000'],
            ['Operations',                '£5,000',  '£5,000',  '£5,000',  '£5,000',  '£20,000'],
            ['Contingency',               '£4,000',  '£4,000',  '£4,000',  '£3,000',  '£15,000'],
            ['Total Cash Out',            '£55,000', '£69,000', '£81,000', '£80,000', '£285,000'],
          ],
          [2600, 1300, 1300, 1300, 1300, 1300]),
        tblTotals(
          ['NET CASH FLOW', 'Q1 2027', 'Q2 2027', 'Q3 2027', 'Q4 2027', 'FY 2027'],
          [],
          [2600, 1300, 1300, 1300, 1300, 1300],
          ['Net Cash Flow', '-£50,000', '+£245,000', '-£57,000', '-£51,000', '+£87,000'],
        ),
        ...spacer(1),
        h2('12.3 Annual Cash Flow Summary — 2028-2029'),
        tbl(['Category', '2028', '2029'],
          [
            ['Total Revenue (Cash In)',   '£453,000',    '£1,090,000'],
            ['Total Operating Costs',     '£300,000',    '£390,000'],
            ['Net Cash from Operations',  '+£153,000',   '+£700,000'],
            ['Capital Expenditure',       '-£15,000',    '-£20,000'],
            ['Net Cash Flow',             '+£138,000',   '+£680,000'],
          ],
          [4000, 2550, 2550]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 13. ANNUAL PROFIT & LOSS FORECAST
        // ─────────────────────────────────────────────────────────────
        sectionBanner('13', 'Annual Profit & Loss Forecast'),
        ...spacer(1),
        tbl(['P&L Line Item', '2026', '2027', '2028', '2029'],
          [
            ['REVENUE', '', '', '', ''],
            ['Subscription Revenue',       '£0',       '£52,000',   '£290,000',  '£720,000'],
            ['AUM Fees (0.35% p.a.)',       '£0',       '£8,000',    '£94,000',   '£240,000'],
            ['Brand Collaborations',        '£0',       '£10,000',   '£55,000',   '£110,000'],
            ['Premium Features',            '£0',       '£2,000',    '£14,000',   '£20,000'],
            ['TOTAL REVENUE',               '£0',       '£72,000',   '£453,000',  '£1,090,000'],
            ['COST OF SALES', '', '', '', ''],
            ['Direct Technology Costs',     '£12,500',  '£34,500',   '£79,000',   '£161,000'],
            ['GROSS PROFIT',                '-£12,500', '£37,500',   '£374,000',  '£929,000'],
            ['Gross Margin %',              'N/A',      '52.1%',     '82.6%',     '85.2%'],
            ['OPERATING EXPENSES', '', '', '', ''],
            ['Engineering Staff',           '£60,000',  '£90,000',   '£130,000',  '£180,000'],
            ['Technology & Infrastructure', '£7,500',   '£3,500',    '-£20,000*', '-£111,000*'],
            ['Marketing & Acquisition',     '£10,000',  '£40,000',   '£60,000',   '£80,000'],
            ['Legal & Regulatory',          '£12,000',  '£25,000',   '£28,000',   '£30,000'],
            ['Operations & Admin',          '£8,000',   '£20,000',   '£18,000',   '£20,000'],
            ['Contingency / Other',         '£8,000',   '£15,000',   '£9,000',    '£10,000'],
            ['TOTAL OPERATING EXPENSES',    '£105,500', '£193,500',  '£225,000',  '£209,000'],
            ['EBITDA',                      '-£118,000','-£156,000', '+£149,000', '+£720,000'],
            ['Depreciation & Amortisation', '£0',       '£0',        '£4,000',    '£8,000'],
            ['OPERATING PROFIT (EBIT)',      '-£118,000','-£156,000', '+£145,000', '+£712,000'],
            ['Corporation Tax (25%)',        '£0',       '£0',        '£36,250',   '£178,000'],
            ['NET PROFIT AFTER TAX',         '-£118,000','-£156,000', '+£108,750', '+£534,000'],
          ],
          [3000, 1550, 1550, 1550, 1550]),
        body('* Technology costs net of direct technology costs already allocated to Cost of Sales.', { italics: true, color: MID_GREY }),
        ...spacer(1),
        h2('13.1 Sensitivity Analysis'),
        tbl(['Scenario', 'User Growth/Mo', 'ARPU', 'Churn', 'Yr 3 Revenue', 'Break-Even'],
          [
            ['Bear Case', '3% monthly',  '£1.20', '5.0%', '£185K', 'Month 48'],
            ['Base Case', '8% monthly',  '£2.40', '3.0%', '£453K', 'Month 36'],
            ['Bull Case', '15% monthly', '£4.00', '1.5%', '£980K', 'Month 24'],
          ],
          [1800, 1600, 1100, 1100, 1800, 1700]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 14. BALANCE SHEET FORECAST
        // ─────────────────────────────────────────────────────────────
        sectionBanner('14', 'Balance Sheet Forecast'),
        ...spacer(1),
        body('The forecasted balance sheets below show the financial position of HAY-M at the end of each financial year (31 December). Year 2 reflects the impact of the seed round (£300K base case).'),
        ...spacer(1),
        tbl(['Balance Sheet Item', 'Dec 2026', 'Dec 2027', 'Dec 2028', 'Dec 2029'],
          [
            ['FIXED ASSETS (NON-CURRENT)', '', '', '', ''],
            ['Intangible Assets — Software Platform',    '£45,000',  '£85,000',   '£110,000',  '£130,000'],
            ['Computer Equipment (net)',                  '£4,500',   '£8,000',    '£12,000',   '£15,000'],
            ['TOTAL FIXED ASSETS',                        '£49,500',  '£93,000',   '£122,000',  '£145,000'],
            ['CURRENT ASSETS', '', '', '', ''],
            ['Cash & Cash Equivalents',                   '£8,000',   '£95,000',   '£233,000',  '£913,000'],
            ['Accounts Receivable',                       '£0',       '£6,000',    '£38,000',   '£91,000'],
            ['Prepayments & Deposits',                    '£2,500',   '£5,000',    '£8,000',    '£12,000'],
            ['TOTAL CURRENT ASSETS',                      '£10,500',  '£106,000',  '£279,000',  '£1,016,000'],
            ['TOTAL ASSETS',                              '£60,000',  '£199,000',  '£401,000',  '£1,161,000'],
            ['LIABILITIES', '', '', '', ''],
            ['Accounts Payable',                          '£2,500',   '£8,000',    '£15,000',   '£25,000'],
            ['Deferred Revenue (subscriptions)',          '£0',       '£6,000',    '£38,000',   '£90,000'],
            ['Tax Payable',                               '£0',       '£0',        '£36,000',   '£178,000'],
            ['TOTAL CURRENT LIABILITIES',                 '£2,500',   '£14,000',   '£89,000',   '£293,000'],
            ['EQUITY', '', '', '', ''],
            ['Share Capital',                             '£60,000',  '£360,000',  '£360,000',  '£360,000'],
            ['Retained Earnings / (Accumulated Loss)',    '-£2,500',  '-£175,000', '-£48,000',  '£508,000'],
            ['TOTAL EQUITY',                              '£57,500',  '£185,000',  '£312,000',  '£868,000'],
            ['TOTAL LIABILITIES + EQUITY',                '£60,000',  '£199,000',  '£401,000',  '£1,161,000'],
          ],
          [3200, 1500, 1500, 1500, 1500]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 15. FORECASTED STOCK LEVELS
        // ─────────────────────────────────────────────────────────────
        sectionBanner('15', 'Forecasted Stock Levels (If Applicable)'),
        ...spacer(1),
        infoBox('HAY-M is a 100% digital software platform. As such, there are no physical products, raw materials, work-in-progress, or finished goods inventory to forecast. Stock level forecasting in the traditional sense is not applicable to this business model.'),
        ...spacer(1),
        body('However, the following digital asset levels are tracked as operational inventory equivalents:'),
        ...spacer(1),
        tbl(['Digital Asset Type', '2026', '2027', '2028', '2029', 'Notes'],
          [
            ['API Capacity Units (TrueLayer)',  '500 connections', '10,000 connections', '50,000 connections', '130,000 connections', 'Contracted monthly capacity; auto-scales with user growth'],
            ['OpenAI API Token Budget',         '1M tokens/mo',    '5M tokens/mo',       '20M tokens/mo',      '60M tokens/mo',       'Pre-purchased token allocations for AI chat feature (Pro tier)'],
            ['AWS Server Capacity',             'Small (2 nodes)', 'Medium (6 nodes)',   'Large (15 nodes)',   'XL (40 nodes)',        'Auto-scaling configured; capacity pre-provisioned per quarter'],
            ['Onfido KYC Verifications',        '1,000/mo',        '5,000/mo',           '20,000/mo',          '50,000/mo',           'Pre-contracted volume pricing; ~£1.50 per verification at scale'],
            ['Custodian Settlement Credits',    'N/A',             '£10,000',            '£50,000',            '£150,000',            'Pre-funded settlement balance with DriveWealth/Alpaca broker'],
          ],
          [2500, 1500, 1600, 1600, 1600, 1300]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 16. FORECASTED ADVERTISING/MARKETING EXPENDITURE
        // ─────────────────────────────────────────────────────────────
        sectionBanner('16', 'Forecasted Advertising/Marketing Expenditure'),
        ...spacer(1),
        tbl(['Marketing Channel / Activity', '2026', '2027', '2028', '2029', '% of Revenue'],
          [
            ['Social Content Production (TikTok, LinkedIn, X)',  '£1,500',  '£4,000',  '£6,000',  '£8,000',  'Brand awareness; organic reach'],
            ['Micro-Influencer Collaborations',                  '£2,000',  '£6,000',  '£8,000',  '£10,000', '10K-100K follower personal finance niche'],
            ['Google Search Ads (PPC)',                          '£0',      '£8,000',  '£14,000', '£20,000', '"save money app UK"; "micro investing UK"'],
            ['Meta / Facebook Ads',                              '£0',      '£6,000',  '£12,000', '£16,000', 'Retargeting + lookalike audiences; 18-35 demographic'],
            ['TikTok Paid Ads',                                  '£0',      '£5,000',  '£8,000',  '£12,000', 'Short-form video ads; personal finance trend targeting'],
            ['Referral Programme Credits',                       '£0',      '£4,000',  '£6,000',  '£8,000',  '£5 credit per referred user who completes first round-up'],
            ['PR / Media Outreach',                              '£2,000',  '£3,000',  '£4,000',  '£4,000',  'BBC Money Box, Guardian Money, AltFi, Finextra'],
            ['App Store Optimisation (ASO)',                     '£500',    '£1,000',  '£1,000',  '£1,000',  'Screenshot design, keyword optimisation, A/B testing'],
            ['University Campus Ambassadors',                    '£0',      '£2,000',  '£4,000',  '£4,000',  '5 UK universities; £400 per campus activation'],
            ['Employer Partnership Events',                      '£0',      '£0',      '£4,000',  '£4,000',  'HR conference attendance; financial wellbeing seminar sponsorship'],
            ['Email Marketing',                                  '£1,000',  '£1,000',  '£1,500',  '£2,000',  'Mailchimp; waitlist nurture; monthly HAY-M Digest'],
            ['Contingency / Opportunistic',                      '£3,000',  '£0',      '£1,500',  '£1,000',  'Unplanned opportunities; reactive campaigns'],
          ],
          [3300, 1000, 1000, 1000, 1000, 1800]),
        tblTotals(
          ['TOTAL MARKETING SPEND', '2026', '2027', '2028', '2029', ''],
          [],
          [3300, 1000, 1000, 1000, 1000, 1800],
          ['TOTAL', '£10,000', '£40,000', '£70,000', '£90,000', 'N/A / 8.8% / 15.5% / 8.3%'],
        ),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 17. FORECASTED FIXED ASSET SCHEDULE
        // ─────────────────────────────────────────────────────────────
        sectionBanner('17', 'Forecasted Fixed Asset Schedule'),
        ...spacer(1),
        body('HAY-M\'s fixed asset base is predominantly intangible — comprising the developed software platform — supplemented by a small amount of computer hardware for the development team. All values shown are at cost before depreciation/amortisation.'),
        ...spacer(1),
        h2('17.1 Tangible Fixed Assets (Hardware)'),
        tbl(['Asset', 'Year Acquired', 'Cost', 'Useful Life', 'Annual Depreciation', 'Notes'],
          [
            ['Developer Laptop x2',      '2026', '£3,000',  '3 years', '£1,000/yr',  'Contract developers; company-owned equipment'],
            ['Developer Laptop x2 (add.)','2027', '£3,000',  '3 years', '£1,000/yr',  'Post-seed hire equipment'],
            ['Server/NAS Unit',          '2026', '£1,500',  '5 years', '£300/yr',    'Local development server; backup unit'],
            ['Office Equipment',         '2027', '£2,500',  '5 years', '£500/yr',    'Post-seed first office setup (co-working transition)'],
            ['Mobile Test Devices (x4)', '2026', '£1,200',  '2 years', '£600/yr',    'iOS and Android test devices for QA'],
          ],
          [2300, 1400, 1000, 1200, 1800, 2400]),
        ...spacer(1),
        h2('17.2 Intangible Fixed Assets (Software Platform)'),
        tbl(['Asset', 'Year', 'Capitalised Cost', 'Amort. Period', 'Annual Amortisation', 'Notes'],
          [
            ['Core Savings Engine (Round-Up)',      '2026', '£15,000', '5 years', '£3,000/yr',  'Internally developed; developer time capitalised'],
            ['Mobile App — iOS/Android (RN)',       '2026', '£12,000', '5 years', '£2,400/yr',  'React Native dual-platform mobile application'],
            ['Web Application (React/Vite)',         '2026', '£8,000',  '5 years', '£1,600/yr',  'Full web version of the product'],
            ['AI Investment Advisor Engine',         '2026', '£10,000', '5 years', '£2,000/yr',  'Risk profiling + portfolio construction algorithm'],
            ['AI Chat Integration (OpenAI)',         '2027', '£8,000',  '3 years', '£2,667/yr',  'Custom system prompt + compliance guardrails dev'],
            ['Open Banking Integration (TrueLayer)', '2026', '£6,000',  '5 years', '£1,200/yr',  'Webhook + API integration; real-time transaction feed'],
            ['KYC/Onboarding Flow (Onfido)',         '2026', '£4,000',  '5 years', '£800/yr',    'Identity verification integration and UI flow'],
            ['Tax-Loss Harvesting Feature (Pro)',    '2027', '£12,000', '3 years', '£4,000/yr',  'Advanced Pro tier feature — post-seed development'],
            ['Employer API Integration',             '2028', '£15,000', '3 years', '£5,000/yr',  'B2B employer financial wellbeing channel'],
          ],
          [2700, 900, 1500, 1400, 1900, 1700]),
        tblTotals(
          ['TOTAL CAPITALISED INTANGIBLES', '', '', '', '', ''],
          [],
          [2700, 900, 1500, 1400, 1900, 1700],
          ['TOTAL', '', '£90,000 (at full roll-out)', '', 'See Note', ''],
        ),
        ...spacer(1),
        tbl(['Year', 'Opening NBV', 'Additions', 'Amortisation', 'Closing NBV'],
          [
            ['2026', '£0',      '£55,000', '£0',     '£55,000'],
            ['2027', '£55,000', '£20,000', '£4,000', '£71,000'],
            ['2028', '£71,000', '£15,000', '£8,000', '£78,000'],
            ['2029', '£78,000', '£8,000',  '£8,000', '£78,000'],
          ],
          [1800, 1800, 1800, 1800, 1900]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 18. FORECASTED STAFF COSTS
        // ─────────────────────────────────────────────────────────────
        sectionBanner('18', 'Forecasted Staff Costs'),
        ...spacer(1),
        h2('18.1 Headcount Plan by Year'),
        tbl(['Role', 'Start Date', 'Salary', '2026 Cost', '2027 Cost', '2028 Cost', '2029 Cost'],
          [
            ['Founder/CEO (Moin Siddiqui)',      'Day 1',    '£0 / £30K / £40K / £55K',    '£0',      '£30,000',  '£40,000',  '£55,000'],
            ['Developer 1 — Full-Stack Backend', 'Q3 2026',  '£30,000',                    '£15,000', '£32,000',  '£38,000',  '£45,000'],
            ['Developer 2 — Mobile Frontend',   'Q3 2026',  '£30,000',                    '£15,000', '£28,000',  '£35,000',  '£40,000'],
            ['Chief Compliance Officer (CCO)',   'Q2 2027',  '£60,000',                    '£0',      '£30,000',  '£60,000',  '£65,000'],
            ['Head of Growth',                  'Q2 2027',  '£50,000',                    '£0',      '£25,000',  '£50,000',  '£55,000'],
            ['Developer 3 — Backend Engineer',  'Q3 2027',  '£40,000',                    '£0',      '£20,000',  '£40,000',  '£45,000'],
            ['Developer 4 — Mobile Engineer',   'Q4 2027',  '£40,000',                    '£0',      '£10,000',  '£40,000',  '£45,000'],
            ['Customer Success Lead',           'Q4 2027',  '£32,000',                    '£0',      '£8,000',   '£32,000',  '£35,000'],
            ['Data Scientist / ML Engineer',    'Q1 2028',  '£55,000',                    '£0',      '£0',       '£40,000',  '£55,000'],
          ],
          [2500, 1200, 1800, 1100, 1100, 1100, 1300]),
        ...spacer(1),
        h2('18.2 Total Staff Cost Summary (incl. Employer NI & Benefits)'),
        tbl(['Cost Category', '2026', '2027', '2028', '2029'],
          [
            ['Gross Salaries',                  '£30,000',  '£183,000', '£375,000', '£440,000'],
            ['Employer NI (13.8% above £9,100)', '£2,000',  '£18,000',  '£36,000',  '£42,000'],
            ['Pension (5% employer contribution)','£1,500',  '£9,000',   '£18,000',  '£22,000'],
            ['Benefits, Training & Equipment',   '£2,000',  '£8,000',   '£12,000',  '£15,000'],
          ],
          [3000, 1550, 1550, 1550, 1550]),
        tblTotals(
          ['TOTAL STAFF COSTS', '2026', '2027', '2028', '2029'],
          [],
          [3000, 1550, 1550, 1550, 1550],
          ['TOTAL', '£35,500', '£218,000', '£441,000', '£519,000'],
        ),
        body('Note: Year 1 staff costs in the P&L show £60K as developer-only cost (founder draws no salary in Year 1; NI/pension not applicable at these rates). The above shows full-loaded total cost for transparency. Developer roles in Year 1 are structured as contract arrangements to manage employment liability before FCA authorisation is granted.', { italics: true, color: MID_GREY, size: 20 }),
        ...spacer(1),
        h2('18.3 Headcount Growth Summary'),
        tbl(['Year', 'FTE', 'Total Gross Salary Bill', 'Key Hire', 'Notes'],
          [
            ['2026', '2 (+ Founder)',  '£60,000',   'Developer 1 & 2',    'Contract arrangements; developer-funded lean team'],
            ['2027', '6 (+ Founder)',  '£183,000',  'CCO, Head of Growth, Dev 3+4', 'Post-seed scale; seed funding enables senior hires'],
            ['2028', '9 (+ Founder)',  '£375,000',  'Customer Success, Data Scientist', 'Full operational team; profitability phase begins'],
            ['2029', '9 (+ Founder)',  '£440,000',  'Annual pay review + EU hire planning', 'Series A preparation; EU expansion scoped'],
          ],
          [1000, 1500, 2000, 2500, 2100]),
        pb(),

        // ─────────────────────────────────────────────────────────────
        // 19. APPENDICES
        // ─────────────────────────────────────────────────────────────
        sectionBanner('19', 'Appendices (including CVs)'),
        ...spacer(1),
        h2('Appendix A — Founder CV: Moin Siddiqui'),
        ...spacer(1),
        tbl(['', ''],
          [
            ['Full Name',       'Moin Siddiqui'],
            ['Role',            'Founder & CEO, HAY-M'],
            ['LinkedIn',        'linkedin.com/in/moinas'],
            ['Email',           'hello@hay-m.co.uk'],
            ['Location',        'United Kingdom'],
          ],
          [2200, 6900], NAVY),
        ...spacer(1),
        h3('Professional Experience'),
        body('Wipro Limited [39] — QA Engineer / Test Automation Lead'),
        subbullet('Wipro Limited (NYSE: WIT) [39] — One of the world\'s leading digital transformation and IT services firms; 230,000+ employees across 65 countries. Source: wipro.com/about-wipro/ [39]'),
        subbullet('Built and maintained automated test pipelines at enterprise scale across international on/off-shore project teams [26][39]'),
        subbullet('Worked across multinational stakeholder groups, demonstrating the ability to coordinate across cultures, time zones, and complex delivery environments [26][39]'),
        subbullet('Proactively self-enrolled in automation training programmes without being asked — demonstrating independent self-improvement and entrepreneurial mindset [26]'),
        subbullet('Received Super Achiever Award from CEO-level leadership at Wipro — demonstrating delivery under pressure and recognition at the highest organisational level [26][39]'),
        ...spacer(1),
        h3('Peer Recommendations (LinkedIn [26] — Verified April 2026)'),
        infoBox('"A very skilful tester with great test automation know-how and experience. A great asset to each agile team." — LinkedIn peer recommendation [26], verified April 2026', 'F0F4F8', MINT),
        ...spacer(1),
        infoBox('"A reliable QA who asks the right questions... He keeps abreast with trending technologies and has the inclination to learning new skills. He would be an asset to any team for his sheer dedication." — LinkedIn peer recommendation [26], verified April 2026', 'F0F4F8', MINT),
        ...spacer(1),
        h3('Skills Relevant to HAY-M'),
        bullet('Test Automation & Quality Assurance — quality-first engineering culture critical for a regulated fintech'),
        bullet('Agile/Scrum Delivery — managing 2-developer sprint cycle; scoping MVPs and preventing scope creep'),
        bullet('Cross-Cultural Team Collaboration — investor communications, partner negotiations, team scaling'),
        bullet('Self-Directed Learning — independently mastering fintech regulation, AI product design, investor relations'),
        bullet('International Project Delivery — experience coordinating across on/off-shore distributed teams'),
        ...spacer(1),
        h2('Appendix B — References & Sources'),
        body('All metrics, market data, competitor comparisons, and regulatory references cited in this business plan are sourced from the publications listed below. Sources verified April 2026.'),
        ...spacer(1),
        tbl(['Ref', 'Source', 'URL'],
          [
            ['[1]',  'FCA Financial Lives Survey 2024 — Savings & Debt chapter',                       'https://www.fca.org.uk/financial-lives'],
            ['[2]',  'FCA Financial Lives Survey 2024 — Investments chapter',                          'https://www.fca.org.uk/financial-lives'],
            ['[3]',  'Accenture UK Fintech Report 2024',                                               'https://www.accenture.com/uk-en/insights/financial-services/fintech'],
            ['[4]',  'Statista — UK Micro-Investing Market Growth 2024',                               'https://www.statista.com/topics/3512/fintech-united-kingdom/'],
            ['[5]',  'KPMG Pulse of Fintech H2 2024 — UK Market',                                     'https://kpmg.com/uk/en/home/insights/2025/02/pulse-of-fintech.html'],
            ['[6]',  'Statista — Number of Fintech App Users UK 2025',                                 'https://www.statista.com/topics/3512/fintech-united-kingdom/'],
            ['[7]',  'ONS — Household Savings Ratio UK 2024',                                          'https://www.ons.gov.uk/economy/grossdomesticproductgdp/timeseries/qdzu/ukea'],
            ['[8]',  'OECD/INFE 2023 International Survey of Adult Financial Literacy',                'https://www.oecd.org/financial/education/oecd-infe-2023-international-survey-of-adult-financial-literacy.pdf'],
            ['[9]',  'Deloitte — UK Digital Banking Report 2024',                                      'https://www2.deloitte.com/uk/en/pages/financial-services/articles/digital-banking.html'],
            ['[10]', 'Plum — Pricing page (accessed April 2026)',                                      'https://withplum.com/pricing'],
            ['[11]', 'Chip — Pricing page (accessed April 2026)',                                      'https://getchip.uk/pricing'],
            ['[12]', 'Monzo — Pricing page (accessed April 2026)',                                     'https://monzo.com/pricing'],
            ['[13]', 'Nutmeg — Fees page (accessed April 2026)',                                       'https://www.nutmeg.com/fees'],
            ['[14]', 'FCA — Regulatory Sandbox overview',                                              'https://www.fca.org.uk/firms/innovation/regulatory-sandbox'],
            ['[15]', 'FCA — Appointed Representatives regime',                                         'https://www.fca.org.uk/firms/appointed-representatives'],
            ['[16]', 'FCA — Consumer Duty PS22/9',                                                     'https://www.fca.org.uk/publications/policy-statements/ps22-9-new-consumer-duty'],
            ['[17]', 'TrueLayer — Open Banking API documentation',                                     'https://docs.truelayer.com'],
            ['[18]', 'Onfido — Identity Verification platform',                                        'https://onfido.com'],
            ['[19]', 'Stripe — PCI DSS Compliance overview',                                           'https://stripe.com/docs/security'],
            ['[20]', 'Innovate UK — Smart Grants programme',                                           'https://www.ukri.org/councils/innovate-uk/guidance-for-applicants/types-of-funding/smart/'],
            ['[21]', 'App Annie — UK Personal Finance App Rankings Q1 2025',                           'https://www.data.ai/en/apps/google-play/top-grossing/finance/united-kingdom/'],
            ['[22]', 'MoneySuperMarket — UK Savings Statistics 2024',                                  'https://www.moneysupermarket.com/savings/statistics/'],
            ['[26]', 'Moin Siddiqui — LinkedIn Profile, peer recommendations (April 2026)',            'https://www.linkedin.com/in/moinas/'],
            ['[27]', 'Wise / Money To The Masses — Plum Review 2026',                                  'https://moneytothemasses.com/banking/plum-review-is-ai-the-best-way-to-save-and-invest'],
            ['[28]', 'Plum — App Store listing (Apple), April 2026',                                   'https://apps.apple.com/cy/app/plum-smart-saving-investing/id1456139507'],
            ['[32]', 'MoneyZine — Chip Review UK 2026',                                                'https://moneyzine.com/uk/investments/chip-review/'],
            ['[39]', 'Wipro Limited — Company Overview',                                               'https://www.wipro.com/about-wipro/'],
          ],
          [700, 4200, 4200]),
        ...spacer(2),
        h2('Appendix C — Key Milestones & Roadmap'),
        tbl(['Phase', 'Period', 'Milestones'],
          [
            ['1 — Foundation',    'Q2-Q3 2026', 'Company formation · Hire 2 developers · FCA Sandbox application · UI/UX design completed · Tech stack finalised'],
            ['2 — Development',   'Q3-Q4 2026', 'Core savings engine · Open Banking integration · KYC/Onfido flow · Internal alpha testing · Seed deck prepared · Waitlist 1,000+'],
            ['3 — MVP Launch',    'Q1 2027',    'App Store + Google Play launch · Revenue begins · Referral programme live · 500 users Month 1 · FCA AR status active'],
            ['4 — Seed & Scale',  'Q2-Q4 2027', 'Seed round £300K-£750K · Team scales to 6+ FTE · CCO hired · AI advisor deployed · 10K MAU target · FCA full authorisation'],
            ['5 — Profitability', '2028-2029',  'Break-even Month 36 (base case) · 120K MAU by end 2029 · Series A discussions · EU expansion scoped (Ireland first)'],
          ],
          [1700, 1500, 5900]),
        ...spacer(2),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 400 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
          children: [new TextRun({ text: 'Moin Siddiqui  |  Founder & CEO, HAY-M  |  hello@hay-m.co.uk  |  www.hay-m.co.uk', font: 'Arial', size: 18, color: MID_GREY })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: 'Registered in England & Wales  |  Strictly Confidential — April 2026', font: 'Arial', size: 18, color: MID_GREY })]
        }),
      ]
    }
  ]
});

// ── WRITE FILE ─────────────────────────────────────────────────────────────
Packer.toBuffer(doc).then(buffer => {
  const outPath = 'D:/mobileapp/docs/HAY-M_BusinessPlan_Final_v3.docx';
  fs.writeFileSync(outPath, buffer);
  const kb = Math.round(buffer.length / 1024);
  console.log(`\u2705  HAY-M_BusinessPlan_Final.docx saved (${kb} KB)`);
}).catch(err => {
  console.error('\u274C ', err);
  process.exit(1);
});
