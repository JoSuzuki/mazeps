interface TableRow {
  id: string | number
}

interface TableColumn<TData> {
  key: string
  title: string
  value: (data: TData) => React.ReactNode
}

interface TableProps<TableData extends TableRow> {
  data: TableData[]
  columns: TableColumn<TableData>[]
  emptyState: React.ReactNode
}

const Table = <TableData extends TableRow>({
  columns,
  data,
  emptyState,
}: TableProps<TableData>) => {
  if (data.length === 0) return emptyState

  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <td className="p-2" key={column.key}>
              {column.title}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td className="p-2" key={`${row.id}-${column.key}`}>
                {column.value(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
