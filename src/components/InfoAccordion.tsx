import type { InfoPanel } from "@/lib/scholarly-info";

/** "What do the scholars say?" panel. Native <details>, so it works without JS and is keyboard accessible. */
export function InfoAccordion({ info, label = "What do the scholars say?" }: { info: InfoPanel; label?: string }) {
  return (
    <details className="disclosure mt-4">
      <summary>
        <span className="flex items-center gap-2 text-[15px]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="text-text-2">
            <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
          </svg>
          {label}
        </span>
      </summary>
      <div className="disclosure-body">
        <p className="font-semibold text-text">{info.title}</p>
        <p className="text-[14.5px] leading-relaxed mt-1 mb-4">{info.description}</p>
        <ul className="list-none p-0 m-0 grid gap-2.5">
          {info.positions.map((pos, i) => (
            <li key={i} className="panel !py-3">
              <p className="eyebrow !text-[11.5px]">{pos.school}</p>
              <p className="font-medium text-text text-[14.5px] mt-1">{pos.position}</p>
              <p className="text-[13.5px] leading-relaxed mt-1">{pos.reasoning}</p>
            </li>
          ))}
        </ul>
        {info.note && (
          <p className="mt-3 pt-3 border-t border-border text-[13.5px] leading-relaxed">
            <span className="font-semibold text-text">Note: </span>
            {info.note}
          </p>
        )}
      </div>
    </details>
  );
}
