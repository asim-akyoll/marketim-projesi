import http from "./http";

export type ReportType = "ORDER" | "STOCK" | "DAILY" | "MONTHLY";

export const reportService = {
  /**
   * Triggers a browser download for the PDF report.
   * Dates should be 'YYYY-MM-DD' strings.
   */
  async downloadReport(type: ReportType, startDate: string, endDate: string) {
    const response = await http.get("/api/admin/reports", {
      params: {
        type,
        startDate,
        endDate,
      },
      responseType: "blob", // Important for binary files
    });

    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    
    // Extract filename from header if possible, or generate one
    const contentDisposition = response.headers["content-disposition"];
    let filename = `report-${type.toLowerCase()}.pdf`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
