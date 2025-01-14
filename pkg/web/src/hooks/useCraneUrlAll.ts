import { useFetchClusterListQuery } from 'services/clusterApi';

export const useCraneUrlAll = () => {
  const clusterList = useFetchClusterListQuery({});

  // 返回所有集群的 craneUrl
  return (clusterList.data?.data?.items ?? []).map((cluster) => cluster.craneUrl);
};