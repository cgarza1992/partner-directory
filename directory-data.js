/**
 * Filterable Directory - Sample Data
 *
 * Replace these with your own data source (API, CMS, static JSON, etc.)
 * The shape of each object is what directory-app.js expects.
 */

const initialRegions = [
  { name: 'North America', slug: 'north-america' },
  { name: 'Europe', slug: 'europe' },
  { name: 'Asia Pacific', slug: 'asia-pacific' },
  { name: 'Latin America', slug: 'latin-america' },
];

const initialCategories = [
  { name: 'Analytics', slug: 'analytics' },
  { name: 'Automation', slug: 'automation' },
  { name: 'CRM', slug: 'crm' },
  { name: 'Data & Storage', slug: 'data-storage' },
  { name: 'Developer Tools', slug: 'dev-tools' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Payments', slug: 'payments' },
  { name: 'Security', slug: 'security' },
];

/**
 * Item shape:
 * {
 *   id: number,
 *   title: string,
 *   link: string,
 *   regions: string[],                         // slugs matching initialRegions
 *   thumbnail: string | false,
 *   excerpt: string,
 *   categories: Array<{ name: string, slug: string }>,
 *   priority: number,                           // lower = shown first (paid placement)
 *   platform: string[],
 * }
 */
const initialItems = [
  { id: 1, title: 'Stripe', link: '#', regions: ['north-america', 'europe', 'asia-pacific', 'latin-america'], thumbnail: false, excerpt: 'Payment processing platform for internet businesses of all sizes.', categories: [{ name: 'Payments', slug: 'payments' }], priority: 1, platform: [] },
  { id: 2, title: 'Mixpanel', link: '#', regions: ['north-america', 'europe', 'asia-pacific'], thumbnail: false, excerpt: 'Product analytics that helps you understand user behavior and make better decisions.', categories: [{ name: 'Analytics', slug: 'analytics' }], priority: 2, platform: [] },
  { id: 3, title: 'HubSpot', link: '#', regions: ['north-america', 'europe', 'latin-america'], thumbnail: false, excerpt: 'CRM platform with marketing, sales, and service tools for growing businesses.', categories: [{ name: 'CRM', slug: 'crm' }, { name: 'Marketing', slug: 'marketing' }], priority: 3, platform: [] },
  { id: 4, title: 'Zapier', link: '#', regions: ['north-america', 'europe', 'asia-pacific', 'latin-america'], thumbnail: false, excerpt: 'Connect your apps and automate workflows without code.', categories: [{ name: 'Automation', slug: 'automation' }], priority: 4, platform: [] },
  { id: 5, title: 'Datadog', link: '#', regions: ['north-america', 'europe', 'asia-pacific'], thumbnail: false, excerpt: 'Cloud monitoring and security platform for modern infrastructure.', categories: [{ name: 'Analytics', slug: 'analytics' }, { name: 'Developer Tools', slug: 'dev-tools' }], priority: 5, platform: [] },
  { id: 6, title: 'Auth0', link: '#', regions: ['north-america', 'europe', 'asia-pacific', 'latin-america'], thumbnail: false, excerpt: 'Flexible authentication and authorization platform for applications.', categories: [{ name: 'Security', slug: 'security' }], priority: 6, platform: [] },
  { id: 7, title: 'Snowflake', link: '#', regions: ['north-america', 'europe', 'asia-pacific'], thumbnail: false, excerpt: 'Cloud data platform for data warehousing, lakes, and sharing.', categories: [{ name: 'Data & Storage', slug: 'data-storage' }], priority: 7, platform: [] },
  { id: 8, title: 'Mailchimp', link: '#', regions: ['north-america', 'europe', 'latin-america'], thumbnail: false, excerpt: 'Email marketing and automation platform for growing businesses.', categories: [{ name: 'Marketing', slug: 'marketing' }], priority: 8, platform: [] },
  { id: 9, title: 'Salesforce', link: '#', regions: ['north-america', 'europe', 'asia-pacific', 'latin-america'], thumbnail: false, excerpt: 'The world\'s leading CRM platform for sales, service, and marketing.', categories: [{ name: 'CRM', slug: 'crm' }], priority: 9, platform: [] },
  { id: 10, title: 'GitHub', link: '#', regions: ['north-america', 'europe', 'asia-pacific', 'latin-america'], thumbnail: false, excerpt: 'Development platform for version control, collaboration, and CI/CD.', categories: [{ name: 'Developer Tools', slug: 'dev-tools' }], priority: 10, platform: [] },
  { id: 11, title: 'PayPal', link: '#', regions: ['north-america', 'europe', 'latin-america'], thumbnail: false, excerpt: 'Online payment system for businesses and consumers worldwide.', categories: [{ name: 'Payments', slug: 'payments' }], priority: 11, platform: [] },
  { id: 12, title: 'Sentry', link: '#', regions: ['north-america', 'europe', 'asia-pacific'], thumbnail: false, excerpt: 'Application monitoring and error tracking for development teams.', categories: [{ name: 'Developer Tools', slug: 'dev-tools' }], priority: 12, platform: [] },
  { id: 13, title: 'Braze', link: '#', regions: ['north-america', 'europe'], thumbnail: false, excerpt: 'Customer engagement platform for personalized messaging at scale.', categories: [{ name: 'Marketing', slug: 'marketing' }], priority: 13, platform: [] },
  { id: 14, title: 'Supabase', link: '#', regions: ['north-america', 'europe', 'asia-pacific'], thumbnail: false, excerpt: 'Open source Firebase alternative with Postgres, auth, and storage.', categories: [{ name: 'Data & Storage', slug: 'data-storage' }, { name: 'Developer Tools', slug: 'dev-tools' }], priority: 14, platform: [] },
  { id: 15, title: 'CrowdStrike', link: '#', regions: ['north-america', 'europe', 'asia-pacific'], thumbnail: false, excerpt: 'Cloud-native endpoint protection and threat intelligence platform.', categories: [{ name: 'Security', slug: 'security' }], priority: 15, platform: [] },
  { id: 16, title: 'n8n', link: '#', regions: ['europe', 'north-america'], thumbnail: false, excerpt: 'Open source workflow automation tool for technical teams.', categories: [{ name: 'Automation', slug: 'automation' }, { name: 'Developer Tools', slug: 'dev-tools' }], priority: 16, platform: [] },
];
