import PageHeader from '../../components/PageHeader'
import AIPanel from '../../components/AIPanel'
import { CheckCircle2 } from 'lucide-react'

const elements = [
  { clause: '6.3.2', title: 'Document Adequacy Review', desc: 'Pre-fieldwork review of ISMS documentation to assess completeness before on-site work begins.', items: ['ISMS policy suite reviewed for completeness', 'SoA completeness and currency checked', 'Risk register reviewed', 'Previous audit reports assessed'], artifact: 'Document Adequacy Review Log' },
  { clause: '6.3.3', title: 'Formal Audit Plan', desc: 'Master document governing the entire audit — objectives, scope, criteria, schedule, methods, and team.', items: ['Audit objectives clearly stated', 'Scope and boundaries defined', 'Audit criteria (standards) referenced', 'Schedule and resource plan included'], artifact: 'Formal Audit Plan' },
  { clause: '6.3.4', title: 'Work Assignment Matrix', desc: 'Maps each auditor to specific controls or clause areas — prevents duplication, ensures full coverage.', items: ['Controls assigned per auditor', 'Hours allocated per area', 'Dependencies identified', 'Review and sign-off roles assigned'], artifact: 'Work Assignment Matrix' },
  { clause: '6.3.5', title: 'Workpaper Preparation', desc: 'Standardised setup of all audit workpapers before fieldwork — templates, naming, filing structure.', items: ['Workpaper templates prepared', 'Naming convention applied', 'Filing structure established', 'Master index created in advance'], artifact: 'Workpaper Preparation Guide' },
]

export default function Clause6Preparation() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        standard="ISO 19011:2018"
        clause="Clause 6.3"
        title="Audit Preparation"
        description="Structured preparation activities before fieldwork — document review, formal audit plan, work assignment, and workpaper setup."
        badges={['Pre-Fieldwork', 'ISO 19011 Cl. 6.3']}
      />
      <div className="space-y-4 mb-6">
        {elements.map(el => (
          <div key={el.clause} className="card">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="clause-tag flex-shrink-0 self-start">{el.clause}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white mb-1">{el.title}</h3>
                <p className="text-sm text-steel-300 mb-3 leading-relaxed">{el.desc}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                  {el.items.map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-audit flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-steel-300 leading-snug">{i}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-steel-400">Artifact:</span>
                  <span className="badge badge-amber">{el.artifact}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AIPanel
        title="Generate Preparation Artifacts"
        systemPrompt="You are an ISO 19011:2018 audit preparation expert. Generate formal audit plans, document adequacy reviews, work assignment matrices, and workpaper preparation guides. All outputs must be structured, professional, and immediately usable by audit teams."
        placeholder="e.g. Generate a Formal Audit Plan for an ISO 27001:2022 ISMS surveillance audit at a healthcare SaaS company"
        contextFields={[
          { id: 'org', label: 'Organisation / Sector', placeholder: 'e.g. Healthcare SaaS, ISO 27001:2022', type: 'text' },
          { id: 'scope', label: 'Audit Scope', placeholder: 'e.g. Full ISMS — 93 Annex A controls', type: 'text' },
          { id: 'artifact', label: 'Artifact Required', type: 'select', options: ['Formal Audit Plan', 'Document Adequacy Review Log', 'Work Assignment Matrix', 'Workpaper Preparation Guide', 'Pre-Fieldwork Checklist'] },
        ]}
      />
    </div>
  )
}
