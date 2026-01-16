import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface MonthlyData {
    mes: string;
    quantidade: number;
}

interface TypeData {
    name: string;
    value: number;
    color: string;
}

interface RegionData {
    name: string;
    count: number;
    percentage: number;
}

export function ChartsSection({
    monthlyData,
    typeData,
    regionData
}: {
    monthlyData: MonthlyData[],
    typeData: TypeData[],
    regionData: RegionData[]
}) {

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Volume Chart - Takes up 2 columns */}
            <Card className="lg:col-span-2 border-none shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold">Volume de Avaliações (12 meses)</CardTitle>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-gray-500">PTAMs</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis
                                    dataKey="mes"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    interval={0}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="quantidade"
                                    fill="#3B82F6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={30} // Slightly wider
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Property Types - Takes up 1 column */}
            <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Tipos de Imóveis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={0}
                                    dataKey="value"
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                {/* Center Text */}
                                <text x="50%" y="50%" dy={-10} textAnchor="middle" fill="#1F2937" className="text-2xl font-bold">
                                    {typeData.length > 0 ? Math.max(...typeData.map(t => t.value)) + "%" : "0%"}
                                </text>
                                <text x="50%" y="50%" dy={10} textAnchor="middle" fill="#9CA3AF" className="text-[10px] uppercase font-medium">
                                    {typeData.length > 0 ? typeData.reduce((prev, current) => (prev.value > current.value) ? prev : current).name : ""}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 mt-4">
                        {typeData.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm">Sem dados disponíveis</p>
                        ) : (
                            typeData.slice(0, 4).map((type, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }}></div>
                                        <span className="text-gray-600 truncate max-w-[120px]">{type.name}</span>
                                    </div>
                                    <span className="font-medium text-gray-500">{type.value}%</span>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Section: Resumo por Região (Mini) */}
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-800">Resumo por Região</h4>
                            <button className="text-xs text-blue-500 font-medium">Ver mapa</button>
                        </div>
                        <div className="space-y-4">
                            {regionData.length === 0 ? (
                                <p className="text-xs text-gray-400">Sem dados de localização</p>
                            ) : (
                                regionData.slice(0, 3).map((region, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-medium truncate max-w-[150px]">{region.name}</span>
                                            <span className="text-gray-400">{region.count} PTAMs</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${region.percentage}%` }}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
