# Regulatory Perimeter Analysis
## HAY-M Limited — FCA Regulatory Sandbox Application

**Document version:** 1.0  
**Date:** April 2026  
**Prepared by:** HAY-M Limited  
**Classification:** Confidential — FCA Submission

---

## 1. Executive Summary

HAY-M Limited ("the Firm") operates a mobile and web-based micro-savings and investment tracking platform targeted at UK retail consumers. This document sets out the Firm's analysis of the regulatory perimeter as it applies to its current and proposed activities under UK financial services legislation, and identifies the specific areas of regulatory uncertainty that make participation in the FCA Regulatory Sandbox appropriate.

The Firm's primary regulated activities relate to:
- The facilitation of automated micro-savings through transaction round-ups (payment services)
- The holding of user funds within a savings wallet (e-money issuance)
- The provision of investment portfolio tracking tools (currently non-advised, non-execution)

The Firm does not currently execute investment trades, provide regulated financial advice, or manage client assets.

---

## 2. Company Overview

| Field | Detail |
|-------|--------|
| Company name | HAY-M Limited |
| Registered address | 63 Finsbury Square, London EC11 1AA |
| Business model | B2C fintech — micro-savings, round-ups, investment tracking |
| Target market | UK retail consumers aged 18–35, particularly those with limited disposable income |
| Platform | iOS mobile app (React Native / Expo), web application (React) |
| Backend | Node.js / Express / MongoDB, hosted on Render |
| Current status | MVP — closed beta testing |
| FCA registration | Not yet registered — sandbox application pending |

---

## 3. Description of Business Activities

### 3.1 Round-Up Micro-Savings

**How it works:**  
When a user makes a purchase using a linked payment card, HAY-M rounds the transaction up to the nearest pound and automatically transfers the difference into the user's HAY-M savings wallet. For example, a £3.60 coffee purchase triggers a £0.40 round-up deposit.

**Regulatory characterisation:**  
This activity involves the movement of funds on behalf of users and constitutes a **payment service** within the meaning of the Payment Services Regulations 2017 (PSR 2017), Schedule 1. Specifically:

- **Money remittance** (Schedule 1, Part 2, paragraph 6) — transferring funds from a user's linked account to their HAY-M wallet
- Potentially **account information services (AIS)** (Schedule 1, Part 2, paragraph 8) — if the Firm accesses linked bank account data to calculate round-ups

The Firm will be required to hold either:
- **Authorisation as a Payment Institution (PI)** under Regulation 6 of the PSR 2017; or
- **Registration as a Small Payment Institution (SPI)** if monthly payment volumes remain below €3 million

### 3.2 Savings Wallet / Fund Holding

**How it works:**  
Accumulated round-up savings are held in a user's in-app wallet balance. Users can view their balance, set savings goals, and withdraw funds to a linked debit card.

**Regulatory characterisation:**  
The holding of user funds against which electronic monetary value is issued constitutes **e-money issuance** within the meaning of the Electronic Money Regulations 2011 (EMR 2011), Regulation 2.

The Firm will be required to hold either:
- **Authorisation as an Electronic Money Institution (EMI)** under Regulation 9 of the EMR 2011; or
- **Registration as a Small Electronic Money Institution (Small EMI)** if average outstanding e-money does not exceed €5 million

**Safeguarding obligation:**  
Under Regulation 20 of the EMR 2011, the Firm must safeguard funds received in exchange for e-money by either:
- Segregating funds in a designated safeguarding account with an authorised credit institution; or
- Covering funds with an insurance policy or comparable guarantee

### 3.3 Investment Portfolio Tracking

**How it works:**  
Users can manually log investment holdings (stocks, ETFs, crypto) and track their portfolio value, gain/loss, and historical performance. The platform displays indicative prices and does not execute trades or provide personalised investment recommendations.

**Regulatory characterisation:**  
In its current form, portfolio tracking is a **data and information tool only** and does not fall within the regulated activities set out in the Financial Services and Markets Act 2000 (Regulated Activities) Order 2001 (RAO).

Specifically, the Firm does not:
- Execute or arrange deals in investments (RAO Article 21 / 25)
- Manage investments on a discretionary basis (RAO Article 37)
- Provide investment advice (RAO Article 53)
- Operate a collective investment scheme (RAO Article 51ZA)

**Future risk:** If the Firm introduces automated portfolio rebalancing, trade execution, or personalised investment recommendations, it will require appropriate MiFID II permissions under FSMA 2000 and the FCA's Investment Firms Prudential Regime (IFPR) may apply.

### 3.4 Savings Goals

**How it works:**  
Users set named savings goals (e.g. "Holiday Fund", "Emergency Pot") with target amounts and target dates. The platform tracks progress and provides visual dashboards. No external investment of goal funds occurs.

**Regulatory characterisation:**  
Goal-based savings tracking is a non-regulated information and organisation tool. No regulated activity is performed. This activity is analogous to a budgeting tool and falls outside the RAO perimeter.

---

## 4. Identified Regulatory Uncertainties

