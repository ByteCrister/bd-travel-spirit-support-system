import { ClientOnlyStatistics } from "@/components/wrappers/ClientOnlyStatistics";
import { StatisticsPage } from "@/components/overview/statistics/StatisticsPage";


const page = () => {
  return (
    <ClientOnlyStatistics>
      <StatisticsPage />
    </ClientOnlyStatistics>
  );
}

export default page