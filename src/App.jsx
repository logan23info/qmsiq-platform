import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProgrammeProvider } from './context/ProgrammeContext'
import { TeamProvider } from './context/TeamContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Breadcrumb from './components/Breadcrumb'
import AuthPage from './pages/AuthPage'
import OnboardingModal from './components/OnboardingModal'

const lazy_ = (fn) => {
  const C = lazy(fn)
  return (props) => (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-amber-audit border-t-transparent rounded-full animate-spin" /></div>}>
      <C {...props} />
    </Suspense>
  )
}

// Platform pages
const Dashboard = lazy_(() => import('./pages/Dashboard'))
const ComingSoon = lazy_(() => import('./pages/ComingSoon'))
const FAQ = lazy_(() => import('./pages/FAQ'))
const Wiki = lazy_(() => import('./pages/Wiki'))
const Profile = lazy_(() => import('./pages/Profile'))

// ISO 19011 — Audit Methodology
const Clause4 = lazy_(() => import('./pages/iso19011/Clause4'))
const Clause5 = lazy_(() => import('./pages/iso19011/Clause5'))
const Clause6Initiation = lazy_(() => import('./pages/iso19011/Clause6Initiation'))
const Clause6Preparation = lazy_(() => import('./pages/iso19011/Clause6Preparation'))
const TOD = lazy_(() => import('./pages/iso19011/TOD'))
const TOI = lazy_(() => import('./pages/iso19011/TOI'))
const TOE = lazy_(() => import('./pages/iso19011/TOE'))
const Findings = lazy_(() => import('./pages/iso19011/Findings'))
const Meetings = lazy_(() => import('./pages/iso19011/Meetings'))
const Clause65Reporting = lazy_(() => import('./pages/iso19011/Clause65Reporting'))
const Clause7 = lazy_(() => import('./pages/iso19011/Clause7'))
const AnnexA = lazy_(() => import('./pages/iso19011/AnnexA'))

// ISO 9000 — Terminology
const ISO9000 = lazy_(() => import('./pages/iso9000/ISO9000'))

// ISO 9001 — QMS
const QMSClause4 = lazy_(() => import('./pages/iso9001/Clause4'))
const ISO9001Clause5 = lazy_(() => import('./pages/iso9001/AllClauses').then(m => ({ default: m.ISO9001Clause5 })))
const ISO9001Clause6 = lazy_(() => import('./pages/iso9001/Clause6'))
const ISO9001Clause7 = lazy_(() => import('./pages/iso9001/AllClauses').then(m => ({ default: m.ISO9001Clause7 })))
const ISO9001Clause8 = lazy_(() => import('./pages/iso9001/AllClauses').then(m => ({ default: m.ISO9001Clause8 })))
const ISO9001Clause9 = lazy_(() => import('./pages/iso9001/AllClauses').then(m => ({ default: m.ISO9001Clause9 })))
const ISO9001Clause10 = lazy_(() => import('./pages/iso9001/AllClauses').then(m => ({ default: m.ISO9001Clause10 })))

// Surveillance & Audit Types
const SurveillanceAudit = lazy_(() => import('./pages/surveillance/SurveillanceAudit'))
const GapAnalysis = lazy_(() => import('./pages/fieldwork/GapAnalysis'))
const SupplierAudit = lazy_(() => import('./pages/fieldwork/SupplierAudit'))
const ProgrammesOverview = lazy_(() => import('./pages/ProgrammesOverview'))
const Team = lazy_(() => import('./pages/Team'))

// IMS
const IMSCrosswalk = lazy_(() => import('./pages/ims/AllPages').then(m => ({ default: m.IMSCrosswalk })))
const IMSWorksheets = lazy_(() => import('./pages/ims/AllPages').then(m => ({ default: m.IMSWorksheets })))

