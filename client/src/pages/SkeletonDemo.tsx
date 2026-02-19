import React, { useState } from "react";
import { GallerySkeletonLoader } from "@/components/SkeletonLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Página de demonstração do Skeleton Loader
 * Mostra a animação de carregamento da galeria
 */
export default function SkeletonDemo() {
  const [showSkeleton, setShowSkeleton] = useState(true);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Demonstração - Skeleton Loader</CardTitle>
          <p className="text-muted-foreground">
            Animação de carregamento com efeito shimmer
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              onClick={() => setShowSkeleton(true)}
              variant={showSkeleton ? "default" : "outline"}
            >
              Mostrar Skeleton
            </Button>
            <Button
              onClick={() => setShowSkeleton(false)}
              variant={!showSkeleton ? "default" : "outline"}
            >
              Mostrar Conteúdo
            </Button>
          </div>

          {showSkeleton ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">Estado de Carregamento:</h3>
              <GallerySkeletonLoader count={6} />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Conteúdo Carregado:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                  >
                    <span className="text-4xl">🌱</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
