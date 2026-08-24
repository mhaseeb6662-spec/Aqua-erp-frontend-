import { STAGE_STYLES, PIPELINE_STAGES } from '../../constants/crm';

export default function StageBadge({ stage }) {
  const meta = PIPELINE_STAGES.find((s) => s.key === stage);
  const style = STAGE_STYLES[stage] || 'bg-marine/10 text-marine/60';
  return (
    <span className={`badge ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {meta?.label || stage}
    </span>
  );
}
