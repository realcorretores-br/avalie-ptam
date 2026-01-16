import { useEffect, useState } from "react";
import { useRole } from "@/hooks/useRole";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { VideoManager } from "@/components/admin/VideoManager";

interface LandingContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
}

interface LandingItem {
  id: string;
  section: string;
  title: string | null;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  order_index: number | null;
  metadata: any;
}

const ContentManagement = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const [loading, setLoading] = useState(true);
  const [landingContent, setLandingContent] = useState<LandingContent[]>([]);
  const [landingItems, setLandingItems] = useState<LandingItem[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contentData, itemsData] = await Promise.all([
        supabase.from('landing_content').select('*').order('section'),
        supabase.from('landing_items').select('*').order('order_index')
      ]);

      if (contentData.data) setLandingContent(contentData.data);
      if (itemsData.data) setLandingItems(itemsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const getContent = (section: string) => {
    return landingContent.find(c => c.section === section) || {
      id: '',
      section,
      title: '',
      subtitle: '',
      description: '',
      image_url: ''
    };
  };

  const getItems = (section: string) => {
    return landingItems.filter(i => i.section === section);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gerenciamento de Conteúdo</h1>
          <p className="text-muted-foreground">
            Edite todos os textos, imagens e itens da Landing Page.
          </p>
        </div>

        <Tabs defaultValue="hero" className="space-y-4">        <TabsList className="flex flex-wrap h-auto gap-2">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="trusted_by">Confiança</TabsTrigger>
          <TabsTrigger value="features">Recursos Principais</TabsTrigger>
          <TabsTrigger value="benefits">Benefícios</TabsTrigger>

          <TabsTrigger value="technology">Tecnologia</TabsTrigger>
          <TabsTrigger value="how_it_works">Como Funciona</TabsTrigger>
          <TabsTrigger value="pricing">Preços</TabsTrigger>
          <TabsTrigger value="testimonials">Depoimentos</TabsTrigger>

          <TabsTrigger value="faq">FAQ</TabsTrigger>



          <TabsTrigger value="videos">Vídeos Tutoriais</TabsTrigger>
        </TabsList>

          <TabsContent value="hero">
            <SectionEditor
              section="hero"
              title="Hero Section"
              content={getContent('hero')}
              items={[]}
              onUpdate={fetchData}
              hasItems={false}
              contentLabels={{
                title: "Headline",
                subtitle: "Descrição",
                description: "Tag",
                image: "Imagem"
              }}
            />
          </TabsContent>

          <TabsContent value="features">
            <SectionEditor
              section="features"
              title="Recursos Principais"
              content={getContent('features')}
              items={getItems('features')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Recurso"
              itemFields={{ title: true, description: true, icon: true }}
              categories={[
                "Gestão e Organização",
                "Inteligência de Dados",
                "Otimização e Suporte"
              ]}
              predefinedIcons={[
                "fa-solid fa-file-lines",
                "fa-solid fa-calculator",
                "fa-solid fa-building",
                "fa-solid fa-chart-line",
                "fa-solid fa-chart-simple",
                "fa-solid fa-check-circle",
                "fa-solid fa-bolt",
                "fa-solid fa-shield-halved",
                "fa-solid fa-users"
              ]}
            />
          </TabsContent>

          <TabsContent value="benefits">
            <SectionEditor
              section="benefits"
              title="Benefícios e Diferenciais"
              content={getContent('benefits')}
              items={getItems('benefits')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Benefício"
              itemFields={{ title: true, description: true, icon: true }}
              predefinedIcons={[
                "fa-solid fa-file-circle-check",
                "fa-solid fa-file-lines",
                "fa-solid fa-calculator",
                "fa-solid fa-arrow-trend-up",
                "fa-solid fa-cloud",
                "fa-solid fa-users"
              ]}
            />
            <div className="mt-8">
              <SectionEditor
                section="benefits_cta"
                title="Chamada para Ação (Azul)"
                content={getContent('benefits_cta')}
                items={[]}
                onUpdate={fetchData}
                hasItems={false}
                contentLabels={{
                  title: "Título",
                  description: "Descrição",
                  subtitle: "Texto do Botão",
                  image: "Imagem do Monitor"
                }}
              />
            </div>
          </TabsContent>





          <TabsContent value="how_it_works">
            <SectionEditor
              section="how_it_works"
              title="Como Funciona"
              content={getContent('how_it_works')}
              items={getItems('how_it_works')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Passo"
              itemFields={{ title: true, description: true, icon: true }}
              predefinedIcons={[
                "fa-solid fa-user-plus",
                "fa-solid fa-magnifying-glass",
                "fa-solid fa-calculator",
                "fa-solid fa-file-circle-check"
              ]}
            />
          </TabsContent>

          <TabsContent value="testimonials">
            <SectionEditor
              section="testimonials"
              title="Depoimentos"
              content={getContent('testimonials')}
              items={getItems('testimonials')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Depoimento"
              itemFields={{ title: true, description: true, metadata: true }} // Metadata for role/company
            />
          </TabsContent>

          <TabsContent value="pricing">
            <SectionEditor
              section="pricing"
              title="Planos e Preços"
              content={getContent('pricing')}
              items={getItems('pricing')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Plano"
              itemFields={{ title: true, description: true, metadata: true }} // Metadata for price, features, etc
            />
          </TabsContent>



          <TabsContent value="trusted_by">
            <SectionEditor
              section="trusted_by"
              title="Confiança (Logos)"
              content={getContent('trusted_by')}
              items={getItems('trusted_by')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Logo"
              itemFields={{ title: true, icon: true, image: true }}
              predefinedIcons={[
                "fa-solid fa-building",
                "fa-solid fa-house",
                "fa-solid fa-handshake",
                "fa-solid fa-award",
                "fa-solid fa-certificate",
                "fa-solid fa-star",
                "fa-solid fa-check-circle",
                "fa-solid fa-users",
                "fa-solid fa-city",
                "fa-solid fa-landmark",
                "fa-solid fa-briefcase",
                "fa-brands fa-google",
                "fa-brands fa-linkedin",
                "fa-brands fa-instagram",
                "fa-brands fa-facebook",
                "fa-brands fa-whatsapp"
              ]}
            />
          </TabsContent>

          <TabsContent value="technology">
            <SectionEditor
              section="technology"
              title="Tecnologia"
              content={getContent('technology')}
              items={getItems('technology')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Item Tecnologia"
              itemFields={{ title: true, description: true }}
            />
          </TabsContent>





          <TabsContent value="faq">
            <SectionEditor
              section="faq"
              title="Perguntas Frequentes"
              content={getContent('faq')}
              items={getItems('faq')}
              onUpdate={fetchData}
              hasItems={true}
              itemLabel="Pergunta"
              itemFields={{ title: true, description: true }} // Title = Question, Desc = Answer
            />
          </TabsContent>

          <TabsContent value="videos">
            <VideoManager />
          </TabsContent>

        </Tabs>
      </div>
    </AdminLayout >
  );
};

export default ContentManagement;