// Fieldwork
const PBCList = lazy_(() => import('./pages/fieldwork/PBCList'))
const FieldworkTracker = lazy_(() => import('./pages/fieldwork/FieldworkTracker'))
const FindingRegister = lazy_(() => import('./pages/fieldwork/FindingRegister'))
const WorkpaperIndex = lazy_(() => import('./pages/fieldwork/WorkpaperIndex'))
const WorkpaperLibrary = lazy_(() => import('./pages/fieldwork/WorkpaperLibrary'))

// Reporting
const ReportBuilder = lazy_(() => import('./pages/reporting/ReportBuilder'))
const ManagementReview = lazy_(() => import('./pages/reporting/ManagementReview'))
const KPIDashboard = lazy_(() => import('./pages/reporting/KPIDashboard'))
const CAPATracker = lazy_(() => import('./pages/reporting/CAPATracker'))
const AuditUniverseLive = lazy_(() => import('./pages/reporting/AuditUniverseLive'))
const RiskRegisterLive = lazy_(() => import('./pages/reporting/RiskRegisterLive'))

// QMS Implementation
const QMSLanding = lazy_(() => import('./pages/qms/QMSLanding'))
const ContextForm = lazy_(() => import('./pages/qms/ContextForm'))
const StakeholderRegister = lazy_(() => import('./pages/qms/StakeholderRegister'))
const QualityPolicy = lazy_(() => import('./pages/qms/QualityPolicy'))
const ObjectivesRegister = lazy_(() => import('./pages/qms/ObjectivesRegister'))
const ChangeRegister = lazy_(() => import('./pages/qms/ChangeRegister'))
const CompetenceRegister = lazy_(() => import('./pages/qms/CompetenceRegister'))
const DocumentRegister = lazy_(() => import('./pages/qms/DocumentRegister'))
const OperationalPlanning = lazy_(() => import('./pages/qms/OperationalPlanning'))
const ConductLanding = lazy_(() => import('./pages/ConductLanding'))
const DesignDevelopment = lazy_(() => import('./pages/qms/DesignDevelopment'))
const AuditSchedule = lazy_(() => import('./pages/qms/AuditSchedule'))
const ContinualImprovement = lazy_(() => import('./pages/qms/ContinualImprovement'))
const ReviewLanding = lazy_(() => import('./pages/ReviewLanding'))

