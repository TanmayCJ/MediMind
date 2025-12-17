import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Pill, 
  FileWarning,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  UserCheck,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  Shield,
  BookOpen,
  Microscope
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Type definitions for doctor-focused summary
export interface ClinicalFinding {
  finding: string;
  clinical_significance: string;
  reference_range?: string;
  icd10_code?: string;
  snomed_code?: string;
}

export interface RedFlag {
  flag: string;
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  recommended_action: string;
  rationale: string;
}

export interface PrescribingConsideration {
  medication_class: string;
  recommendation: string;
  rationale: string;
  contraindications: string[];
  monitoring: string[];
}

export interface DrugInteraction {
  interaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  recommendation: string;
}

export interface DoctorSummary {
  clinical_impression: string;
  key_findings: ClinicalFinding[];
  red_flags: RedFlag[];
  prescribing_considerations: PrescribingConsideration[];
  drug_interactions: DrugInteraction[];
  differential_diagnosis: string[];
  recommended_tests: string[];
  follow_up_interval: string;
  specialist_referrals: string[];
}

interface DoctorSummaryCardProps {
  summary: DoctorSummary;
  className?: string;
}

const urgencyConfig = {
  low: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  moderate: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  high: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  critical: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800'
  }
};

const severityConfig = {
  mild: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  },
  moderate: {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  severe: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  badge,
  badgeColor
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  badgeColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <span className="font-semibold">{title}</span>
            {badge && (
              <Badge className={cn("ml-2", badgeColor)}>
                {badge}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function DoctorSummaryCard({ summary, className }: DoctorSummaryCardProps) {
  return (
    <motion.div
      className={cn("space-y-4", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Clinical Impression Header */}
      <motion.div variants={itemVariants}>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Stethoscope className="h-4 w-4" />
              CLINICAL IMPRESSION
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed font-medium">
              {summary.clinical_impression}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Red Flags Section - Always Prominent */}
      {summary.red_flags.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertOctagon className="h-5 w-5" />
                RED FLAGS
                <Badge variant="destructive" className="ml-2">
                  {summary.red_flags.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {summary.red_flags.map((flag, index) => (
                <div 
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border-l-4",
                    urgencyConfig[flag.urgency].borderColor,
                    "bg-white dark:bg-gray-900/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-semibold text-foreground">{flag.flag}</span>
                    <Badge className={urgencyConfig[flag.urgency].color}>
                      {flag.urgency.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">Rationale:</span> {flag.rationale}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">Action:</span>
                    <span>{flag.recommended_action}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Clinical Findings */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardContent className="pt-4">
            <CollapsibleSection 
              title="Key Clinical Findings" 
              icon={ClipboardList}
              badge={summary.key_findings.length}
              badgeColor="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
            >
              <div className="space-y-3">
                {summary.key_findings.map((finding, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium">{finding.finding}</span>
                      <div className="flex gap-1 flex-shrink-0">
                        {finding.icd10_code && (
                          <Badge variant="outline" className="text-xs">
                            ICD-10: {finding.icd10_code}
                          </Badge>
                        )}
                        {finding.snomed_code && (
                          <Badge variant="outline" className="text-xs">
                            SNOMED: {finding.snomed_code}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {finding.clinical_significance}
                    </p>
                    {finding.reference_range && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">Reference:</span> {finding.reference_range}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </CardContent>
        </Card>
      </motion.div>

      {/* Prescribing Considerations */}
      {summary.prescribing_considerations.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-4">
              <CollapsibleSection 
                title="Prescribing Considerations" 
                icon={Pill}
                badge={summary.prescribing_considerations.length}
                badgeColor="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
              >
                <div className="space-y-4">
                  {summary.prescribing_considerations.map((rx, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-600 text-white">
                          {rx.medication_class}
                        </Badge>
                      </div>
                      <p className="font-medium mb-2">{rx.recommendation}</p>
                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="font-medium">Rationale:</span> {rx.rationale}
                      </p>
                      
                      {rx.contraindications.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                            <FileWarning className="h-3 w-3" />
                            Contraindications:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rx.contraindications.map((ci, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-red-200 text-red-700 dark:border-red-800 dark:text-red-400">
                                {ci}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {rx.monitoring.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Microscope className="h-3 w-3" />
                            Monitoring:
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rx.monitoring.map((m, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Drug Interactions */}
      {summary.drug_interactions.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-4">
              <CollapsibleSection 
                title="Drug Interactions" 
                icon={AlertTriangle}
                badge={summary.drug_interactions.length}
                badgeColor="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              >
                <div className="space-y-2">
                  {summary.drug_interactions.map((interaction, index) => (
                    <div 
                      key={index}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex-1">
                        <span className="font-medium">{interaction.interaction}</span>
                        <p className="text-sm text-muted-foreground mt-1">
                          {interaction.recommendation}
                        </p>
                      </div>
                      <Badge className={severityConfig[interaction.severity].color}>
                        {interaction.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Differential Diagnosis */}
      {summary.differential_diagnosis.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="pt-4">
              <CollapsibleSection 
                title="Differential Diagnosis" 
                icon={BookOpen}
                defaultOpen={false}
              >
                <div className="flex flex-wrap gap-2">
                  {summary.differential_diagnosis.map((dx, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="text-sm py-1"
                    >
                      {dx}
                    </Badge>
                  ))}
                </div>
              </CollapsibleSection>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommended Tests & Follow-up */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recommended Tests */}
          {summary.recommended_tests.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <CollapsibleSection 
                  title="Recommended Tests" 
                  icon={FlaskConical}
                  defaultOpen={false}
                >
                  <ul className="space-y-2">
                    {summary.recommended_tests.map((test, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {test}
                      </li>
                    ))}
                  </ul>
                </CollapsibleSection>
              </CardContent>
            </Card>
          )}

          {/* Specialist Referrals */}
          {summary.specialist_referrals.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <CollapsibleSection 
                  title="Specialist Referrals" 
                  icon={UserCheck}
                  defaultOpen={false}
                >
                  <div className="flex flex-wrap gap-2">
                    {summary.specialist_referrals.map((specialist, index) => (
                      <Badge 
                        key={index} 
                        className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                      >
                        {specialist}
                      </Badge>
                    ))}
                  </div>
                </CollapsibleSection>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* Follow-up Interval */}
      <motion.div variants={itemVariants}>
        <Card className="bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Recommended Follow-up</p>
                  <p className="font-semibold">{summary.follow_up_interval}</p>
                </div>
              </div>
              {summary.red_flags.length > 0 && (
                <Badge variant="outline" className="text-amber-700 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                  Review red flags before discharge
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Helper to clean and extract first meaningful section
function extractClinicalImpression(fullSummary: string | undefined): string {
  if (!fullSummary) return 'Clinical analysis pending review.';
  
  // Try to extract first paragraph or section
  const cleaned = fullSummary.replace(/\*\*/g, '').trim();
  
  // Look for KEY CLINICAL FINDINGS section
  const keyFindingsMatch = cleaned.match(/KEY CLINICAL FINDINGS[:\s]*([^*]+?)(?=CHAIN-OF-THOUGHT|Step \d|$)/i);
  if (keyFindingsMatch) {
    return keyFindingsMatch[1].trim().slice(0, 500);
  }
  
  // Otherwise take first 500 chars
  return cleaned.slice(0, 500) + (cleaned.length > 500 ? '...' : '');
}

// Parse key findings into structured format
function parseKeyFinding(finding: string): ClinicalFinding {
  // Remove markdown and references
  const cleaned = finding.replace(/\*\*/g, '').replace(/\(Ref:[^)]+\)/gi, '').trim();
  
  // Try to extract the main finding vs significance
  const parts = cleaned.split(/[-–:]/);
  
  return {
    finding: parts[0]?.trim() || cleaned.slice(0, 100),
    clinical_significance: parts.slice(1).join(' ').trim() || 'Review recommended',
    reference_range: undefined,
    icd10_code: undefined,
    snomed_code: undefined
  };
}

// Extract differential diagnoses from text
function extractDifferentials(fullSummary: string | undefined): string[] {
  if (!fullSummary) return [];
  
  const diffMatch = fullSummary.match(/differential[\s\S]*?(?:include|diagnos)[:\s]*([^.]+)/i);
  if (diffMatch) {
    return diffMatch[1]
      .split(/,|or/)
      .map(d => d.replace(/\*\*/g, '').trim())
      .filter(d => d.length > 3 && d.length < 100)
      .slice(0, 5);
  }
  return [];
}

// Extract recommended tests from text
function extractRecommendedTests(recommendations: string[] | undefined, fullSummary: string | undefined): string[] {
  const tests: string[] = [];
  
  // Look for test-related keywords in recommendations
  (recommendations || []).forEach(rec => {
    if (/MRI|CT|scan|imaging|test|follow-up|consultation|evaluation|assessment/i.test(rec)) {
      const cleaned = rec.replace(/\*\*/g, '').replace(/\(Ref:[^)]+\)/gi, '').trim();
      if (cleaned.length < 150) tests.push(cleaned);
    }
  });
  
  return tests.slice(0, 5);
}

// Extract specialist referrals
function extractSpecialistReferrals(recommendations: string[] | undefined): string[] {
  const specialists: string[] = [];
  const specialistKeywords = /neurolog|cardiolog|oncolog|radiolog|surgeon|specialist|consultation/i;
  
  (recommendations || []).forEach(rec => {
    if (specialistKeywords.test(rec)) {
      const match = rec.match(/(neurolog\w*|cardiolog\w*|oncolog\w*|radiolog\w*|surgeon|ENT|ophthalmolog\w*)/i);
      if (match) specialists.push(match[1]);
    }
  });
  
  return [...new Set(specialists)].slice(0, 4);
}

// Helper function to convert legacy summary to doctor format
export function convertToDoctorSummary(
  keyFindings: string[] | undefined,
  reasoningSteps: any,
  recommendations: string[] | undefined,
  fullSummary: string | undefined
): DoctorSummary {
  // Parse key findings into structured format
  const findings: ClinicalFinding[] = (keyFindings || []).map(parseKeyFinding);

  // Extract clinical impression (first key finding or summary excerpt)
  const clinicalImpression = findings.length > 0 
    ? findings[0].finding + '. ' + findings[0].clinical_significance
    : extractClinicalImpression(fullSummary);

  return {
    clinical_impression: clinicalImpression,
    key_findings: findings,
    red_flags: [], // Cannot reliably determine from legacy format
    prescribing_considerations: [],
    drug_interactions: [],
    differential_diagnosis: extractDifferentials(fullSummary),
    recommended_tests: extractRecommendedTests(recommendations, fullSummary),
    follow_up_interval: 'Per clinical judgment - see recommendations',
    specialist_referrals: extractSpecialistReferrals(recommendations)
  };
}
