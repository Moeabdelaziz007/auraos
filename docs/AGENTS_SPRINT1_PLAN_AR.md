# خطة منظَّمة لوكيل الـIDE — Sprint 1 (Balanced Path)

هذه الوثيقة تُعرِّف هيكل المونو-ريبو، الوكلاء (Agents)، ومسارات العمل المقترحة كسلسلة من مهام صغيرة (commits/PRs) قابلة للتنفيذ تلقائيًا.

## 0) هيكل المونو-ريبو (Scaffold)

- الجذور:
  - apps/ — تطبيقات الوكلاء (core, synapse, vault, chronos, atlas)
  - packages/common — كود مشترك (stores, services, components)
  - services/ — Cloud Functions/Endpoints (synapseSummarize, chronosCreateEvent)
  - infra/ — قواعد وأدوات البنية (firestore.rules)
  - .github/workflows/ci.yml — CI بسيط (install + type-check + build)

قد تم إنشاء العناصر الأولية التالية:
- apps/core: صفحات Login/Profile + auth service (placeholder)
- packages/common: متجر إعدادات (Zustand) + barrel export
- infra/firestore.rules: قواعد Firestore مبدئية (مغلقة)
- .github/workflows/ci.yml: بناء أساسي

ملاحظة: تم تفعيل npm workspaces في package.json على مستوى الجذر.

## 1) تعريف الـ5 Agents (الغرض + ميزات Sprint 1 + تفاعلات)

1. Core — System Agent
   - الغرض: إعدادات النظام، auth، theming، preferences.
   - Sprint 1:
     - Auth skeleton (Firebase Auth)
     - Theme/Preferences Store (Zustand) في packages/common
     - CI + env.example بدون أسرار

2. Synapse — Knowledge Agent
   - الغرض: second-brain للملاحظات والملخّصات.
   - Sprint 1:
     - Notes editor + autosave
     - Firestore CRUD
     - Summarize (Cloud Function)

3. Vault — Data Agent
   - الغرض: خزنة الملفات.
   - Sprint 1:
     - Upload/Download (Firebase Storage)
     - Metadata (Firestore)
     - PDF/Image preview

4. Chronos — Time Agent
   - الغرض: تقويم ذكي وتنبيهات.
   - Sprint 1:
     - Calendar UI
     - Create event API + إشعارات (Service Worker)
     - from-action endpoint (تكامل مع Synapse)

5. Atlas — Travel Agent
   - الغرض: إدارة الرحلات والتذاكر.
   - Sprint 1:
     - Trip editor + attach-ticket → Vault
     - Add to Chronos
     - Trip summary via Synapse

## 2) قائمة مهام PRs صغيرة (To-Do)

A) Core (ابدأ هنا)
- chore(core): repo scaffold + monorepo setup
- feat(core): Auth skeleton (Firebase Auth)
- feat(core): Settings UI (Theme + Preferences)
- chore(core): CI template + env.example

B) Synapse
- feat(synapse): app skeleton + editor page
- feat(synapse): persistence layer (Firestore CRUD)
- feat(synapse): local cache (IndexedDB) + sync job
- feat(synapse): summarize endpoint (Cloud Function)
- feat(synapse): connect to Vault attachments

C) Vault
- feat(vault): app skeleton + file browser UI
- feat(vault): upload API (Firebase Storage)
- feat(vault): metadata indexing (Firestore)
- feat(vault): preview component
- feat(vault): link-to-note flow

D) Chronos
- feat(chronos): app skeleton + calendar UI
- feat(chronos): create-event API + local alarms
- feat(chronos): connect with Synapse actions
- feat(chronos): notifications integration
- chore(chronos): timezone & working hours from Core

E) Atlas
- feat(atlas): app skeleton + trip editor
- feat(atlas): attach-ticket flow → Vault
- feat(atlas): add-to-calendar action
- feat(atlas): trip summary generator (Synapse)
- feat(atlas): locale & currency read from Core

## 3) قواعد تسمية وبنية الملفات

- Apps في apps/<agent> (kebab-case)
- Components: PascalCase داخل src/components
- Hooks: useSomething.ts
- Services: src/services/<agent>-service.ts أو packages/common/services/<shared>.ts
- Endpoints: REST POST /api/<agent>/<action>

هيكل مرجعي:
/
├─ apps/
│  ├─ core/
│  ├─ synapse/
│  ├─ vault/
│  ├─ chronos/
│  └─ atlas/
├─ packages/common/
│  └─ src/{stores,services,components}
├─ services/{synapseSummarize,chronosCreateEvent}
├─ infra/firestore.rules
├─ .github/workflows/ci.yml
└─ docs/

## 4) نقاط التكامل والبيئة

- Firebase: Auth + Firestore + Storage + Functions (لاحقًا)
- إدارة الأسرار: env.local / GitHub Secrets – لا أسرار في env.example
- متغيرات بيئة جاهزة في env.example (قيم placeholder فقط)

## 5) Checkpoints Sprint 1

- Core scaffolding + CI يعمل
- Synapse: إنشاء/حفظ/تلخيص ملاحظة end-to-end
- Vault: رفع ملف + حفظ metadata + preview
- Chronos: إنشاء تذكير من Synapse يظهر في Calendar + إشعار
- Atlas: إنشاء رحلة، رفع تذكرة، حدث في Chronos، وملخّص في Synapse

## 6) الخطوة التالية

- إكمال placeholders للخدمات في services/
- إضافة تطبيقات بقية الوكلاء (skeletons) تباعًا
- ربط Core settings عبر packages/common في كل Agent
