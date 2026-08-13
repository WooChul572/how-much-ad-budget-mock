export default function handler(request, response) {
  response.status(200).json({
    mode: 'vercel-serverless',
    providers: {
      dart: {
        name: 'Open DART',
        configured: Boolean(process.env.DART_API_KEY),
        keyPreview: process.env.DART_API_KEY ? 'configured' : 'not set',
        purpose: 'Company profile, disclosures, financial data',
      },
      kosis: {
        name: 'KOSIS',
        configured: Boolean(process.env.KOSIS_API_KEY),
        keyPreview: process.env.KOSIS_API_KEY ? 'configured' : 'not set',
        purpose: 'Market size, population, target scale, category statistics',
      },
      gemini: {
        name: 'Google Gemini',
        configured: Boolean(process.env.GEMINI_API_KEY),
        keyPreview: process.env.GEMINI_API_KEY ? 'configured' : 'not set',
        purpose: 'Goal parsing, market/competitor enrichment, evidence synthesis',
      },
    },
    sources: [
      'Open DART company/disclosure data',
      'KOSIS national statistics',
      'KOBACO advertising statistics',
      'Advertiser spend benchmark',
      'Naver SearchAd API statistics',
      'Kakao Moment report API',
      'Domestic TV and OOH execution pattern benchmarks',
      'Google Research Bayesian MMM paper',
      'Google Meridian open-source MMM',
      'Meta Robyn open-source MMM',
      'HOW MUCH mock modeling',
    ],
    engines: [
      {
        name: 'Bayesian MMM Engine',
        role: 'Apply carryover, shape effects, Bayesian prior calibration, channel contribution',
      },
      {
        name: 'Goal Response Engine',
        role: 'Estimate goal achievement, mROAS, saturation zones, optimal budget range',
      },
      {
        name: 'Domestic Media Pattern Engine',
        role: 'Apply Naver, Kakao, TV, and OOH execution-pattern weights for the Korean market',
      },
      {
        name: 'Advertiser Benchmark Engine',
        role: 'Use advertiser/category spend distribution to calibrate competitive budget level',
      },
    ],
    updatedAt: new Date().toISOString(),
  });
}
