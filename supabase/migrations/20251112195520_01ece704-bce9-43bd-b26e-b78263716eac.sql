-- Create error_reports table
CREATE TABLE public.error_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviado',
  data_resolucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for error report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('error-reports', 'error-reports', false);

-- Enable RLS
ALTER TABLE public.error_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_reports
CREATE POLICY "Users can insert own error reports"
ON public.error_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own error reports"
ON public.error_reports
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all error reports"
ON public.error_reports
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update error reports"
ON public.error_reports
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for error report images
CREATE POLICY "Users can upload their own error images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'error-reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own error images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'error-reports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all error images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'error-reports' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Create error_report_images junction table
CREATE TABLE public.error_report_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_report_id UUID NOT NULL REFERENCES public.error_reports(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for error_report_images
ALTER TABLE public.error_report_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for error_report_images
CREATE POLICY "Users can view own error report images"
ON public.error_report_images
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.error_reports
    WHERE error_reports.id = error_report_images.error_report_id
    AND error_reports.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all error report images"
ON public.error_report_images
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own error report images"
ON public.error_report_images
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.error_reports
    WHERE error_reports.id = error_report_images.error_report_id
    AND error_reports.user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_error_reports_updated_at
BEFORE UPDATE ON public.error_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for error_reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.error_reports;