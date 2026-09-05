import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Download, RefreshCw, Users, ShieldAlert, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function StudentMigrationModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const fileInputRef = useRef(null);

  const sampleCsvContent = `fullName,legacyStudentId,email,phone,dateOfBirth,gender,skillLevel,branchName,programName,parentName,parentEmail,parentPhone,emergencyContactName,emergencyContactPhone,medicalNotes
Tariq Al-Mansoor,STU-LEG-1001,tariq.mansoor@example.com,+971501112233,2010-05-14,Male,Intermediate,Dubai,Junior Angler,Sultan Al-Mansoor,sultan.mansoor@example.com,+971509998877,Sultan Al-Mansoor,+971509998877,No known allergies
Layla Al-Hashimi,STU-LEG-1002,layla.hashimi@example.com,+971502223344,2012-08-22,Female,Beginner,Fujairah,Kayak Stealth,Mariam Al-Hashimi,mariam.hashimi@example.com,+971508887766,Mariam Al-Hashimi,+971508887766,Asthma inhaler carried`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aqua_fishing_student_migration_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (currentline.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentline[j];
        }
        rows.push(obj);
      }
    }
    return rows;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setDryRunResult(null);
    setMigrationResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (uploadedFile.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          setParsedStudents(Array.isArray(parsed) ? parsed : [parsed]);
          toast.success(`Loaded ${Array.isArray(parsed) ? parsed.length : 1} student records`);
        } catch (err) {
          toast.error('Invalid JSON file format');
        }
      } else {
        const rows = parseCSV(content);
        if (rows.length === 0) {
          toast.error('No valid rows found in CSV');
        } else {
          setParsedStudents(rows);
          toast.success(`Loaded ${rows.length} student records from CSV`);
        }
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleDryRunValidation = async () => {
    if (parsedStudents.length === 0) {
      return toast.error('Please upload a student data file first');
    }

    setIsValidating(true);
    try {
      const res = await api.post('/students/migrate', {
        students: parsedStudents,
        dryRun: true
      });
      setDryRunResult(res.data.data);
      toast.success('Dry-run validation complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dry-run validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleExecuteLiveMigration = async () => {
    if (parsedStudents.length === 0) {
      return toast.error('Please upload a student data file first');
    }

    const confirmRun = window.confirm(
      `Are you sure you want to import ${parsedStudents.length} student records into the database?`
    );
    if (!confirmRun) return;

    setIsMigrating(true);
    try {
      const res = await api.post('/students/migrate', {
        students: parsedStudents,
        dryRun: false
      });
      setMigrationResult(res.data.data);
      toast.success(`Successfully imported ${res.data.data.importedCount} students!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Migration execution failed');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-tide/10 p-2.5 text-tide">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-marine">Student Data Migration Tool</h2>
              <p className="text-xs text-slate-500">Migrate legacy student records with parent linking & duplicate protection</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instructions & Template */}
        <div className="my-4 rounded-xl bg-sky-50/50 p-4 border border-sky-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
          <div>
            <p className="font-bold text-slate-800">CSV &amp; Excel Migration Template</p>
            <p className="text-slate-600 mt-0.5">Includes Student info, Parent deduplication, Branch and Program mapping.</p>
          </div>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3.5 py-2 text-xs font-bold text-tide hover:bg-sky-50 shadow-xs shrink-0"
          >
            <Download className="h-4 w-4" /> Download Sample CSV
          </button>
        </div>

        {/* Upload Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:bg-slate-100/70 cursor-pointer transition"
        >
          <Upload className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-xs font-bold text-slate-700">
            {file ? file.name : 'Click to select CSV or JSON file'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {parsedStudents.length > 0 ? `${parsedStudents.length} records ready for processing` : 'Supports standard CSV / UTF-8'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .json, text/csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Dry-Run Result Preview */}
        {dryRunResult && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Dry-Run Validation Report</h3>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
                Safe Simulation
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">TOTAL</p>
                <p className="font-bold text-slate-800">{dryRunResult.totalRecords}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">VALID</p>
                <p className="font-bold text-emerald-600">{dryRunResult.validCount}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">DUPLICATES</p>
                <p className="font-bold text-amber-600">{dryRunResult.duplicateCount}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">REJECTED</p>
                <p className="font-bold text-rose-600">{dryRunResult.rejectedCount}</p>
              </div>
            </div>

            {dryRunResult.duplicates?.length > 0 && (
              <div className="rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-800 border border-amber-200">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Duplicate Protection Alert
                </p>
                <p className="mt-0.5">{dryRunResult.duplicates.length} records match existing email or student code and will be safely skipped during live migration.</p>
              </div>
            )}
          </div>
        )}

        {/* Live Migration Execution Result */}
        {migrationResult && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-bold text-xs uppercase tracking-wider">Migration Successfully Executed</h3>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2 border border-emerald-100">
                <p className="text-[10px] text-slate-400 font-bold">SOURCE</p>
                <p className="font-bold text-slate-800">{migrationResult.totalRecords}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-emerald-100">
                <p className="text-[10px] text-slate-400 font-bold">IMPORTED</p>
                <p className="font-bold text-emerald-600">{migrationResult.importedCount}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-emerald-100">
                <p className="text-[10px] text-slate-400 font-bold">SKIPPED DUPS</p>
                <p className="font-bold text-amber-600">{migrationResult.duplicateCount}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-emerald-100">
                <p className="text-[10px] text-slate-400 font-bold">REJECTED</p>
                <p className="font-bold text-rose-600">{migrationResult.rejectedCount}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            {migrationResult ? 'Done' : 'Cancel'}
          </button>

          {!migrationResult && (
            <>
              <button
                type="button"
                onClick={handleDryRunValidation}
                disabled={isValidating || isMigrating || parsedStudents.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
              >
                {isValidating ? 'Validating...' : 'Dry-Run Test'}
              </button>

              <button
                type="button"
                onClick={handleExecuteLiveMigration}
                disabled={isMigrating || isValidating || parsedStudents.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-40"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" /> Run Live Migration
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
