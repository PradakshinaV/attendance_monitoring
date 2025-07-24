// src/components/CSVDownload.js
import React from "react";

function CSVDownload({ data }) {
  const downloadCSV = () => {
    const csvRows = [["Name", "ID", "Status"]];
    data.forEach((row) => {
      csvRows.push([row.name, row.id, row.status || "N/A"]);
    });
    const blob = new Blob([csvRows.map(e => e.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_report.csv";
    a.click();
  };

  return <button onClick={downloadCSV}>Download Report</button>;
}

export default CSVDownload;