The following areas of genuine regulatory uncertainty support the Firm's application for sandbox participation:

### 4.1 Round-Up Consent and PSD2 Strong Customer Authentication (SCA)

**Uncertainty:** It is unclear whether recurring, automated round-up transactions — which vary in amount per transaction — require individual SCA each time, or whether a single upfront consent framework (combined with transaction monitoring) satisfies Regulation 100 of the PSR 2017. Existing guidance on SCA exemptions (low-value, recurring) does not squarely address variable micro-amount automated sweeps.

**Sandbox objective:** Test whether the Firm's consent framework and SCA implementation is compliant with FCA expectations before scaling to a larger user base.

### 4.2 E-Money Threshold Monitoring

**Uncertainty:** The Firm anticipates it will operate below the Small EMI threshold (€5M average outstanding e-money) during early growth. However, the rate of user growth may take the Firm above this threshold within 12–18 months of launch. The Firm seeks clarity on the FCA's expectations around pre-emptive threshold monitoring and the timeline for transitioning from Small EMI to full EMI authorisation without service interruption.

**Sandbox objective:** Establish a compliant threshold-monitoring regime and a tested transition plan under FCA supervision.

### 4.3 Open Banking Data Usage and GDPR Interaction

**Uncertainty:** The Firm intends to access users' bank transaction data via open banking APIs (under PSD2 Account Information Services) to automate round-up calculations. The intersection of AIS licensing requirements, data minimisation obligations under UK GDPR (UK GDPR Article 5(1)(c)), and the requirement to obtain explicit consent for financial data processing creates a complex compliance matrix that the Firm wishes to validate under sandbox conditions.

**Sandbox objective:** Test the full user consent journey and data processing architecture with real users to confirm compliance with both PSR 2017 and UK GDPR before scale.

### 4.4 Consumer Duty Application to Automated Savings

**Uncertainty:** The FCA's Consumer Duty (PS22/9, effective July 2023) introduces a higher standard of consumer protection, including requirements around consumer understanding and consumer support. The Firm seeks guidance on how the Consumer Duty applies to automated savings products where the user has consented to recurring automated transfers, and specifically how to evidence "good outcomes" for users who may not actively monitor their wallet balance.

**Sandbox objective:** Develop and test a Consumer Duty-compliant customer journey, including in-app transparency disclosures, balance alerts, and outcome monitoring methodology.

---

## 5. Activities Outside the Regulatory Perimeter

The following activities performed by the Firm do not constitute regulated activities under FSMA 2000 or the PSR 2017 and are included for completeness:

| Activity | Reason outside perimeter |
|----------|--------------------------|
| Portfolio price display | Information service only; no advice or execution |
| Savings goal creation | Budgeting tool; no investment of funds |
| Transaction history display | Information aggregation; AIS only if linked to bank accounts |
| Push notifications | Communication tool; not a financial promotion if content is factual |
| User authentication & security | Operational; not a regulated activity |

---

## 6. Proposed Sandbox Test Parameters

| Parameter | Proposed value |
|-----------|---------------|
| Test duration | 6 months |
| Maximum users | 2,000 UK retail consumers |
| Maximum wallet balance per user | £500 |
| Maximum monthly round-up per user | £50 |
| Geographic scope | United Kingdom only |
| Safeguarding method | Segregated account at [Barclays / ClearBank — to be confirmed] |
| Reporting frequency | Monthly to FCA Innovation Hub |
| Exit condition | Full Small EMI registration or wind-down within 30 days of sandbox end |

---

## 7. Authorisation Roadmap

| Milestone | Target date |
|-----------|-------------|
| FCA Innovation Pathways meeting | Q2 2026 |
| Sandbox application submitted | Q3 2026 |
| Sandbox period (if approved) | Q4 2026 – Q1 2027 |
| Small EMI / Small PI registration | Q2 2027 |
| Full EMI authorisation (if thresholds exceeded) | Q4 2027 |

---

## 8. Legal and Regulatory Framework Reference

| Legislation | Relevance |
|-------------|-----------|
| Financial Services and Markets Act 2000 (FSMA) | Overarching regulatory framework |
| Regulated Activities Order 2001 (SI 2001/544) | Defines regulated activities |
| Payment Services Regulations 2017 (SI 2017/752) | Payment services authorisation |
| Electronic Money Regulations 2011 (SI 2011/99) | E-money issuance authorisation |
| UK General Data Protection Regulation (UK GDPR) | Data processing obligations |
| FCA Consumer Duty (PS22/9) | Consumer outcome requirements |
| FCA Approach to Authorisation (2021) | Authorisation standards |
| FCA Regulatory Sandbox Terms and Conditions | Sandbox participation obligations |

---

## 9. Declaration

The information provided in this document is accurate to the best of the Firm's knowledge and belief. The Firm acknowledges that participation in the FCA Regulatory Sandbox does not constitute FCA authorisation and that all sandbox conditions will be observed for the duration of the test period.

**Authorised signatory:** ___________________________  
**Name:** ___________________________  
**Title:** Director / CEO  
**Date:** ___________________________
