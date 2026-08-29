import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Upload, X, FileText, CheckCircle2, AlertTriangle, AlertCircle,
  Download, ArrowRight, ArrowLeft, RefreshCw, Layers, ShieldCheck,
  Check, Filter, Users, Database, Sparkles, ChevronDown, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import leadService from '../../services/leadService';
import { LEAD_SOURCES, PIPELINE_STAGES } from '../../constants/crm';

// Supported ERP Lead Fields with Exact-First Auto-Mapping
const ERP_FIELDS = [
  { key: 'fullName', label: 'Full Name / Contact Name', required: true, exact: ['name', 'full name', 'fullname', 'contact name', 'lead name', 'student name'], fallback: ['contact'] },
  { key: 'firstName', label: 'First Name', required: false, exact: ['first name', 'firstname', 'fname'], fallback: [] },
  { key: 'lastName', label: 'Last Name', required: false, exact: ['last name', 'lastname', 'lname'], fallback: [] },
  { key: 'phone', label: 'Phone / Mobile', required: true, exact: ['phone', 'mobile', 'phone number', 'mobile number', 'contact number', 'tel', 'whatsapp'], fallback: [] },
  { key: 'email', label: 'Email Address', required: false, exact: ['email', 'email address', 'e-mail', 'mail'], fallback: [] },
  { key: 'source', label: 'Lead Source', required: false, exact: ['source', 'lead source', 'channel', 'platform'], fallback: ['signup source'] },
  { key: 'status', label: 'Status / Stage', required: false, exact: ['status', 'stage', 'lead status', 'pipeline stage'], fallback: [] },
  { key: 'owner', label: 'Owner / Sales Rep', required: false, exact: ['owner', 'sales rep', 'assigned to', 'agent', 'salesperson'], fallback: [] },
  { key: 'createdOn', label: 'Created Date', required: false, exact: ['created on', 'created at', 'created date', 'date', 'signup date', 'lead date'], fallback: [] },
  { key: 'interestLevel', label: 'Interest Level', required: false, exact: ['interest level', 'interest', 'priority', 'rating', 'temperature'], fallback: [] },
  { key: 'subject', label: 'Subject / Program Interest', required: false, exact: ['subject', 'course', 'courses', 'program', 'interested in'], fallback: [] },
  { key: 'notes', label: 'Notes / Last Note', required: false, exact: ['last note', 'note', 'notes', 'comment', 'remarks'], fallback: [] },
  { key: 'city', label: 'City / Location', required: false, exact: ['city', 'location', 'emirate', 'address'], fallback: [] },
  { key: 'age', label: 'Age', required: false, exact: ['age'], fallback: [] },
  { key: 'gender', label: 'Gender', required: false, exact: ['gender', 'sex'], fallback: [] },
  { key: 'nationality', label: 'Nationality', required: false, exact: ['nationality', 'country'], fallback: [] },
  { key: 'guardianName', label: 'Guardian / Parent Name', required: false, exact: ['guardian name', 'guardian', 'parent name', 'parent', 'father name', 'mother name'], fallback: [] },
  { key: 'guardianPhone', label: 'Guardian Phone', required: false, exact: ['guardian phone', 'parent phone', 'emergency phone'], fallback: [] },
  { key: 'guardianEmail', label: 'Guardian Email', required: false, exact: ['guardian email', 'parent email'], fallback: [] },
  { key: 'numberOfKids', label: 'Number of Kids', required: false, exact: ['number of kids', 'kids', 'children', 'no of kids'], fallback: [] },
  { key: 'birthday', label: 'Birthday', required: false, exact: ['birthday', 'dob', 'date of birth'], fallback: [] },
  { key: 'lastContacted', label: 'Last Contacted', required: false, exact: ['last contacted', 'contacted date', 'last contact'], fallback: [] },
  { key: 'followUp', label: 'Follow Up Date', required: false, exact: ['follow up', 'follow up date', 'followup', 'next follow up'], fallback: [] },
];

function generateAutoMapping(headers) {
  const mapping = {};
  if (!Array.isArray(headers)) return mapping;
  const cleanHeaders = headers.map((h) => String(h || '').trim());

  for (const field of ERP_FIELDS) {
    let matched = null;
    // 1. Exact match
    for (const h of cleanHeaders) {
      const hLower = h.toLowerCase();
      if (field.exact.includes(hLower)) {
        matched = h;
        break;
      }
    }
    // 2. Fallback match
    if (!matched && field.fallback.length > 0) {
      for (const h of cleanHeaders) {
        const hLower = h.toLowerCase();
        if (field.fallback.includes(hLower)) {
          matched = h;
          break;
        }
      }
    }
    if (matched) {
      mapping[field.key] = matched;
    }
  }
  return mapping;
}

