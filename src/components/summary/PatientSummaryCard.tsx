import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Heart, 
  MessageCircleQuestion,
  Lightbulb,
  Calendar,
  Sparkles,
  ThumbsUp,
  Activity,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Type definitions for patient-friendly summary
export interface PatientFinding {
  title: string;
  status: 'good' | 'needs_attention' | 'urgent';
  emoji: string;
  simple_explanation: string;
  what_it_means: string;
  action_items: string[];
}

export interface PatientSummary {
  overview: string;
  findings: PatientFinding[];
  questions_for_doctor: string[];
  lifestyle_tips: string[];
  follow_up_needed: boolean;
  urgency_level: 'low' | 'moderate' | 'high';
}

interface PatientSummaryCardProps {
  summary: PatientSummary;
  className?: string;
}

const statusConfig = {
  good: {
    icon: CheckCircle2,
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    iconColor: 'text-emerald-500',
    label: 'Normal',
    gradient: 'from-emerald-500/10 to-emerald-500/5'
  },
  needs_attention: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-700 dark:text-amber-300',
    iconColor: 'text-amber-500',
    label: 'Monitor',
    gradient: 'from-amber-500/10 to-amber-500/5'
  },
  urgent: {
    icon: AlertCircle,
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-700 dark:text-red-300',
    iconColor: 'text-red-500',
    label: 'Important',
    gradient: 'from-red-500/10 to-red-500/5'
  }
};

