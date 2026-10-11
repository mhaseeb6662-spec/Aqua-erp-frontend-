import { useState, useRef } from 'react';
import {
  X, Upload, FileText, CheckCircle2, AlertTriangle, Download,
  RefreshCw, Users, ShieldAlert, ArrowRight, Eye, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function StudentMigrationModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [dryRunResult, setDryRunResult] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [excelWarning, setExcelWarning] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef(null);

  const sampleCsvContent = `fullName,legacyStudentId,email,phone,dateOfBirth,gender,skillLevel,branchName,programName,parentName,parentEmail,parentPhone,emergencyContactName,emergencyContactPhone,medicalNotes
Tariq Al-Mansoor,STU-LEG-1001,tariq.mansoor@example.com,+971501112233,2010-05-14,Male,Intermediate,Dubai,Junior Angler,Sultan Al-Mansoor,sultan.mansoor@example.com,+971509998877,Sultan Al-Mansoor,+971509998877,No known allergies
Layla Al-Hashimi,STU-LEG-1002,layla.hashimi@example.com,+971502223344,2012-08-22,Female,Beginner,Fujairah,Kayak Stealth,Mariam Al-Hashimi,mariam.hashimi@example.com,+971508887766,Mariam Al-Hashimi,+971508887766,Asthma inhaler carried
Rashid Bin Salem,STU-LEG-1003,rashid.salem@example.com,+971503334455,2009-11-03,Male,Advanced,Abu Dhabi,Offshore & Deep Sea,Salem Al-Nuaimi,salem.nuaimi@example.com,+971507776655,Salem Al-Nuaimi,+971507776655,None`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aqua_fishing_student_migration_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded student migration template');
  };

  /**
   * RFC-4180 compliant CSV parser that supports:
   * - Quoted fields with embedded commas and newlines
   * - Escaped quotes ("")
   * - Multiple common delimiters (comma, semicolon, tab)
   * - UTF-8 BOM removal
   */
  const robustParseCSV = (rawText) => {
    if (!rawText) return [];
    // Remove BOM if present
    const cleanText = rawText.charCodeAt(0) === 0xFEFF ? rawText.slice(1) : rawText;

    // Detect delimiter from first non-empty line
    const firstLine = cleanText.split(/\r?\n/).find(l => l.trim().length > 0) || '';
    let delimiter = ',';
    if ((firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = ';';
    else if ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length) delimiter = '\t';

    const rows = [];
    let currentRow = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') i++; // Skip CRLF
        currentRow.push(currentCell.trim());
        if (currentRow.some(c => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) {
        rows.push(currentRow);
      }
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.trim().replace(/^["']|["']$/g, ''));
    const parsedObjects = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const obj = {};
      for (let c = 0; c < headers.length; c++) {
        const header = headers[c];
        if (header) {
          obj[header] = row[c] !== undefined ? row[c] : '';
        }
      }
      parsedObjects.push(obj);
    }

    return parsedObjects;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setDryRunResult(null);
    setMigrationResult(null);
    setExcelWarning(false);

    // If Excel binary file detected
    if (uploadedFile.name.endsWith('.xlsx') || uploadedFile.name.endsWith('.xls')) {
      setExcelWarning(true);
      toast.error('Excel binary file detected! Please save as CSV (UTF-8) in Excel first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (uploadedFile.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          const list = Array.isArray(parsed) ? parsed : [parsed];
          setParsedStudents(list);
          toast.success(`Loaded ${list.length} student records from JSON`);
        } catch (err) {
          toast.error('Invalid JSON file format');
        }
      } else {
        const rows = robustParseCSV(content);
        if (rows.length === 0) {
          toast.error('No valid rows found. Please check your CSV format.');
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

  // Helper to extract preview value regardless of alias
  const getPreviewVal = (row, ...keys) => {
    for (const k of keys) {
      if (row[k]) return row[k];
      const match = Object.keys(row).find(
        (rk) => rk.toLowerCase().replace(/[\s_-]/g, '') === k.toLowerCase().replace(/[\s_-]/g, '')
      );
      if (match && row[match]) return row[match];
    }
    return '—';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-marine-dark/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-tide/10 p-2.5 text-tide">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-marine">Student Data Migration Tool</h2>
              <p className="text-xs text-slate-500">Bulk import student rosters, parent accounts, and course enrollments</p>
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
            <p className="text-slate-600 mt-0.5">Includes Student records, Parent accounts, Branch, and Program mapping.</p>
          </div>
          <button
            type="button"
            onClick={downloadSampleCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3.5 py-2 text-xs font-bold text-tide hover:bg-sky-50 shadow-xs shrink-0"
          >
            <Download className="h-4 w-4" /> Download Sample CSV
          </button>
        </div>

        {/* Excel Warning Banner */}
        {excelWarning && (
          <div className="mb-4 rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Excel (.xlsx / .xls) File Detected</p>
              <p className="mt-1 text-amber-800">
                To import your spreadsheet, simply open it in Excel, click <strong>File &gt; Save As</strong>, and choose <strong>CSV (Comma delimited) (*.csv)</strong>. Then select that file here.
              </p>
            </div>
          </div>
        )}

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
            {parsedStudents.length > 0 ? `${parsedStudents.length} records ready for processing` : 'Accepts CSV UTF-8 with standard columns'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .json, text/csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Preview of Parsed Data (First 5 Rows) */}
        {parsedStudents.length > 0 && !migrationResult && (
          <div className="mt-4 rounded-xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-tide" /> Data Preview (Showing first {Math.min(5, parsedStudents.length)} of {parsedStudents.length} records)
              </span>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-[11px] font-bold text-tide hover:underline"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {showPreview && (
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Student Code</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Branch</th>
                      <th className="px-3 py-2">Parent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedStudents.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-bold text-marine">
                          {getPreviewVal(row, 'fullName', 'studentName', 'name')}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-600">
                          {getPreviewVal(row, 'legacyStudentId', 'studentCode', 'id') || 'Auto STU-ID'}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {getPreviewVal(row, 'email', 'studentEmail')}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {getPreviewVal(row, 'phone', 'studentPhone')}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {getPreviewVal(row, 'branchName', 'branch')}
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          {getPreviewVal(row, 'parentName', 'guardianName')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Dry-Run Result Preview */}
        {dryRunResult && (
          <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Dry-Run Validation Report</h3>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold text-sky-800">
                Safe Simulation (0 writes to DB)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">TOTAL</p>
                <p className="font-bold text-slate-800">{dryRunResult.totalRecords}</p>
              </div>
              <div className="rounded-lg bg-white p-2 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">VALID READY</p>
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
              <div className="rounded-lg bg-amber-50 p-3 text-[11px] text-amber-800 border border-amber-200 space-y-1.5 max-h-36 overflow-y-auto">
                <p className="font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5" /> Duplicate Protection Alert ({dryRunResult.duplicates.length} skipped)
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {dryRunResult.duplicates.slice(0, 10).map((d, i) => (
                    <li key={i}>
                      <strong>Row {d.row}:</strong> {d.studentName} ({d.legacyId || d.email}) — <em>{d.reason}</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dryRunResult.errors?.length > 0 && (
              <div className="rounded-lg bg-rose-50 p-3 text-[11px] text-rose-800 border border-rose-200 space-y-1.5 max-h-36 overflow-y-auto">
                <p className="font-bold flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Validation Errors ({dryRunResult.errors.length} rejected)
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {dryRunResult.errors.slice(0, 10).map((e, i) => (
                    <li key={i}>
                      <strong>Row {e.row}:</strong> {e.studentName} — <em>{e.error}</em>
                    </li>
                  ))}
                </ul>
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

            {migrationResult.errors?.length > 0 && (
              <div className="rounded-lg bg-white p-2.5 text-[11px] text-rose-700 border border-rose-200 max-h-28 overflow-y-auto">
                <p className="font-bold">Errors encountered:</p>
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  {migrationResult.errors.map((e, idx) => (
                    <li key={idx}>Row {e.row}: {e.studentName} — {e.error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            {migrationResult ? 'Close & Refresh' : 'Cancel'}
          </button>

          {!migrationResult && (
            <>
              <button
                type="button"
                onClick={handleDryRunValidation}
                disabled={isValidating || isMigrating || parsedStudents.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition disabled:opacity-40"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Validating...
                  </>
                ) : (
                  'Run Dry-Run Test'
                )}
              </button>

              <button
                type="button"
                onClick={handleExecuteLiveMigration}
                disabled={isMigrating || isValidating || parsedStudents.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition disabled:opacity-40"
              >
                {isMigrating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Migrating Students...
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
