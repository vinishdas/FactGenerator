import { Bar, BarChart } from "recharts";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart.js"


export function MyChart({ data }) {
    return (
        <ChartContainer config={{}}>
            <BarChart data={data} width={500} height={300}>
                <Bar
                    dataKey="change"
                    fill="red"
                    radius={[4, 4, 0, 0]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
        </ChartContainer>
    );
}