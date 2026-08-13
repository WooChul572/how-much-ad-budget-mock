export default function handler(request, response) {
  const { company = 'Korea Eundan', market = 'Health supplements', target = 'Korea 25-54' } = request.query;

  response.status(200).json({
    company,
    market,
    target,
    marketSize: {
      value: 'KRW 5.8T',
      year: '2025',
      source: 'KOSIS configured, mock snapshot',
    },
    targetPopulation: {
      value: '21.84M',
      source: 'KOSIS configured, mock snapshot',
    },
    companyData: {
      source: 'Open DART configured, mock snapshot',
      disclosureCoverage: 'Company/disclosure data connector ready',
    },
    note: 'API keys can be configured as Vercel environment variables. Mock snapshot is used until live integrations are enabled.',
  });
}
