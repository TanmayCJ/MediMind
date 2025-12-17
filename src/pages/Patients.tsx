import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePatients } from '@/hooks/usePatients';
import { 
  PatientCard, 
  PatientSearchBar, 
  EmptyPatientState 
} from '@/components/patient';
import { filterPatients } from '@/lib/patientUtils';
import { Users, Upload, Sparkles, RefreshCw } from 'lucide-react';

export default function Patients() {
  const { patients, loading, error, refetch } = usePatients();
  const navigate = useNavigate();
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'reportCount'>('lastVisit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedReportTypes, setSelectedReportTypes] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Get all unique report types from patients
  const allReportTypes = useMemo(() => {
    const types = new Set<string>();
    patients.forEach((p) => p.reportTypes.forEach((t) => types.add(t)));
    return Array.from(types);
  }, [patients]);

  // Filter patients
  const filteredPatients = useMemo(() => {
    return filterPatients(patients, {
      searchQuery,
      reportTypes: selectedReportTypes,
      sortBy,
      sortOrder,
    });
  }, [patients, searchQuery, selectedReportTypes, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: 'name' | 'lastVisit' | 'reportCount', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-6 py-8 space-y-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 1, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Patient Management</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Patients
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                View and manage all patient profiles and their medical reports
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-3"
            >
              <Button
                variant="outline"
                onClick={refetch}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button
                onClick={() => navigate('/upload')}
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                <Upload className="h-4 w-4" />
                New Report
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{patients.length}</span>
              <span className="text-muted-foreground">Total Patients</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50">
              <span className="text-2xl font-bold">
                {patients.reduce((acc, p) => acc + p.reportCount, 0)}
              </span>
              <span className="text-muted-foreground">Total Reports</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PatientSearchBar
            onSearch={setSearchQuery}
            onSortChange={handleSortChange}
            onReportTypeFilter={setSelectedReportTypes}
            onViewChange={setView}
            view={view}
            reportTypes={allReportTypes}
            selectedReportTypes={selectedReportTypes}
          />
        </motion.div>

        {/* Patient List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {loading ? (
            <div className={`grid gap-6 ${view === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredPatients.length === 0 ? (
            searchQuery || selectedReportTypes.length > 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No patients found matching your filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedReportTypes([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <EmptyPatientState onUploadClick={() => navigate('/upload')} />
            )
          ) : (
            <motion.div
              className={`grid gap-6 ${view === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
            >
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PatientCard
                    patient={patient}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
