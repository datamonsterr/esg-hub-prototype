import { Actor, Action, Highlight } from './data-integration';

export interface DynamicTableData {
    [key: string]: string | number;
    id: string;
}

export interface DynamicTable {
    title: string;
    columns: string[];
    data: DynamicTableData[];
}

export interface ProcessedDocument {
    id: string;
    fileName: string;
    fileSize: string;
    summary: string;
    actors: Actor[];
    actions: Action[];
    keyHighlights: Highlight[];
    tables: DynamicTable[];
} 