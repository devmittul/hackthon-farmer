import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Filter, Search, Calendar, Leaf, Activity, ArrowRight, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReports().then((data) => {
      setReports(data as any[]);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pt-6"
      >
        <div className="flex items-center gap-5">
          <div className="bg-orange-100/80 p-4 rounded-full">
            <FileText className="h-8 w-8 text-orange-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">Analysis Reports</h1>
            <p className="text-muted-foreground text-lg font-light mt-2">Historical AI diagnostics and agronomy recommendations.</p>
          </div>
        </div>

        <div className="flex w-full md:w-auto items-center gap-4">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            <Input 
              type="search" 
              placeholder="Search by crop, date, or ID..." 
              className="pl-12 h-14 bg-white border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-full focus-visible:ring-primary text-base w-full" 
            />
          </div>
          <Button variant="outline" className="h-14 px-6 border-transparent bg-white hover:bg-muted text-foreground rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] font-medium text-base">
            <Filter className="h-5 w-5 md:mr-2" strokeWidth={1.5} />
            <span className="hidden md:inline">Filter</span>
          </Button>
        </div>
      </motion.div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-0 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <FileText className="h-6 w-6 text-orange-600" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} /> +12%
              </span>
            </div>
            <h3 className="text-4xl font-light text-foreground">24</h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">Total Reports</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <Leaf className="h-6 w-6 text-green-600" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-4xl font-light text-foreground">18</h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">Healthy Scans</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-red-100 rounded-full">
                <Activity className="h-6 w-6 text-red-600" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-4xl font-light text-foreground">6</h3>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-2">Issues Detected</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card flex flex-col relative overflow-hidden">
        <CardHeader className="pb-6 border-b border-border/50 bg-muted/30 px-8 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold text-foreground">Report History</CardTitle>
              <CardDescription className="text-base font-light mt-2">Comprehensive log of all AI interactions.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-muted/30 animate-pulse rounded-[20px]" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base text-left">
                <thead className="text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-muted/20">
                  <tr>
                    <th className="px-8 py-5">Date & Time</th>
                    <th className="px-8 py-5">Subject / Crop</th>
                    <th className="px-8 py-5">Analysis Type</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {reports.map((report, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={report.id} 
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-muted rounded-full text-muted-foreground group-hover:text-orange-500 transition-colors">
                            <Calendar className="h-5 w-5" strokeWidth={1.5} />
                          </div>
                          <span className="font-medium text-foreground">{report.date}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-medium text-foreground">
                        {report.crop}
                      </td>
                      <td className="px-8 py-5 text-muted-foreground font-light">
                        {report.analysis}
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border",
                          getStatusColor(report.status)
                        )}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-orange-600 hover:bg-orange-100">
                            <Download className="h-5 w-5" strokeWidth={1.5} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                            <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {reports.length === 0 && (
                <div className="p-16 text-center text-muted-foreground text-lg font-light">
                  No reports found matching your criteria.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
