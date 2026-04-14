const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TableOfContents,
  ExternalHyperlink
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

function heading1(text, bookmark) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, color: NAVY, font: 'Arial' })]
  });
}
function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: '1C3D6E', font: 'Arial' })]
  });
}
function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: NAVY, font: 'Arial' })]
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial', ...opts })]
  });
}
function bullet(text, bold = false) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, color: DARK_TEXT, font: 'Arial', bold })]
  });
}
function spacer(n = 1) {
  return Array.from({ length: n }, () => new Paragraph({ children: [new TextRun('')], spacing: { after: 80 } }));
}

// ── Feature matrix table ─────────────────────────────────────────────────────
function featureTable() {
  const headerBg = NAVY;
  const rows = [
    ['Feature', 'Free', 'Plus', 'Pro'],
    ['Dashboard & Overview', 'Yes', 'Yes', 'Yes'],
    ['Savings Goals (max)', '1 goal', 'Unlimited', 'Unlimited'],
    ['Digital Wallet (cards + banks)', 'Yes', 'Yes', 'Yes'],
    ['Transaction History & Filters', 'Yes', 'Yes', 'Yes'],
    ['Push Notifications (8 types)', 'Yes', 'Yes', 'Yes'],
    ['Investment Portfolio', 'No', 'Yes', 'Yes'],
    ['ISA Account', 'No', 'Yes', 'Yes'],
    ['Savings Tracker', 'Yes', 'Yes', 'Yes'],
    ['AI Auto-save Limits', 'No', 'No', 'Yes'],
    ['Advanced Insights', 'No', 'Yes', 'Yes'],
    ['Monthly Price (GBP)', 'Free', 'TBD', 'TBD'],
  ];
  const colWidths = [4000, 1700, 1700, 1700];
  return new Table({
    width: { size: 9100, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map((row, ri) =>
      new TableRow({
        tableHeader: ri === 0,
        children: row.map((cell, ci) =>
          new TableCell({
            borders,
            width: { size: colWidths[ci], type: WidthType.DXA },
            shading: ri === 0
              ? { fill: NAVY, type: ShadingType.CLEAR }
              : ci === 0 && ri % 2 === 0
              ? { fill: 'F8FAFC', type: ShadingType.CLEAR }
              : { fill: WHITE, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: ci > 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
              children: [new TextRun({
                text: cell,
                font: 'Arial',
                size: ri === 0 ? 20 : 20,
                bold: ri === 0 || ci === 0,
                color: ri === 0 ? WHITE : ci === 0 ? DARK_TEXT : cell === 'Yes' ? '059669' : cell === 'No' ? 'DC2626' : DARK_TEXT,
              })]
            })]
          })
        )
      })
    )
  });
}

// ── Architecture text diagram as monospace table ─────────────────────────────
function archDiagram() {
  const lines = [
    '┌─────────────────────────────────────────────────────────────────────┐',
    '│                          CLIENT TIER                                │',
    '│  ┌───────────────────────────┐    ┌──────────────────────────────┐  │',
    '│  │  React Native Expo App    │    │  React Web App (Vite SPA)    │  │',
    '│  │  iOS & Android            │    │  Browser                     │  │',
    '│  │  AsyncStorage + Socket.IO │    │  sessionStorage + Socket.IO  │  │',
    '│  └────────────┬──────────────┘    └──────────────┬───────────────┘  │',
    '└───────────────┼─────────────────────────────────┼────────────────────┘',
    '                │   HTTPS / WSS (JWT Bearer)       │                    ',
    '┌───────────────▼─────────────────────────────────▼────────────────────┐',
    '│                        APPLICATION TIER                              │',
    '│  ┌────────────────────────────────────────────────────────────────┐  │',
    '│  │              Node.js / Express REST API                        │  │',
    '│  │  /api/auth  /api/goals  /api/wallet  /api/portfolio            │  │',
    '│  │  /api/dashboard  /api/transactions  /api/savings-tracker       │  │',
    '│  │  /api/notifications     Socket.IO real-time layer              │  │',
    '│  └──────────────────────────┬─────────────────────────────────── ┘  │',
    '└─────────────────────────────┼─────────────────────────────────────── ┘',
    '                              │   Mongoose ODM                         ',
    '┌─────────────────────────────▼──────────────────────────────────────── ┐',
    '│                          DATA TIER                                    │',
    '│             MongoDB Atlas (Cloud Database)                            │',
    '│   Users │ Goals │ Transactions │ Cards │ Portfolio │ Notifications    │',
    '└───────────────────────────────────────────────────────────────────────┘',
  ];
  return new Table({
    width: { size: 9100, type: WidthType.DXA },
    columnWidths: [9100],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      shading: { fill: '0F172A', type: ShadingType.CLEAR },
      width: { size: 9100, type: WidthType.DXA },
      margins: { top: 120, bottom: 120, left: 180, right: 180 },
      children: lines.map(l => new Paragraph({
        children: [new TextRun({ text: l, font: 'Courier New', size: 16, color: '00D4A1' })]
      }))
    })]})],
  });
}