function AppShell() {
  const { user, loading, profile } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Show onboarding only once per browser — localStorage flag
  useEffect(() => {
    if (user && !localStorage.getItem('qmsiq-onboarded')) {
      setShowOnboarding(true)
    }
  }, [user])

  if (loading) return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-audit border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-steel-400 text-sm">Loading QMSiQ...</div>
      </div>
    </div>
  )

  if (!user) return <AuthPage />



  return (
    <ProgrammeProvider>
      <TeamProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-navy-950 flex">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header onMenuClick={() => setSidebarOpen(true)} />
            <Breadcrumb />
            {showOnboarding && <OnboardingModal onClose={() => { setShowOnboarding(false); localStorage.setItem('qmsiq-onboarded', '1') }} />}
            <main className="flex-1 p-4 sm:p-6 overflow-auto" id="main-content">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/wiki" element={<Wiki />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/profile" element={<Profile />} />

                {/* ISO 19011 */}
                <Route path="/iso19011" element={<Navigate to="/iso19011/clause4" replace />} />
                <Route path="/iso19011/clause4" element={<Clause4 />} />
                <Route path="/iso19011/clause5" element={<Clause5 />} />
                <Route path="/iso19011/clause6-initiation" element={<Clause6Initiation />} />
                <Route path="/iso19011/clause6-preparation" element={<Clause6Preparation />} />
                <Route path="/iso19011/tod" element={<TOD />} />
                <Route path="/iso19011/toi" element={<TOI />} />
                <Route path="/iso19011/toe" element={<TOE />} />
                <Route path="/iso19011/findings" element={<Findings />} />
                <Route path="/iso19011/meetings" element={<Meetings />} />
                <Route path="/iso19011/reporting" element={<Clause65Reporting />} />
                <Route path="/iso19011/clause7" element={<Clause7 />} />
                <Route path="/iso19011/annexa" element={<AnnexA />} />

                {/* ISO 9000 */}
                <Route path="/iso9000" element={<ISO9000 />} />

                {/* ISO 9001 */}
                <Route path="/iso9001" element={<Navigate to="/iso9001/clause4" replace />} />
                <Route path="/iso9001/clause4" element={<QMSClause4 />} />
                <Route path="/iso9001/clause5" element={<ISO9001Clause5 />} />
                <Route path="/iso9001/clause6" element={<ISO9001Clause6 />} />
                <Route path="/iso9001/clause7" element={<ISO9001Clause7 />} />
                <Route path="/iso9001/clause8" element={<ISO9001Clause8 />} />
                <Route path="/iso9001/clause9" element={<ISO9001Clause9 />} />
                <Route path="/iso9001/clause10" element={<ISO9001Clause10 />} />

                {/* Surveillance */}
                <Route path="/surveillance" element={<SurveillanceAudit />} />
                <Route path="/team" element={<Team />} />
                <Route path="/programmes" element={<ProgrammesOverview />} />

                {/* IMS */}
                <Route path="/ims" element={<Navigate to="/ims/crosswalk" replace />} />
                <Route path="/ims/crosswalk" element={<IMSCrosswalk />} />
                <Route path="/ims/worksheets" element={<IMSWorksheets />} />

                {/* Fieldwork */}
                <Route path="/fieldwork" element={<Navigate to="/fieldwork/tracker" replace />} />
                <Route path="/fieldwork/gap-analysis" element={<GapAnalysis />} />
                <Route path="/fieldwork/supplier-audit" element={<SupplierAudit />} />
                <Route path="/fieldwork/pbc" element={<PBCList />} />
                <Route path="/fieldwork/tracker" element={<FieldworkTracker />} />
                <Route path="/fieldwork/findings" element={<FindingRegister />} />
                <Route path="/fieldwork/workpapers" element={<WorkpaperIndex />} />
                <Route path="/fieldwork/library" element={<WorkpaperLibrary />} />

                {/* Reporting */}
                <Route path="/reporting" element={<Navigate to="/reporting/builder" replace />} />
                <Route path="/reporting/builder" element={<ReportBuilder />} />
                <Route path="/reporting/management-review" element={<ManagementReview />} />
                <Route path="/reporting/kpi" element={<KPIDashboard />} />
                <Route path="/reporting/capa" element={<CAPATracker />} />
                <Route path="/reporting/universe" element={<AuditUniverseLive />} />
                <Route path="/reporting/risks" element={<RiskRegisterLive />} />

                {/* QMS Implementation */}
                <Route path="/qms" element={<QMSLanding />} />
                <Route path="/qms/context" element={<ContextForm />} />
                <Route path="/qms/stakeholders" element={<StakeholderRegister />} />
                <Route path="/qms/policy" element={<QualityPolicy />} />
                <Route path="/qms/objectives" element={<ObjectivesRegister />} />
                <Route path="/qms/changes" element={<ChangeRegister />} />
                <Route path="/qms/competence" element={<CompetenceRegister />} />
                <Route path="/qms/documents" element={<DocumentRegister />} />
                <Route path="/qms/operational" element={<OperationalPlanning />} />
                <Route path="/conduct" element={<ConductLanding />} />
                <Route path="/qms/design" element={<DesignDevelopment />} />
                <Route path="/qms/audit-schedule" element={<AuditSchedule />} />
                <Route path="/qms/improvements" element={<ContinualImprovement />} />
                <Route path="/review" element={<ReviewLanding />} />

                <Route path="*" element={<ComingSoon />} />
              </Routes>
            </main>
          </div>
        </div>
      </ThemeProvider>
      </TeamProvider>
    </ProgrammeProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
