export interface IntegrationMethod {
  icon: string;
  title: string;
  description: string;
  tags: string[];
  action: string;
  onClick?: string;
}

export interface PopularIntegration {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface RecentActivity {
  title: string;
  subtitle: string;
  status: string;
}

export interface DataIntegrationsData {
  integrationMethods: IntegrationMethod[];
  popularIntegrations: PopularIntegration[];
  recentActivities: RecentActivity[];
} 