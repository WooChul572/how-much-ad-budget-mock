import { buildProviderSnapshot } from './provider-data.mjs';

export default async function handler(request, response) {
  const query = request.query ?? {};
  const input = {
    company: query.company || '',
    brand: query.brand || '',
    market: query.market || '',
    target: query.target || query.targetSegment || '',
    goal: query.goal || query.targetGoal || '',
  };
  const snapshot = await buildProviderSnapshot(input);

  response.status(200).json({
    company: input.company,
    brand: input.brand,
    market: snapshot.scenarioAdjustments.market,
    target: snapshot.scenarioAdjustments.targetSegment,
    marketSize: {
      value: `${snapshot.scenarioAdjustments.marketRevenue.toLocaleString('ko-KR')}억`,
      year: 'latest available',
      source: snapshot.kosis.source,
    },
    targetPopulation: {
      value: `${snapshot.scenarioAdjustments.targetPopulation.toLocaleString('ko-KR')}만명`,
      source: snapshot.kosis.source,
    },
    companyData: {
      source: snapshot.dart.source,
      companyName: snapshot.dart.companyName || input.company || '미확정',
      revenueEok: snapshot.dart.revenueEok || 0,
      competitivePowerIndex: snapshot.dart.competitivePowerIndex || 1,
    },
    providerStatus: {
      dartConfigured: snapshot.dart.configured,
      kosisConfigured: snapshot.kosis.configured,
      dartApplied: snapshot.dart.applied,
      kosisApplied: snapshot.kosis.applied,
      liveDataApplied: snapshot.liveDataApplied,
    },
    scenarioAdjustments: snapshot.scenarioAdjustments,
    note: snapshot.liveDataApplied
      ? 'DART/KOSIS API response or API-validated benchmark has been reflected in planning inputs.'
      : 'Provider keys are configured but the endpoint used category and demographic benchmark fallback where live rows were unavailable.',
  });
}
