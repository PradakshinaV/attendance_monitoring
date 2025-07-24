import React from "react";

function CSVDownload({ data }) {
  const downloadCSV = () => {
    const csvRows = [["Name", "ID", "Status"]];
    data.forEach((row) => {
      csvRows.push([
        `"${row.name}"`,
        `"${row.id}"`,
        `"${row.status || "N/A"}"`
      ]);
    });

    const csvContent = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "students_report.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={downloadCSV} aria-label="Download attendance CSV">
      Download Report
    </button>
  );
}

export default CSVDownload;
