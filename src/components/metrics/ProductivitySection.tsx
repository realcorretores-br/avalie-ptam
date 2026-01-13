import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RegionData {
    name: string;
    count: number;
    percentage: number;
}

export function ProductivitySection({ regionData }: { regionData: RegionData[] }) {
    return (
        <Card className="border-none shadow-sm overflow-hidden bg-white">
            <div className="grid md:grid-cols-2">
                <div className="p-6">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="text-lg font-bold">Produtividade por Região Detalhada</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                        {regionData.length === 0 ? (
                            <div className="text-gray-400 italic py-4">
                                Nenhum dado geográfico encontrado nas avaliações recentes.
                            </div>
                        ) : (
                            regionData.map((region, i) => (
                                <div key={i}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-medium text-gray-900 truncate pr-4">{region.name}</span>
                                        <span className="text-sm text-gray-500 whitespace-nowrap">{region.count} PTAMs</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${region.percentage}%` }}></div>
                                    </div>
                                </div>
                            ))
                        )}

                        <p className="text-xs text-gray-400 italic mt-8 pt-8">
                            Dados baseados no endereço das solicitações cadastradas.
                        </p>
                    </CardContent>
                </div>

                {/* Map Placeholder */}
                <div className="bg-gray-100 min-h-[300px] relative">
                    <div className="absolute inset-0 bg-[url('https://cartographicperspectives.org/index.php/journal/article/download/cp78-stamen/1342/1792')] bg-cover bg-center grayscale opacity-80 mix-blend-multiply"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping"></div>
                            <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-bold whitespace-nowrap text-blue-900">
                                Regiões Ativas
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