function parseCSVText(text) {
  const lines = [];
  let curLine = [];
  let curField = '';
  let inQuotes = false;

  let cleanText = String(text || '');
  if (cleanText.charCodeAt(0) === 0xFEFF) {
    cleanText = cleanText.slice(1);
  }

  for (let i = 0; i < cleanText.length; i++) {
    const c = cleanText[i];
    if (c === '"') {
      if (inQuotes && cleanText[i + 1] === '"') {
        curField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      curLine.push(curField.trim());
      curField = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && cleanText[i + 1] === '\n') {
        i++;
      }
      curLine.push(curField.trim());
      if (curLine.some((f) => f.length > 0)) {
        lines.push(curLine);
      }
      curLine = [];
      curField = '';
    } else {
      curField += c;
    }
  }
  if (curField || curLine.length > 0) {
    curLine.push(curField.trim());
    if (curLine.some((f) => f.length > 0)) {
      lines.push(curLine);
    }
  }
  return lines;
}

export default function LeadImportModal({ isOpen, onClose, onImportComplete }) {
  // 1. ALL HOOK DECLARATIONS MUST BE UNCONDITIONAL AND DECLARED AT THE VERY TOP
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Options, 4: Preview/Validate, 5: Importing, 6: Result
  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [dragOver, setDragOver] = useState(false);

  // Options
  const [defaultSource, setDefaultSource] = useState('Other');
  const [defaultStage, setDefaultStage] = useState('new');
  const [isHistoricalImport, setIsHistoricalImport] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [previewTab, setPreviewTab] = useState('all'); // 'all' | 'ready' | 'duplicate' | 'invalid'

  // Execution State
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importProgress, setImportProgress] = useState(0);

  const fileInputRef = useRef(null);

  // Derived memoized values MUST be declared before any conditional return
  const previewRows = useMemo(() => {
    return validationResult?.previewRows || [];
  }, [validationResult]);

  const filteredPreviewRows = useMemo(() => {
    if (!Array.isArray(previewRows)) return [];
    if (previewTab === 'all') return previewRows;
    return previewRows.filter((r) => r && r.status === previewTab);
  }, [previewRows, previewTab]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFile(null);
      setCsvHeaders([]);
      setParsedRows([]);
      setFieldMapping({});
      setDragOver(false);
      setDefaultSource('Other');
      setDefaultStage('new');
      setIsHistoricalImport(true);
      setSkipDuplicates(true);
      setIsValidating(false);
      setValidationResult(null);
      setPreviewTab('all');
      setIsImporting(false);
      setImportResult(null);
      setImportProgress(0);
    }
  }, [isOpen]);

  // 2. CONDITIONAL RETURN MUST ONLY BE PLACED AFTER ALL HOOKS ARE DECLARED
  if (!isOpen) return null;

  // 3. EVENT HANDLERS & HELPERS
  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a valid .csv file.');
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds maximum limit of 25MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVText(text);
        if (rows.length < 2) {
          toast.error('CSV file must contain at least a header row and one data record.');
          return;
        }

        const headers = rows[0].map((h) => String(h || '').replace(/^["']|["']$/g, '').trim());
        const dataRows = [];
        for (let i = 1; i < rows.length; i++) {
          const rowObj = {};
          headers.forEach((h, colIdx) => {
            let val = rows[i][colIdx] !== undefined ? String(rows[i][colIdx]) : '';
            if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
              val = val.slice(1, -1).replace(/""/g, '"');
            }
            rowObj[h] = val.trim();
          });
          dataRows.push(rowObj);
        }

        setFile(selectedFile);
        setCsvHeaders(headers);
        setParsedRows(dataRows);

        // Auto Map Columns with exact-first algorithm
        const initialMapping = generateAutoMapping(headers);
        setFieldMapping(initialMapping);
        toast.success(`Loaded ${dataRows.length} rows from CSV.`);
      } catch (err) {
        toast.error('Failed to parse CSV file.');
      }
    };
    reader.readAsText(selectedFile);
  };

  // Download Standard CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      'First Name', 'Last Name', 'Name', 'Phone', 'Email', 'Source',
      'Status', 'Interest Level', 'Subject', 'Owner', 'Created On',
      'Last Contacted', 'Follow Up', 'Last Note', 'City', 'Age',
      'Gender', 'Nationality', 'Guardian Name', 'Guardian Phone', 'Guardian Email', 'Number of Kids'
    ];
    const sample = [
      'Rashid', 'Al-Falasi', 'Rashid Al-Falasi', '+971501234567', 'rashid@example.com', 'Instagram',
      'New', 'Warm', 'Kayak Fishing Program', 'Sales Agent', '2026-08-20 10:30:00',
      '2026-08-20 12:00:00', '2026-08-25 09:00:00', 'Inquired for weekend session', 'Dubai', '28',
      'Male', 'AE', 'Fatima Al-Falasi', '+971509876543', 'fatima@example.com', '2'
    ];
    const csvContent = `${headers.join(',')}\n"${sample.join('","')}"\n`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aqua_leads_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded CSV template.');
  };

  // Step 2: Validate & Dry Run
  const handleRunValidation = async () => {
    if (!fieldMapping.phone && !fieldMapping.fullName && !fieldMapping.firstName) {
      toast.error('Please map at least Phone and Name / First Name fields.');
      return;
    }

    setIsValidating(true);
    try {
      const { data } = await leadService.validateLeadCsv({
        rows: parsedRows,
        mapping: fieldMapping,
        options: {
          defaultSource,
          defaultStage,
          isHistoricalImport,
          skipDuplicates,
        },
      });

      setValidationResult(data.data);
      setStep(4); // Move to Preview
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to validate CSV data.');
    } finally {
      setIsValidating(false);
    }
  };

  // Step 5: Execute Import
  const handleExecuteImport = async () => {
    setIsImporting(true);
    setStep(5);
    setImportProgress(25);

    try {
      setImportProgress(50);
      const { data } = await leadService.executeLeadImport({
        rows: parsedRows,
        mapping: fieldMapping,
        options: {
          defaultSource,
          defaultStage,
          isHistoricalImport,
          skipDuplicates,
          batchName: file?.name || 'leads_import.csv',
        },
      });

      setImportProgress(100);
      setImportResult(data.data);
      setStep(6); // Move to Result
      toast.success(`Successfully completed import! ${data.data?.importedCount || 0} leads added.`);
      if (onImportComplete) onImportComplete();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to execute lead import.');
      setStep(4); // Go back to preview on failure
    } finally {
      setIsImporting(false);
    }
  };

  const totalRowsCount = validationResult?.summary?.totalRows || 0;
  const importableCount = validationResult?.summary?.importableCount || 0;
  const duplicateCount = validationResult?.summary?.duplicateCount || 0;
  const invalidCount = validationResult?.summary?.invalidCount || 0;
  const readyCount = validationResult?.summary?.readyCount || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-marine-dark/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-rise my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-marine/10 bg-marine text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-tide-light">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">Import Leads from CSV</h2>
              <p className="text-xs text-slate-300">Bulk upload contacts & inquiries with automatic deduplication</p>
            </div>
          </div>
          {step !== 5 && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold overflow-x-auto shrink-0">
          {[
            { num: 1, label: 'Upload CSV' },
            { num: 2, label: 'Map Columns' },
            { num: 3, label: 'Options' },
            { num: 4, label: 'Preview & Verify' },
            { num: 5, label: 'Importing' },
            { num: 6, label: 'Results' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center gap-2 shrink-0">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition ${
                  step === s.num
                    ? 'bg-tide text-white shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? <Check className="h-3.5 w-3.5" /> : s.num}
              </div>
              <span className={step === s.num ? 'text-marine font-bold' : 'text-slate-500 font-medium'}>
                {s.label}
              </span>
              {idx < 5 && <span className="text-slate-300 mx-1">›</span>}
            </div>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white space-y-6">

          {/* STEP 1: UPLOAD CSV */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-cyan-50 border border-cyan-200">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-tide shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-marine">Standard Lead CSV Template</h4>
                    <p className="text-xs text-slate-600">Download the recommended template with pre-filled columns</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="btn-secondary text-xs shrink-0 py-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Template (.CSV)
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-150 ${
                  dragOver
                    ? 'border-tide bg-tide/5 scale-[0.99]'
                    : file
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-tide hover:bg-slate-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                  accept=".csv"
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <h3 className="text-base font-bold text-marine">{file.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {(file.size / 1024).toFixed(1)} KB · {parsedRows.length} records detected
                    </p>
                    <div className="flex justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                          setParsedRows([]);
                          setCsvHeaders([]);
                        }}
                        className="text-xs text-coral hover:underline font-bold"
                      >
                        Remove File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 text-slate-400 mx-auto" />
                    <h3 className="text-base font-bold text-marine">Choose a CSV file or drag & drop here</h3>
                    <p className="text-xs text-slate-500">Supports standard UTF-8 encoded .csv files up to 25MB</p>
                    <button type="button" className="btn-primary text-xs mt-3">
                      Browse Computer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: MAP COLUMNS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-marine">Map CSV Columns to ERP Fields</h3>
                  <p className="text-xs text-slate-500">Auto-detected mappings based on your CSV headers</p>
                </div>
                <span className="badge bg-slate-100 text-slate-700 text-xs">
                  {Object.keys(fieldMapping).length} / {ERP_FIELDS.length} Fields Mapped
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[50vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 font-bold text-slate-700">
                    <tr>
                      <th className="px-4 py-2.5">ERP Lead Field</th>
                      <th className="px-4 py-2.5">CSV Column</th>
                      <th className="px-4 py-2.5">Sample Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ERP_FIELDS.map((field) => {
                      const selectedHeader = fieldMapping[field.key] || '';
                      const sampleVal = selectedHeader && parsedRows[0] ? parsedRows[0][selectedHeader] : '—';
                      return (
                        <tr key={field.key} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5">
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                              {field.label}
                              {field.required && <span className="text-coral font-bold">*</span>}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <select
                              value={selectedHeader}
                              onChange={(e) => {
                                setFieldMapping((prev) => ({ ...prev, [field.key]: e.target.value }));
                              }}
                              className="input-field py-1.5 text-xs bg-white"
                            >
                              <option value="">-- Skip / Unmapped --</option>
                              {csvHeaders.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 truncate max-w-[200px]">
                            {sampleVal || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: OPTIONS & CONFIGURATION */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-marine">Import Options & Safety Controls</h3>
                <p className="text-xs text-slate-500">Configure default fallbacks and automated communication rules</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">Default Lead Source (Fallback)</label>
                  <select
                    value={defaultSource}
                    onChange={(e) => setDefaultSource(e.target.value)}
                    className="input-field"
                  >
                    {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">Used if row source is blank or unmapped</p>
                </div>

                <div>
                  <label className="label-field">Default Pipeline Stage</label>
                  <select
                    value={defaultStage}
                    onChange={(e) => setDefaultStage(e.target.value)}
                    className="input-field"
                  >
                    {PIPELINE_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">Initial Kanban stage for incoming leads</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHistoricalImport}
                    onChange={(e) => setIsHistoricalImport(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-400 text-tide focus:ring-tide"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Import as historical records (Automation Suppression)
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Prevents sending bulk Welcome Emails, SMS, WhatsApp notifications, or webhook dispatches during import.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-tide focus:ring-tide"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Skip Duplicate Phone Numbers & Emails
                    </span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Ensures existing CRM records and repeat rows in the CSV are not duplicated.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: DRY RUN PREVIEW */}
          {step === 4 && (
            <div className="space-y-5">
              {/* Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-bold block">Total Rows</span>
                  <span className="text-xl font-extrabold text-marine">{totalRowsCount}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-xs text-emerald-700 font-bold block">Ready to Import</span>
                  <span className="text-xl font-extrabold text-emerald-700">{importableCount}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-xs text-amber-700 font-bold block">Duplicates</span>
                  <span className="text-xl font-extrabold text-amber-700">{duplicateCount}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-center">
                  <span className="text-xs text-coral font-bold block">Invalid Rows</span>
                  <span className="text-xl font-extrabold text-coral">{invalidCount}</span>
                </div>
              </div>

              {importableCount === 0 && totalRowsCount > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-amber-800">
                  <Info className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>
                    All records in this CSV file already exist in your CRM database or are duplicates. To prevent creating duplicates, no new records need to be added.
                  </span>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2 text-xs">
                  {[
                    { key: 'all', label: `All Preview (${previewRows.length})` },
                    { key: 'ready', label: `Ready (${readyCount})` },
                    { key: 'duplicate', label: `Duplicates (${duplicateCount})` },
                    { key: 'invalid', label: `Invalid (${invalidCount})` },
                  ].map((tab) => (
                    <button
                      type="button"
                      key={tab.key}
                      onClick={() => setPreviewTab(tab.key)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition ${
                        previewTab === tab.key
                          ? 'bg-marine text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[40vh] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Phone</th>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Source</th>
                      <th className="px-3 py-2">Stage</th>
                      <th className="px-3 py-2">Issues / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPreviewRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-400">
                          No rows matching filter.
                        </td>
                      </tr>
                    ) : (
                      filteredPreviewRows.map((r, idx) => {
                        const statusStr = String(r?.status || 'ready');
                        const dataObj = r?.data || {};
                        const issuesArr = Array.isArray(r?.issues) ? r.issues : [];
                        return (
                          <tr key={r?.rowNum || idx} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono text-slate-400">{r?.rowNum || idx + 1}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`badge text-[10px] font-bold ${
                                  statusStr === 'ready'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : statusStr === 'duplicate'
                                    ? 'bg-amber-100 text-amber-800'
                                    : statusStr === 'warning'
                                    ? 'bg-cyan-100 text-cyan-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {statusStr.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 py-2 font-medium text-slate-800 truncate max-w-[140px]">{dataObj.fullName || '—'}</td>
                            <td className="px-3 py-2 font-mono text-slate-600">{dataObj.phone || '—'}</td>
                            <td className="px-3 py-2 text-slate-600 truncate max-w-[140px]">{dataObj.email || '—'}</td>
                            <td className="px-3 py-2 text-slate-600">{dataObj.source || '—'}</td>
                            <td className="px-3 py-2 text-slate-600 uppercase font-semibold">{dataObj.stage || '—'}</td>
                            <td className="px-3 py-2 text-slate-500 text-[11px] truncate max-w-[180px]">
                              {issuesArr.length > 0 ? issuesArr.join(', ') : '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: IMPORTING IN PROGRESS */}
          {step === 5 && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="h-12 w-12 text-tide animate-spin mx-auto" />
              <h3 className="text-base font-bold text-marine">Importing Leads into CRM...</h3>
              <p className="text-xs text-slate-500">
                Processing batches and saving records into database with deduplication checks
              </p>
              <div className="w-full max-w-md mx-auto bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 mt-4">
                <div
                  className="bg-tide h-full transition-all duration-300 rounded-full"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* STEP 6: IMPORT RESULTS */}
          {step === 6 && (
            <div className="space-y-6 text-center py-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-marine">Import Process Completed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Batch ID: <span className="font-mono font-bold text-slate-700">{importResult?.batchId || '—'}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-700 font-bold block">Imported</span>
                  <span className="text-2xl font-extrabold text-emerald-700">{importResult?.importedCount || 0}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-700 font-bold block">Duplicates Skipped</span>
                  <span className="text-2xl font-extrabold text-amber-700">{importResult?.duplicatesSkipped || 0}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600 font-bold block">Total Rows</span>
                  <span className="text-2xl font-extrabold text-marine">{importResult?.totalRows || 0}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-cyan-50 border border-cyan-200">
                  <span className="text-xs text-tide font-bold block">Duration</span>
                  <span className="text-2xl font-extrabold text-tide">{importResult?.durationSeconds || 0}s</span>
                </div>
              </div>

              {importResult?.importedCount === 0 && (importResult?.duplicatesSkipped || 0) > 0 && (
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All records in this file already existed in your CRM. They were safely recognized and protected from duplicate creation.
                </p>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          {step === 1 && (
            <>
              <button type="button" onClick={onClose} className="btn-secondary text-xs">
                Cancel
              </button>
              <button
                type="button"
                disabled={!file || parsedRows.length === 0}
                onClick={() => setStep(2)}
                className="btn-primary text-xs"
              >
                Next: Map Columns <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-primary text-xs"
              >
                Next: Options <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button type="button" onClick={() => setStep(2)} className="btn-secondary text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button
                type="button"
                disabled={isValidating}
                onClick={handleRunValidation}
                className="btn-primary text-xs"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Validating CSV...
                  </>
                ) : (
                  <>
                    Run Dry-Run & Verify <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <button type="button" onClick={() => setStep(3)} className="btn-secondary text-xs">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Options
              </button>
              {importableCount > 0 ? (
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={handleExecuteImport}
                  className="btn-primary text-xs"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Confirm & Import {importableCount} Leads
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary text-xs bg-marine hover:bg-marine-light"
                >
                  View Existing Leads in CRM
                </button>
              )}
            </>
          )}

          {step === 6 && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary text-xs"
              >
                View Leads Table
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