// ── API endpoints table ───────────────────────────────────────────────────────
function apiTable(rows) {
  const colWidths = [2200, 1600, 5300];
  return new Table({
    width: { size: 9100, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        tableHeader: true,
        children: ['Method', 'Endpoint', 'Description'].map((h, ci) =>
          new TableCell({
            borders, width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: '1C3D6E', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
          })
        )
      }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((cell, ci) =>
          new TableCell({
            borders, width: { size: colWidths[ci], type: WidthType.DXA },
            shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({
              text: cell,
              size: 20,
              font: ci === 0 ? 'Courier New' : 'Arial',
              color: ci === 0 ? '0369A1' : DARK_TEXT,
              bold: ci === 0,
            })] })]
          })
        )
      }))
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
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
    // ── COVER PAGE ───────────────────────────────────────────────────────────
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 1440, left: 0 } }
      },
      children: [
        // Navy header bar
        new Table({
          width: { size: 12240, type: WidthType.DXA },
          columnWidths: [12240],
          rows: [new TableRow({ children: [new TableCell({
            borders: noBorders,
            shading: { fill: NAVY, type: ShadingType.CLEAR },
            width: { size: 12240, type: WidthType.DXA },
            margins: { top: 2000, bottom: 2000, left: 1440, right: 1440 },
            children: [
              new Paragraph({ alignment: AlignmentType.LEFT, children: [
                new TextRun({ text: 'HAY-M', font: 'Arial', size: 80, bold: true, color: MINT })
              ]}),
              new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 200 }, children: [
                new TextRun({ text: 'High Level Design Document', font: 'Arial', size: 40, color: WHITE })
              ]}),
            ]
          })]})],
        }),
        new Paragraph({ spacing: { before: 800 }, children: [new TextRun('')] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 120 }, children: [
          new TextRun({ text: 'Version 1.0', font: 'Arial', size: 28, color: MID_GREY })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
          new TextRun({ text: 'April 2026', font: 'Arial', size: 28, color: MID_GREY })
        ]}),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [
          new TextRun({ text: 'CONFIDENTIAL', font: 'Arial', size: 22, bold: true, color: 'DC2626' })
        ]}),
        ...spacer(4),
        new Table({
          width: { size: 7000, type: WidthType.DXA },
          columnWidths: [3000, 4000],
          rows: [
            [['Document Type', 'High Level Design (HLD)'], ['Status', 'Draft'], ['Platform', 'Web + Mobile (iOS/Android)'], ['Tech Stack', 'React Native, React, Node.js, MongoDB']].map(([l, v]) =>
              new TableRow({ children: [
                new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: LIGHT_BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: l, bold: true, size: 20, color: NAVY, font: 'Arial' })] })] }),
                new TableCell({ borders, width: { size: 4000, type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                  children: [new Paragraph({ children: [new TextRun({ text: v, size: 20, color: DARK_TEXT, font: 'Arial' })] })] }),
              ]})
            )
          ].flat(),
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ]
    },

    // ── MAIN CONTENT ─────────────────────────────────────────────────────────
    {
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({ children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
          children: [
            new TextRun({ text: 'HAY-M — High Level Design Document', font: 'Arial', size: 18, color: MID_GREY }),
            new TextRun({ text: '  |  Confidential  |  v1.0', font: 'Arial', size: 18, color: MID_GREY }),
          ]
        })] })
      },
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MINT } },
          children: [
            new TextRun({ text: 'Page ', font: 'Arial', size: 18, color: MID_GREY }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: MID_GREY }),
            new TextRun({ text: ' of ', font: 'Arial', size: 18, color: MID_GREY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 18, color: MID_GREY }),
          ]
        })] })
      },
      children: [
        // TOC
        heading1('Table of Contents'),
        new TableOfContents('Table of Contents', { hyperlink: true, headingStyleRange: '1-2' }),
        new Paragraph({ children: [new PageBreak()] }),

        // 1. Executive Summary
        heading1('1. Executive Summary'),
        body('HAY-M is a UK-based micro-savings and investment platform delivered as both a React Native mobile app (iOS & Android) and a React web application. It enables users to:'),
        bullet('Save automatically with round-ups and manual deposits'),
        bullet('Set and track savings goals with visual progress'),
        bullet('Invest from £1 in stocks, ETFs, crypto, and bonds'),
        bullet('Manage a digital wallet with real debit cards and linked bank accounts'),
        bullet('Receive real-time push notifications for milestones and transactions'),
        bullet('View an investment portfolio with live performance metrics'),
        ...spacer(1),
        body('The platform operates on a tiered subscription model (Free, Plus, Pro) with plan-based feature gating enforced on both client and server. All monetary values are denominated in GBP (£) with en-GB locale formatting.'),

        // 2. System Overview
        new Paragraph({ children: [new PageBreak()] }),
        heading1('2. System Overview'),
        heading2('2.1 Platform Architecture'),
        body('HAY-M uses a classic three-tier architecture:'),
        bullet('Client Tier: React Native Expo (mobile) + React/Vite SPA (web)'),
        bullet('Application Tier: Node.js/Express REST API + Socket.IO real-time server'),
        bullet('Data Tier: MongoDB Atlas (managed cloud database)'),
        ...spacer(1),
        body('Deployment targets:', { bold: true }),
        bullet('Backend: Render.com Node.js service — https://hay-m-backend.onrender.com'),
        bullet('Website: Vite SPA served via CDN / static hosting'),
        bullet('Mobile: Expo EAS Build pipeline — Apple App Store + Google Play Store'),

        heading2('2.2 Architecture Diagram'),
        ...spacer(1),
        archDiagram(),
        ...spacer(1),

        // 3. Key Components
        new Paragraph({ children: [new PageBreak()] }),
        heading1('3. Key Components'),

        heading2('3.1 Mobile Application'),
        body('Technology: React Native 0.83.4 with Expo SDK 55, targeting iOS and Android.'),
        heading3('Screens'),
        body('Auth flow: Splash, Login, Signup, Onboarding (4-slide animated carousel)'),
        body('Main tabs: Dashboard, Portfolio, SavingGoals, Payments, More'),
        body('Additional: Wallet, SavingsTracker, Notifications, Profile, Insights, ISA, Fees, Investment, Upgrade, MoreMenu'),
        heading3('Navigation Architecture'),
        bullet('AppNavigator — Root navigator; checks AsyncStorage for auth state and onboarding flag'),
        bullet('TabNavigator — 5-tab bottom bar (Dashboard, Portfolio, Goals, Payments, More)'),
        bullet('InvestStackNavigator — Stack within Portfolio tab'),
        bullet('MoreStackNavigator — Stack within More tab'),
        heading3('Service Layer'),
        bullet('api.js — Axios instance, base URL: https://hay-m-backend.onrender.com/api, 30s timeout, JWT interceptor'),
        bullet('authService.js — login, signup, logout, getMe, updateProfile'),
        bullet('goalService.js — CRUD + addFunds'),
        bullet('walletService.js — getCards, addCard, topUp, freeze, delete'),
        bullet('transactionService.js — getTransactions (with filters), sendMoney'),
        bullet('portfolioService.js — getPortfolio, addHolding, updatePrices, removeHolding'),
        bullet('savingsTrackerService.js — getTracker, updateLimits, addSurplus, addRoundUp'),
        bullet('dashboardService.js — getDashboard'),
        bullet('socketService.js — Socket.IO client for real-time events'),

        heading2('3.2 Web Application'),
        body('Technology: React 18.3.1 with Vite 5.3.1 build tool and React Router DOM 6.24.1.'),
        heading3('Pages (27 total)'),
        bullet('Public: Landing, Login, Signup, ForgotPassword, ResetPassword, Privacy, Terms, Contact'),
        bullet('Onboarding: 5-step wizard (Welcome, Goals, Invest, Plan Selection, Complete)'),
        bullet('Authenticated: Dashboard, Wallet, Portfolio, Goals, Transactions, SavingsTracker, Notifications, Settings, Insights, ISA, Fees, Investment, Upgrade'),
        heading3('Components'),
        bullet('Layout.jsx — Sidebar navigation (12 items + Settings) + top header with bell and avatar'),
        bullet('PublicNavbar.jsx — Navigation bar for unauthenticated pages'),
        bullet('HaymLogo.jsx — Reusable brand logo component'),
        heading3('Auth Storage'),
        bullet('JWT token: sessionStorage key haym_web_token'),
        bullet('User object: localStorage key haym_web_user (persists across tabs/refresh)'),
        bullet('Onboarding flag: localStorage key hasOnboarded'),

        heading2('3.3 Backend API'),
        body('Technology: Node.js with Express.js framework, Mongoose ODM, MongoDB Atlas.'),
        heading3('Rate Limiting'),
        bullet('authLimiter: 20 requests per 15 minutes (auth endpoints)'),
        bullet('apiLimiter: 100 requests per minute (all other API endpoints)'),
        heading3('Middleware'),
        bullet('protect — JWT validation; attaches req.user; returns 401 on invalid/missing token'),
        bullet('requirePlan(plan) — plan-based access control; returns 403 if user plan rank is insufficient'),
        heading3('Route Modules (8 total)'),
        bullet('/api/auth — Authentication, password reset, profile management'),
        bullet('/api/dashboard — Aggregated dashboard data'),
        bullet('/api/goals — Savings goals CRUD + fund contributions'),
        bullet('/api/transactions — Transaction history with advanced filters + send money'),
        bullet('/api/portfolio — Investment holdings management (Plus/Pro)'),
        bullet('/api/wallet — Card and bank account management'),
        bullet('/api/savings-tracker — Micro-savings tracking, round-ups, limits'),
        bullet('/api/notifications — Notification history, push tokens, preferences'),

        heading2('3.4 Real-time Layer (Socket.IO)'),
        bullet('Server: Socket.IO co-hosted on the same Express HTTP server'),
        bullet('Client: socket.io-client integrated into both mobile (socketService.js) and web'),
        bullet('Rooms: each authenticated user joins a room identified by their userId'),
        bullet('Use cases: transaction alerts, goal milestone events, portfolio price updates'),

        heading2('3.5 Push Notifications'),
        bullet('Device tokens registered via expo-notifications → stored in User.pushToken'),
        bullet('pushService.js persists every notification to the Notification MongoDB collection'),
        bullet('If pushToken is present, notification is also sent via Expo Push API'),
        bullet('Endpoint: https://exp.host/--/api/v2/push/send'),
        bullet('8 user-configurable preference toggles (goal_done, goal_50, invest_10, invest_25, weekly, monthly, auto_save, large_tx)'),

        // 4. Subscription Tiers
        new Paragraph({ children: [new PageBreak()] }),
        heading1('4. Subscription Tiers & Feature Matrix'),
        ...spacer(1),
        featureTable(),
        ...spacer(1),
        body('Plan enforcement is implemented server-side via the requirePlan middleware using a numeric rank system (free=0, plus=1, pro=2). Client-side UI also adapts based on the user.plan field returned from the API.'),

        // 5. Security
        new Paragraph({ children: [new PageBreak()] }),
        heading1('5. Security Architecture'),
        heading2('5.1 Authentication'),
        bullet('JWT tokens (HS256 algorithm) signed with JWT_SECRET environment variable'),
        bullet('Tokens stored in AsyncStorage (mobile) or sessionStorage (web) — never in cookies'),
        bullet('All protected routes validate token on every request via protect middleware'),
        heading2('5.2 Password Security'),
        bullet('Passwords hashed with bcryptjs at 12 salt rounds before storage'),
        bullet('Password field excluded from all API responses via Mongoose toJSON override'),
        bullet('Password reset: crypto.randomBytes(32) generates a 64-char hex token'),
        bullet('Reset tokens stored hashed on User model with 1-hour expiry (resetTokenExpires)'),
        heading2('5.3 Transport & API Security'),
        bullet('All traffic over HTTPS/WSS in production'),
        bullet('CORS whitelist: localhost:3000, localhost:5173, localhost:8081 + configurable via env'),
        bullet('Rate limiting: auth routes 20 req/15 min; API routes 100 req/min'),
        bullet('Plan-based access enforced server-side (client checks are UX only)'),

        // 6. Data Flow
        new Paragraph({ children: [new PageBreak()] }),
        heading1('6. Data Flow Overview'),
        body('The standard request/response cycle for an authenticated user:'),
        ...['User authenticates (POST /api/auth/login) → JWT issued → stored client-side',
          'Subsequent API requests attach Bearer token via Axios request interceptor',
          'Backend protect middleware validates JWT → attaches decoded user to req.user',
          'Controller executes business logic → queries MongoDB via Mongoose model',
          'Response returned as JSON; errors standardised with message field',
          'Real-time events emitted to the user\'s Socket.IO room (e.g. new transaction)',
          'Push notification: pushService saves to Notification collection + calls Expo API if token exists',
        ].map((t, i) => new Paragraph({
          numbering: { reference: 'numbers', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: t, size: 22, color: DARK_TEXT, font: 'Arial' })]
        })),

        // 7. Non-Functional Requirements
        new Paragraph({ children: [new PageBreak()] }),
        heading1('7. Non-Functional Requirements'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA },
          columnWidths: [2200, 6900],
          rows: [
            new TableRow({ tableHeader: true, children: ['Requirement', 'Detail'].map((h, ci) =>
              new TableCell({ borders, width: { size: ci === 0 ? 2200 : 6900, type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['Availability', 'Backend on Render.com free tier; cold-start latency handled with 30s timeout and graceful fallback to cached user in AuthContext'],
              ['Performance', 'API rate limiting prevents abuse; MongoDB queries indexed on user + createdAt for efficient pagination'],
              ['Scalability', 'Stateless REST API supports horizontal scaling; MongoDB Atlas scales independently; Socket.IO can be fronted by Redis adapter'],
              ['Security', 'JWT + bcrypt + rate limiting + CORS + plan enforcement (see Section 5)'],
              ['Localisation', 'GBP (£) currency and en-GB locale throughout all formatters on both platforms'],
              ['Accessibility', 'React Native Accessibility API on mobile; semantic HTML and ARIA attributes on web'],
              ['Testability', 'Unit tests for all services (Jest + React Testing Library); Vitest for website'],
            ].map(([req, detail], ri) => new TableRow({ children: [
              new TableCell({ borders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: req, bold: true, size: 20, color: NAVY, font: 'Arial' })] })] }),
              new TableCell({ borders, width: { size: 6900, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: detail, size: 20, color: DARK_TEXT, font: 'Arial' })] })] }),
            ]}))
          ]
        }),

        // 8. Technology Stack
        new Paragraph({ children: [new PageBreak()] }),
        heading1('8. Technology Stack Summary'),
        ...spacer(1),
        new Table({
          width: { size: 9100, type: WidthType.DXA },
          columnWidths: [2200, 3000, 3900],
          rows: [
            new TableRow({ tableHeader: true, children: ['Layer', 'Technology', 'Version / Notes'].map((h, ci) =>
              new TableCell({ borders, width: { size: [2200,3000,3900][ci], type: WidthType.DXA },
                shading: { fill: NAVY, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, color: WHITE, font: 'Arial' })] })]
              })
            )}),
            ...[
              ['Mobile App', 'React Native + Expo', 'RN 0.83.4 / Expo SDK 55'],
              ['Mobile App', 'React Navigation', 'v6 (Stack + Bottom Tabs)'],
              ['Mobile App', 'Expo Linear Gradient', 'SDK 55'],
              ['Mobile App', 'AsyncStorage', 'v2.2.0'],
              ['Website', 'React', 'v18.3.1'],
              ['Website', 'Vite', 'v5.3.1'],
              ['Website', 'React Router DOM', 'v6.24.1'],
              ['HTTP Client', 'Axios', 'v1.7.x (both platforms)'],
              ['Real-time', 'Socket.IO', 'v4.7.5 (client + server)'],
              ['Backend', 'Node.js + Express', 'Express v4.x'],
              ['Database', 'MongoDB + Mongoose', 'Atlas cloud, Mongoose ODM'],
              ['Auth', 'jsonwebtoken + bcryptjs', 'HS256 JWT, 12-round bcrypt'],
              ['Rate Limiting', 'express-rate-limit', 'v8.3.2'],
              ['Push Notifications', 'Expo Push API', 'https://exp.host/--/api/v2'],
              ['Testing (mobile)', 'Jest + jest-expo', 'React Testing Library'],
              ['Testing (web)', 'Vitest + jsdom', 'React Testing Library'],
            ].map(([layer, tech, notes], ri) => new TableRow({ children: [
              new TableCell({ borders, width: { size: 2200, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? LIGHT_BG : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: layer, size: 20, bold: true, color: NAVY, font: 'Arial' })] })] }),
              new TableCell({ borders, width: { size: 3000, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: tech, size: 20, color: DARK_TEXT, font: 'Arial' })] })] }),
              new TableCell({ borders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: ri % 2 === 0 ? WHITE : 'F8FAFC', type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: notes, size: 20, color: MID_GREY, font: 'Arial' })] })] }),
            ]}))
          ]
        }),
      ]
    }
  ],
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('D:/mobileapp/docs/HAY-M_HLD.docx', buf);
  console.log('HLD done');
}).catch(e => console.error('HLD error:', e.message));
