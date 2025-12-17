import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc,
  X 
} from 'lucide-react';
import { formatReportType } from '@/lib/patientUtils';

interface PatientSearchBarProps {
  onSearch: (query: string) => void;
  onSortChange: (sortBy: 'name' | 'lastVisit' | 'reportCount', sortOrder: 'asc' | 'desc') => void;
  onReportTypeFilter: (types: string[]) => void;
  onViewChange: (view: 'grid' | 'list') => void;
  view: 'grid' | 'list';
  reportTypes: string[];
  selectedReportTypes: string[];
}

export function PatientSearchBar({
  onSearch,
  onSortChange,
  onReportTypeFilter,
  onViewChange,
  view,
  reportTypes,
  selectedReportTypes,
}: PatientSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'reportCount'>('lastVisit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleSortChange = (value: string) => {
    const newSortBy = value as 'name' | 'lastVisit' | 'reportCount';
    setSortBy(newSortBy);
    onSortChange(newSortBy, sortOrder);
  };

  const toggleSortOrder = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    onSortChange(sortBy, newOrder);
  };

  const toggleReportType = (type: string) => {
    const newTypes = selectedReportTypes.includes(type)
      ? selectedReportTypes.filter((t) => t !== type)
      : [...selectedReportTypes, type];
    onReportTypeFilter(newTypes);
  };

  const clearFilters = () => {
    setSearchQuery('');
    onSearch('');
    onReportTypeFilter([]);
  };

  const hasActiveFilters = searchQuery || selectedReportTypes.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Search Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or ID..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[160px] bg-card/50 border-border/50">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="lastVisit">Last Visit</SelectItem>
              <SelectItem value="reportCount">Report Count</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="bg-card/50 border-border/50"
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-card/50 rounded-lg border border-border/50">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewChange('grid')}
            className="h-8 w-8"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onViewChange('list')}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Report Type Filters */}
      {reportTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by type:</span>
          {reportTypes.map((type) => (
            <Badge
              key={type}
              variant={selectedReportTypes.includes(type) ? 'default' : 'outline'}
              className="cursor-pointer transition-all hover:scale-105"
              onClick={() => toggleReportType(type)}
            >
              {formatReportType(type)}
            </Badge>
          ))}
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
