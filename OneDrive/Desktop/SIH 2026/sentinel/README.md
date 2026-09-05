# SENTINEL - AI-Driven Multi-Vendor Network Security Compliance Auditor

**Problem Statement ID**: SIH26155  
**Hackathon**: Smart India Hackathon (SIH) 2026  

## Project Overview
SENTINEL is an automated, lightweight security auditing platform designed to parse multi-vendor infrastructure configurations (Cisco Routers, Fortinet Firewalls, and Linux Servers), normalize them into a uniform schema, audit them against deterministic compliance policies, evaluate risk severity, generate clear AI explanations, and present findings in an actionable SOC Dashboard with DevSecOps CI/CD security gate integrations.

## Architecture & Workflow

```text
Configuration Input
    └── Vendor Parsing
          └── Schema Normalization
                └── Security Compliance Rules
                      └── Risk Severity Evaluation
                            └── AI Finding Explanation
                                  ├── SOC Dashboard
                                  └── DevSecOps CI/CD Security Gate
```

## Directory Structure
```text
sentinel/
├── frontend/             # React + Vite + Tailwind UI
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Dashboard and views
│       ├── services/     # API integration services
│       └── types/        # TypeScript interfaces
├── backend/              # FastAPI + Python service
│   ├── app/
│   │   ├── api/          # REST API endpoints
│   │   ├── scanner/      # Infrastructure configuration ingestion & scanning
│   │   ├── normalizers/  # Vendor-specific parsers & standard normalization
│   │   ├── compliance/   # Deterministic security rule engine & policy checks
│   │   ├── models/       # Data structures & schemas
│   │   ├── services/     # Core domain logic & AI integration service
│   │   └── utils/        # Helper utilities
│   └── tests/            # Automated test suite
├── configs/              # Sample raw vendor configuration files
├── policies/             # Deterministic compliance rule definitions (JSON/YAML)
├── .github/              # GitHub Actions workflows / CI configuration
├── docs/                 # Documentation and architecture diagrams
├── README.md             # Project README
├── .env.example          # Environment variables template
└── .gitignore            # Git ignore file
```
