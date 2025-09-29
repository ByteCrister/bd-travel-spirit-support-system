import { ClientOnlyStatistics } from "@/components/provider/ClientOnlyStatistics";
import { StatisticsShell } from "@/components/statistics/StatisticsShell";


const page = () => {
  return (
    <ClientOnlyStatistics>
      <StatisticsShell />
    </ClientOnlyStatistics>
  );
}

export default page