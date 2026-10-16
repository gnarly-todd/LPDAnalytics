import type { CSSProperties } from "react";

export type CollectionBenchmarkRow = {
  key: string;
  label: string;
  value: number | null;
  communityAverage: number | null;
  blackAverage: number | null;
};

const number = (value: number | null) =>
  value === null ? "Not supplied" : value.toLocaleString("en-US", { maximumFractionDigits: 1 });

export function CollectionBenchmarkCards({ rows }: { rows: CollectionBenchmarkRow[] }) {
  return (
    <div
      className="collection-benchmark-cards"
      role="list"
      aria-label="Published LPU collection comparisons"
    >
      {rows.map((row) => (
        <article className="collection-benchmark-card" key={row.key} role="listitem">
          <h4>{row.label}</h4>
          <dl>
            <div className="collection-your-count">
              <dt>This profile</dt>
              <dd>{row.value === null ? "Not loaded" : number(row.value)}</dd>
            </div>
            <div>
              <dt>Community average</dt>
              <dd>{number(row.communityAverage)}</dd>
            </div>
            <div>
              <dt>Black-belt average</dt>
              <dd>{number(row.blackAverage)}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

export function MechanismCoverageCards({
  rows,
  belts,
  colors,
}: {
  rows: { mechanism: string; values: number[] }[];
  belts: readonly string[];
  colors: Record<string, string>;
}) {
  return (
    <div className="mechanism-coverage-mobile">
      <p className="collection-mobile-note">
        Owned locks by mechanism and rank. Only ranks with owned locks are shown; omitted ranks have
        zero.
      </p>
      {!rows.length && <p>No owned locks with mechanism information are available.</p>}
      <div
        className="mechanism-coverage-cards"
        role="list"
        aria-label="Owned lock mechanisms by belt rank"
      >
        {rows.map((row) => (
          <article className="mechanism-coverage-card" key={row.mechanism} role="listitem">
            <h4>{row.mechanism}</h4>
            <p>
              {row.values.reduce((total, count) => total + count, 0).toLocaleString("en-US")} owned
              locks
            </p>
            <dl>
              {row.values.flatMap((count, index) =>
                count > 0 ? (
                  <div
                    key={belts[index]}
                    style={{ "--rank-color": colors[belts[index]] } as CSSProperties}
                  >
                    <dt>
                      <i aria-hidden="true" />
                      {belts[index]}
                    </dt>
                    <dd>{count.toLocaleString("en-US")}</dd>
                  </div>
                ) : (
                  []
                ),
              )}
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}
