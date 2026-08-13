export default function handler(request, response) {
  const { company = 'Korea Eundan', market = 'Health supplements', target = 'Korea 25-54' } = request.query;
  const dartConfigured = Boolean(process.env.DART_API_KEY);
  const kosisConfigured = Boolean(process.env.KOSIS_API_KEY);

  response.status(200).json({
    company,
    market,
    target,
    marketSize: {
      value: 'KRW 5.8T',
      year: '2025',
      source: kosisConfigured ? 'KOSIS key configured, benchmark snapshot' : 'KOSIS key missing, mock snapshot',
    },
    targetPopulation: {
      value: '21.84M',
      source: kosisConfigured ? 'KOSIS key configured, benchmark snapshot' : 'KOSIS key missing, mock snapshot',
    },
    companyData: {
      source: dartConfigured ? 'Open DART key configured, benchmark snapshot' : 'Open DART key missing, mock snapshot',
      disclosureCoverage: 'Company/disclosure data connector ready',
    },
    providerStatus: {
      dartConfigured,
      kosisConfigured,
    },
    note: 'API keys are checked through Vercel environment variables. This endpoint currently returns benchmark snapshots for the planning engine until live provider fetches are enabled.',
  });
}