const urgencyBadge = {
  low: { label: '✅ Routine Check', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  moderate: { label: '📋 Follow Up Soon', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  high: { label: '⚡ Contact Doctor', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Get the most important finding (urgent > needs_attention > good)
function getPrimaryFinding(findings: PatientFinding[]): PatientFinding {
  const urgent = findings.find(f => f.status === 'urgent');
  if (urgent) return urgent;
  
  const attention = findings.find(f => f.status === 'needs_attention');
  if (attention) return attention;
  
  return findings[0];
}

export function PatientSummaryCard({ summary, className }: PatientSummaryCardProps) {
  const urgency = urgencyBadge[summary.urgency_level];

  return (
    <motion.div
      className={cn("space-y-8", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Overview Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Your Health Summary</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  {summary.overview}
                </p>
              </div>
            </div>
            
            {/* Primary Finding Highlight */}
            {summary.findings.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
                <p className="text-xs text-blue-200 uppercase tracking-wide font-medium mb-2">
                  🔍 Key Finding
                </p>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{getPrimaryFinding(summary.findings).emoji}</span>
                  <div>
                    <p className="font-semibold text-white text-lg">
                      {getPrimaryFinding(summary.findings).title}
                    </p>
                    <p className="text-blue-100 text-sm mt-1 line-clamp-2">
                      {getPrimaryFinding(summary.findings).simple_explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex items-center gap-3">
              <Badge className={cn("text-sm py-1.5 px-4 font-medium", urgency.color)}>
                {urgency.label}
              </Badge>
              <span className="text-blue-100 text-sm">
                {summary.findings.length} finding{summary.findings.length !== 1 ? 's' : ''} reviewed
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Findings Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold">What We Found</h3>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {summary.findings.map((finding, index) => {
            const config = statusConfig[finding.status];
            const StatusIcon = config.icon;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className={cn(
                  "h-full border-2 transition-shadow hover:shadow-lg overflow-hidden",
                  config.borderColor
                )}>
                  <div className={cn("h-1", `bg-gradient-to-r ${config.gradient}`)} />
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn("p-2 rounded-xl", config.bgColor)}>
                        <StatusIcon className={cn("h-5 w-5", config.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{finding.emoji}</span>
                          <h4 className="font-semibold text-base truncate">{finding.title}</h4>
                        </div>
                        <Badge variant="secondary" className={cn("text-xs", config.textColor, config.bgColor)}>
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {finding.simple_explanation}
                    </p>
                    
                    {finding.what_it_means && finding.what_it_means !== '' && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">💡 What this means:</p>
                        <p className="text-sm">{finding.what_it_means}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Questions for Doctor */}
      {summary.questions_for_doctor.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/40">
                  <MessageCircleQuestion className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                Questions for Your Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {summary.questions_for_doctor.map((question, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-sm font-bold text-purple-700 dark:text-purple-300">
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium">{question}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lifestyle Tips */}
      {summary.lifestyle_tips.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <Lightbulb className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Tips for Better Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {summary.lifestyle_tips.slice(0, 4).map((tip, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"
                  >
                    <ThumbsUp className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Follow-up Card */}
      {summary.follow_up_needed && (
        <motion.div variants={itemVariants}>
          <Card className={cn(
            "border-2 overflow-hidden",
            summary.urgency_level === 'high' 
              ? "border-red-200 dark:border-red-800" 
              : "border-amber-200 dark:border-amber-800"
          )}>
            <div className={cn(
              "h-1 bg-gradient-to-r",
              summary.urgency_level === 'high' 
                ? "from-red-500 to-orange-500" 
                : "from-amber-500 to-yellow-500"
            )} />
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-2xl",
                  summary.urgency_level === 'high' 
                    ? "bg-red-100 dark:bg-red-900/40" 
                    : "bg-amber-100 dark:bg-amber-900/40"
                )}>
                  <Calendar className={cn(
                    "h-6 w-6",
                    summary.urgency_level === 'high' 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-amber-600 dark:text-amber-400"
                  )} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Schedule a Follow-up</h4>
                  <p className="text-muted-foreground text-sm">
                    {summary.urgency_level === 'high' 
                      ? "Please contact your healthcare provider soon to discuss these results."
                      : "Consider scheduling a follow-up appointment to review these findings."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Encouragement Footer */}
      <motion.div variants={itemVariants}>
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border border-purple-100 dark:border-purple-900">
          <Heart className="h-10 w-10 text-pink-500 mx-auto mb-3" />
          <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            You're doing great! 💪
          </p>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Staying informed about your health is an important step. Always discuss any concerns with your healthcare provider.
          </p>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border">
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            This summary is generated by AI to help you understand your medical report in simple terms. 
            It is not a diagnosis. Please consult your healthcare provider for medical advice and treatment decisions.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper function to parse and clean medical text for patient view
function parseForPatientView(text: string): string {
  // Remove markdown formatting
  let cleaned = text.replace(/\*\*/g, '');
  // Remove medical references
  cleaned = cleaned.replace(/\(Ref:[^)]+\)/gi, '');
  // Remove section headers
  cleaned = cleaned.replace(/^(KEY CLINICAL FINDINGS|CHAIN-OF-THOUGHT|Step \d+)[:\s]*/gim, '');
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

// Simplify medical terms to patient-friendly language
function simplifyMedicalTerms(text: string): string {
  const simplifications: [RegExp, string][] = [
    // Imaging terms
    [/T2\/FLAIR hyperintense lesion/gi, 'small spot'],
    [/T2 hyperintense/gi, 'visible'],
    [/hyperintense/gi, 'bright'],
    [/lesion/gi, 'spot'],
    [/enhancement/gi, 'increased visibility'],
    [/post-contrast/gi, 'after contrast dye'],
    [/contrast/gi, 'special dye'],
    [/MRI/gi, 'brain scan'],
    [/CT scan/gi, 'scan'],
    
    // Anatomy
    [/left temporal lobe white matter/gi, 'left side of your brain'],
    [/temporal lobe/gi, 'side of the brain'],
    [/white matter/gi, 'brain tissue'],
    [/ventricular system/gi, 'brain fluid spaces'],
    [/basal ganglia/gi, 'deep brain structures'],
    [/thalami|thalamus/gi, 'brain relay center'],
    [/brainstem/gi, 'base of the brain'],
    [/cerebellum/gi, 'back of the brain'],
    [/intracranial vessels/gi, 'blood vessels in the brain'],
    [/maxillary sinuses/gi, 'sinuses near your cheeks'],
    [/bilateral/gi, 'both sides'],
    
    // Medical conditions
    [/gliosis|gliotic focus/gi, 'scar tissue'],
    [/demyelinating plaque/gi, 'area where nerve covering is affected'],
    [/demyelinat\w+/gi, 'nerve covering damage'],
    [/multiple sclerosis/gi, 'MS (a nerve condition)'],
    [/neoplasm|tumor/gi, 'growth'],
    [/malignant/gi, 'serious'],
    [/benign/gi, 'not harmful'],
    [/sinusitis/gi, 'sinus infection/inflammation'],
    [/mucosal thickening/gi, 'swelling of the lining'],
    [/hydrocephalus/gi, 'fluid buildup'],
    [/aneurysm/gi, 'bulge in a blood vessel'],
    [/thrombosis/gi, 'blood clot'],
    [/edema/gi, 'swelling'],
    [/mass effect/gi, 'pressure on surrounding areas'],
    [/perilesional/gi, 'around the spot'],
    [/restricted diffusion/gi, 'concerning pattern'],
    
    // Medical actions
    [/neurological consultation/gi, 'appointment with a brain specialist'],
    [/neurologist/gi, 'brain and nerve specialist'],
    [/cerebrospinal fluid analysis/gi, 'spinal fluid test'],
    [/oligoclonal bands/gi, 'special proteins'],
    [/evoked potentials/gi, 'nerve response tests'],
    [/intranasal corticosteroids/gi, 'nose spray medicine'],
    [/decongestants/gi, 'medicine to reduce stuffiness'],
    
    // Descriptors
    [/approximately/gi, 'about'],
    [/demonstrates?/gi, 'shows'],
    [/identified|noted|observed/gi, 'found'],
    [/consistent with/gi, 'suggests'],
    [/indicative of/gi, 'points to'],
    [/patholog\w+/gi, 'condition'],
    [/etiology/gi, 'cause'],
    [/prognosis/gi, 'outlook'],
    [/differential diagnosis/gi, 'possible explanations'],
    [/unremarkable/gi, 'normal'],
    [/within normal limits/gi, 'normal'],
    [/no evidence of/gi, 'no signs of'],
  ];

  let simplified = text;
  for (const [pattern, replacement] of simplifications) {
    simplified = simplified.replace(pattern, replacement);
  }
  
  return simplified;
}

// Create a truly simple patient-friendly explanation
function createSimpleExplanation(finding: string): string {
  const cleaned = parseForPatientView(finding);
  const simplified = simplifyMedicalTerms(cleaned);
  
  // Truncate if still too long
  if (simplified.length > 200) {
    const sentences = simplified.split(/[.!?]+/).filter(s => s.trim());
    return sentences[0].trim() + '.';
  }
  
  return simplified;
}

// Extract a simple, friendly title
function extractFriendlyTitle(finding: string): string {
  const cleaned = parseForPatientView(finding);
  const simplified = simplifyMedicalTerms(cleaned);
  
  // Common patterns to extract meaningful titles
  if (/small spot|bright|visible/i.test(simplified)) {
    return 'Brain Scan Finding';
  }
  if (/sinus|stuffiness/i.test(simplified)) {
    return 'Sinus Finding';
  }
  if (/blood vessel|clot/i.test(simplified)) {
    return 'Blood Vessel Check';
  }
  if (/normal|no signs of|unremarkable/i.test(simplified)) {
    return 'Good News';
  }
  if (/follow-up|appointment|specialist/i.test(simplified)) {
    return 'Next Steps';
  }
  if (/scar tissue|nerve/i.test(simplified)) {
    return 'Area of Interest';
  }
  
  // Get first few words
  const words = simplified.split(' ').slice(0, 4);
  return words.join(' ').replace(/[,.:;]$/, '') || 'Finding';
}

// Determine status based on keywords
function determineStatus(text: string): 'good' | 'needs_attention' | 'urgent' {
  const lower = text.toLowerCase();
  
  const urgentKeywords = ['urgent', 'critical', 'severe', 'emergency', 'immediate', 'significant abnormal', 'malignant'];
  const goodKeywords = ['normal', 'healthy', 'good', 'stable', 'unremarkable', 'no evidence', 'within normal', 'no signs', 'appear normal', 'without'];
  
  if (urgentKeywords.some(k => lower.includes(k))) return 'urgent';
  if (goodKeywords.some(k => lower.includes(k))) return 'good';
  return 'needs_attention';
}

// Helper function to convert legacy summary to patient format
export function convertToPatientSummary(
  keyFindings: string[] | undefined,
  recommendations: string[] | undefined,
  fullSummary: string | undefined
): PatientSummary {
  // First, check if key_findings contains one long string that needs splitting
  let processedFindings = keyFindings || [];
  
  // If there's only 1 finding and it's very long, it might be all findings concatenated
  if (processedFindings.length === 1 && processedFindings[0].length > 300) {
    const rawText = processedFindings[0];
    
    // Remove "KEY CLINICAL FINDINGS:" header if present
    const cleaned = rawText.replace(/^\s*\*?\*?KEY CLINICAL FINDINGS\*?\*?:?\s*/i, '');
    
    // Split by "- " at the start of lines (common bullet pattern)
    const bulletSplit = cleaned.split(/\n?\s*-\s+/).filter(s => s.trim().length > 20);
    
    if (bulletSplit.length > 1) {
      processedFindings = bulletSplit;
    } else {
      // Try splitting by sentences if very long
      const sentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/);
      if (sentences.length > 1) {
        processedFindings = sentences.filter(s => s.trim().length > 30).slice(0, 6);
      }
    }
  }
  
  // Also clean up individual findings
  processedFindings = processedFindings.map(f => 
    f.replace(/^\s*\*?\*?KEY CLINICAL FINDINGS\*?\*?:?\s*/i, '')
     .replace(/^\s*-\s*/, '')
     .trim()
  ).filter(f => f.length > 10);
  
  // Parse key findings into patient-friendly format
  const findings: PatientFinding[] = processedFindings.slice(0, 8).map((finding) => {
    const status = determineStatus(finding);
    const title = extractFriendlyTitle(finding);
    const simpleExplanation = createSimpleExplanation(finding);
    
    // Create "what it means" based on status
    let whatItMeans = '';
    if (status === 'good') {
      whatItMeans = 'This is reassuring news - nothing concerning was found in this area.';
    } else if (status === 'urgent') {
      whatItMeans = 'This needs prompt attention. Your doctor will discuss next steps with you.';
    } else {
      whatItMeans = 'Your doctor may want to monitor this or do additional tests to learn more.';
    }
    
    return {
      title,
      status,
      emoji: status === 'good' ? '✅' : status === 'urgent' ? '🔴' : '🟡',
      simple_explanation: simpleExplanation,
      what_it_means: whatItMeans,
      action_items: []
    };
  });

  // Create a simple, friendly overview
  let overview = "We've looked at your medical report and here's what you need to know.";
  
  if (findings.length > 0) {
    const goodCount = findings.filter(f => f.status === 'good').length;
    const attentionCount = findings.filter(f => f.status === 'needs_attention').length;
    const urgentCount = findings.filter(f => f.status === 'urgent').length;
    
    if (urgentCount > 0) {
      overview = `Your report has ${urgentCount} important finding${urgentCount > 1 ? 's' : ''} that your doctor should discuss with you soon.`;
    } else if (attentionCount > 0 && goodCount > 0) {
      overview = `Your report shows ${goodCount} normal result${goodCount > 1 ? 's' : ''} and ${attentionCount} area${attentionCount > 1 ? 's' : ''} that may need follow-up.`;
    } else if (attentionCount > 0) {
      overview = `Your report has some findings that your doctor will want to discuss with you.`;
    } else {
      overview = `Great news! Your report looks good overall.`;
    }
  }

  // Simplify recommendations for lifestyle tips
  const lifestyleTips = (recommendations || [])
    .slice(0, 4)
    .map(rec => {
      const simple = simplifyMedicalTerms(parseForPatientView(rec));
      // Make it even simpler
      if (simple.length > 100) {
        const firstSentence = simple.split(/[.!?]/)[0];
        return firstSentence.trim() + '.';
      }
      return simple;
    });

  return {
    overview,
    findings,
    questions_for_doctor: [
      'What exactly did you find and is it something to worry about?',
      'Do I need any more tests or follow-up appointments?',
      'Are there any lifestyle changes that could help?',
      'What symptoms should I watch out for?'
    ],
    lifestyle_tips: lifestyleTips,
    follow_up_needed: findings.some(f => f.status !== 'good'),
    urgency_level: findings.some(f => f.status === 'urgent') 
      ? 'high' 
      : findings.some(f => f.status === 'needs_attention')
        ? 'moderate'
        : 'low'
  };
}
