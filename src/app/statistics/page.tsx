import { ClientOnly } from "@/components/statistics/ClientOnly";
import { StatisticsShell } from "@/components/statistics/StatisticsShell";


const page = () => {
  return (
    <ClientOnly>
      <StatisticsShell />
    </ClientOnly>
  );
}

export default page