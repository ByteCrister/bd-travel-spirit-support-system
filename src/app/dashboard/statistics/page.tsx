import { StatisticsPage } from "@/components/dashboard/statistics/StatisticsPage";
import { ClientOnlyStatistics } from "@/components/wrappers/ClientOnlyStatistics";


const page = () => {
  return (
    <ClientOnlyStatistics>
      <StatisticsPage />
    </ClientOnlyStatistics>
  );
}

export default page