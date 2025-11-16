import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ColumnConfig {
  field: string;
  header: string;
  width?: number;
  format?: (value: any) => string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() {}

  /**
   * Exporta dados para Excel (.xlsx)
   * @param data Array de objetos com os dados
   * @param filename Nome do arquivo (sem extensão)
   * @param columns Configuração de colunas (opcional)
   */
  exportToExcel(data: any[], filename: string, columns?: ColumnConfig[]): void {
    try {
      // Formata os dados se houver configuração de colunas
      const formattedData = columns
        ? this.formatDataForExport(data, columns)
        : data;

      // Cria worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedData);

      // Ajusta largura das colunas
      if (columns) {
        const columnWidths = columns.map(col => ({
          wch: col.width || 20
        }));
        worksheet['!cols'] = columnWidths;
      }

      // Cria workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

      // Salva arquivo
      const excelFilename = `${filename}_${this.getTimestamp()}.xlsx`;
      XLSX.writeFile(workbook, excelFilename);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      throw new Error('Falha ao exportar dados para Excel');
    }
  }

  /**
   * Exporta dados para CSV
   * @param data Array de objetos com os dados
   * @param filename Nome do arquivo (sem extensão)
   * @param columns Configuração de colunas (opcional)
   */
  exportToCsv(data: any[], filename: string, columns?: ColumnConfig[]): void {
    try {
      // Formata os dados se houver configuração de colunas
      const formattedData = columns
        ? this.formatDataForExport(data, columns)
        : data;

      // Cria worksheet e converte para CSV
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);

      // Cria blob e faz download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${this.getTimestamp()}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao exportar para CSV:', error);
      throw new Error('Falha ao exportar dados para CSV');
    }
  }

  /**
   * Exporta dados para PDF
   * @param data Array de objetos com os dados
   * @param title Título do documento
   * @param columns Configuração de colunas
   * @param filename Nome do arquivo (opcional)
   */
  exportToPdf(
    data: any[],
    title: string,
    columns: ColumnConfig[],
    filename?: string
  ): void {
    try {
      const doc = new jsPDF('landscape');

      // Adiciona título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, 15);

      // Adiciona data de geração
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${this.getCurrentDateTime()}`, 14, 22);

      // Prepara headers e body para a tabela
      const headers = columns.map(col => col.header);
      const body = data.map(item =>
        columns.map(col => {
          const value = this.getNestedValue(item, col.field);
          return col.format ? col.format(value) : this.formatValue(value);
        })
      );

      // Gera tabela
      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 28,
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 28 },
        didDrawPage: (data) => {
          // Footer com número de página
          const pageCount = (doc as any).internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.text(
            `Página ${data.pageNumber} de ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      });

      // Salva PDF
      const pdfFilename = filename || title.toLowerCase().replace(/\s+/g, '_');
      doc.save(`${pdfFilename}_${this.getTimestamp()}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      throw new Error('Falha ao exportar dados para PDF');
    }
  }

  /**
   * Formata dados para exportação baseado na configuração de colunas
   */
  private formatDataForExport(data: any[], columns: ColumnConfig[]): any[] {
    return data.map(item => {
      const formatted: any = {};
      columns.forEach(col => {
        const value = this.getNestedValue(item, col.field);
        formatted[col.header] = col.format
          ? col.format(value)
          : this.formatValue(value);
      });
      return formatted;
    });
  }

  /**
   * Obtém valor aninhado de um objeto usando notação de ponto
   * Ex: getNestedValue({a: {b: {c: 1}}}, 'a.b.c') => 1
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current?.[prop];
    }, obj);
  }

  /**
   * Formata valor para exibição
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return this.formatDate(value);
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Formata data para dd/MM/yyyy
   */
  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Retorna timestamp atual formatado para nome de arquivo
   */
  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  /**
   * Retorna data/hora atual formatada para exibição
   */
  private getCurrentDateTime(): string {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
