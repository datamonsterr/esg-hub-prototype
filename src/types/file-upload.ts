export interface FileType {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  badge: string;
  badgeColor: string;
}

export interface FileUploadData {
  fileTypes: FileType[];
} 