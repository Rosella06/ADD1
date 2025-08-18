// services/reportService.ts
import axios from 'axios';
import { ReportItem } from '../../types/report';

interface FetchParams {
  machine?: string;
  startDate?: string;
  endDate?: string;
}

export async function fetchDispensingReport(params: FetchParams): Promise<ReportItem[]> {
  try {
    const response = await axios.get<ReportItem[]>('/api/dispensing-report', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching dispensing report:', error);
    return [];
  }
}
