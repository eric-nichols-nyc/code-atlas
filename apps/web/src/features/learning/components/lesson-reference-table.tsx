import styles from "./lesson-reference-table.module.css";

export function LessonReferenceTable({
  label,
  columns,
  rows,
}: {
  label: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <section
      className={styles.scroll}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard focus enables horizontal table scrolling.
      tabIndex={0}
      aria-label={label}
    >
      <table
        aria-label={label}
        className={styles.table}
        data-wide={columns.length > 2}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([heading, ...cells]) => (
            <tr key={heading}>
              <th scope="row">{heading}</th>
              {cells.map((cell, index) => (
                <td key={columns[index + 1]}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
