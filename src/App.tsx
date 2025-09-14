import { useState, useRef, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
}

export default function App() {
  const [data, setData] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({ first: 0, rows: 12 });
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [rowCount, setRowCount] = useState<number>();

  const overlayRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${
          lazyParams.first / lazyParams.rows + 1
        }&limit=${lazyParams.rows}`
      );
      const result = await res.json();
      setData(result.data);
      setTotalRecords(result.pagination.total);
      setLoading(false);
    };
    fetchData();
  }, [lazyParams]);

  const handleManualSelection = (e: any) => {
    setSelectedRows(e.value);
  };

  const handleAutoSelect = async () => {
    if (!rowCount) return;

    let selected: Artwork[] = [];

    if (rowCount <= data.length) {
      selected = data.slice(0, rowCount);
    } else {
      selected = [...data];
      let remaining = rowCount - data.length;

      let nextPage = lazyParams.first / lazyParams.rows + 2;
      while (remaining > 0) {
        const res = await fetch(
          `https://api.artic.edu/api/v1/artworks?page=${nextPage}&limit=${lazyParams.rows}`
        );
        const result = await res.json();
        const pageData: Artwork[] = result.data;

        if (remaining <= pageData.length) {
          selected = [...selected, ...pageData.slice(0, remaining)];
          remaining = 0;
        } else {
          selected = [...selected, ...pageData];
          remaining -= pageData.length;
        }

        nextPage++;
        if (pageData.length === 0) break;
      }
    }

    setSelectedRows(selected);
    setRowCount(undefined);
    overlayRef.current?.hide();
  };

  const titleHeaderTemplate = () => {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <button
          style={{
            marginLeft: "8px",
            fontWeight: "bold",
            fontSize: "16px",
            color: "#333",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          onClick={(e) => overlayRef.current?.toggle(e)}
        >
          ▼
        </button>
        <span style={{ fontWeight: "600" }}>Title</span>
      </div>
    );
  };

  return (
    <div style={{ padding: "16px" }}>
      {/* <DataTable
        value={data}
        paginator
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        lazy
        loading={loading}
        first={lazyParams.first}
        onPage={(e) => setLazyParams(e)}
        selection={selectedRows}
        onSelectionChange={handleManualSelection}
        dataKey="id"
    
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header={titleHeaderTemplate} />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable> */}

      <DataTable
        value={data}
        paginator
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        lazy
        loading={loading}
        first={lazyParams.first}
        onPage={(e) => setLazyParams(e)}
        selection={selectedRows}
        onSelectionChange={handleManualSelection}
        dataKey="id"
        selectionMode="multiple" // ✅ Add this line
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header={titleHeaderTemplate} />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Date" />
        <Column field="date_end" header="End Date" />
      </DataTable>

      <OverlayPanel
        ref={overlayRef}
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "16px",
            width: "240px",
          }}
        >
          <input
            type="number"
            value={rowCount || ""}
            onChange={(e) => setRowCount(Number(e.target.value))}
            placeholder="Select rows"
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "8px 12px",
              outline: "none",
            }}
          />
          <Button
            label="Submit"
            style={{
              width: "100%",
              background: "black",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px",
              cursor: "pointer",
            }}
            onClick={handleAutoSelect}
          />
        </div>
      </OverlayPanel>
    </div>
  );
}
