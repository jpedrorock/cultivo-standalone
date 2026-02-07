import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThermometerSun, Droplets, MapPin, Loader2, CloudOff } from "lucide-react";

export function WeatherWidget() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cityName, setCityName] = useState<string>("Sua Localização");

  // Obter geolocalização do usuário
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          
          // Tentar obter nome da cidade via reverse geocoding
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              const city = data.address?.city || data.address?.town || data.address?.village || "Sua Localização";
              setCityName(city);
            })
            .catch(() => setCityName("Sua Localização"));
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Não foi possível obter sua localização");
          // Fallback para Brasília
          setLocation({ lat: -15.7939, lon: -47.8828 });
          setCityName("Brasília");
        }
      );
    } else {
      setLocationError("Geolocalização não suportada");
      // Fallback para Brasília
      setLocation({ lat: -15.7939, lon: -47.8828 });
      setCityName("Brasília");
    }
  }, []);

  const { data: weather, isLoading, error } = trpc.weather.getCurrent.useQuery(
    { lat: location?.lat ?? 0, lon: location?.lon ?? 0 },
    { enabled: !!location, refetchInterval: 10 * 60 * 1000 } // Atualizar a cada 10 minutos
  );

  if (isLoading || !location) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ThermometerSun className="w-5 h-5 text-blue-600" />
            Clima Externo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || locationError) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CloudOff className="w-5 h-5 text-muted-foreground" />
            Clima Externo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            {locationError || "Erro ao carregar dados do clima"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ThermometerSun className="w-5 h-5 text-blue-600" />
          Clima Externo
        </CardTitle>
        <div className="flex items-center gap-1 text-sm text-blue-700 mt-1">
          <MapPin className="w-3 h-3" />
          <span>{cityName}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Temperatura */}
          <div className="flex flex-col items-center p-4 bg-card/60 rounded-lg">
            <ThermometerSun className="w-8 h-8 text-orange-500 mb-2" />
            <div className="text-3xl font-bold text-foreground">
              {weather?.temperature?.toFixed(1)}°C
            </div>
            <div className="text-xs text-muted-foreground mt-1">Temperatura</div>
          </div>

          {/* Umidade */}
          <div className="flex flex-col items-center p-4 bg-card/60 rounded-lg">
            <Droplets className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-3xl font-bold text-foreground">
              {weather?.humidity}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Umidade</div>
          </div>
        </div>

        <div className="mt-3 text-xs text-blue-700 text-center">
          Atualizado às {new Date(weather?.time || "").toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </CardContent>
    </Card>
  );
}
