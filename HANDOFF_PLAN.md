# TradeWave Handoff Plan

This document explains how to hand off the project to other developers or contributors while keeping the original ownership and rights clear.

## 1. Canonical repository
Use TradeWave_WebApp as the main active repository.

Keep the legacy project notes under:
- docs/legacy/

This preserves the original concept, rules, planning, and feature docs without diluting the active app work.

## 2. Versioning policy
Use a simple version model:
- v0.1 — internal prototype / concept exploration
- v0.5 — beta build with core flows
- v0.9 — beta polish and launch preparation
- v1.0 — initial release or public launch

## 3. Branching model
Recommended:
- main — the production-ready branch
- develop — integration branch for current work
- feature/* — feature branches
- hotfix/* — urgent fixes

## 4. Handoff package contents
A new contributor should receive:
- README.md
- DEPLOYMENT_GUIDE.md
- LICENSE
- OWNERSHIP.md
- COMMERCIAL_USE_AGREEMENT.md
- CONTRIBUTING.md
- ROADMAP.md
- FINISH_CHECKLIST.md
- architecture summary
- list of pending issues and known bugs
- deployment secrets flow (without exposing actual secret values)

## 5. Ownership and permissions language
The handoff package should clearly state:
- This project belongs to Wayacreate Studios / Waya Steurbaut.
- Commercial use requires written permission from the owner.
- Contact: steurbautwaya703@gmail.com

## 6. Contributor onboarding sequence
1. Read LICENSE, OWNERSHIP.md, and COMMERCIAL_USE_AGREEMENT.md.
2. Review README and deployment guide.
3. Run the backend and frontend locally.
4. Check open issues and roadmap.
5. Pick a small, clearly scoped task.
6. Submit a PR with documentation and testing.

## 7. Good continuation policy
A contributor should only continue work after understanding:
- the app is a beta project
- the repo is canonical
- ownership and commercial restrictions remain in force
- the project is not free to sell without permission

This is the simplest way to keep continuity without losing the original creator’s control.
