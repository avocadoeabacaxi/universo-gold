import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Check, Eye, EyeOff, Info } from 'lucide-react';

const MicrosoftIcon = () => (
  <svg viewBox="0 0 21 21" className="w-5 h-5" fill="none">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

const TeamsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#5059C9">
    <path d="M19.19 8.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-7 2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7.5 3h-4.28A5.5 5.5 0 0 1 17.69 15H21a1 1 0 0 0 1-1v-1a2.5 2.5 0 0 0-2.31-2.5zM5 12a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h3.8A5.5 5.5 0 0 1 9 12.22V12H5zm7 1a4.5 4.5 0 0 0-4.5 4.5v1a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5v-1A4.5 4.5 0 0 0 12 13z"/>
  </svg>
);

function SecretInput({ value, onChange, placeholder, id }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

const SERVICE_CONFIGS = [
  {
    key: 'teams',
    label: 'Microsoft Teams',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    description: 'Notificações e mensagens em canais',
    fields: [
      { key: 'teams_client_id', label: 'Client ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', secret: false },
      { key: 'teams_client_secret', label: 'Client Secret', placeholder: 'Valor do secret gerado no Azure', secret: true },
      { key: 'teams_tenant_id', label: 'Tenant ID (Directory ID)', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', secret: false },
    ]
  },
  {
    key: 'outlook',
    label: 'Outlook / Microsoft 365',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    description: 'E-mails e calendário corporativo',
    fields: [
      { key: 'outlook_client_id', label: 'Client ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', secret: false },
      { key: 'outlook_client_secret', label: 'Client Secret', placeholder: 'Valor do secret gerado no Azure', secret: true },
    ]
  },
  {
    key: 'onedrive',
    label: 'OneDrive',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
    description: 'Upload e acesso a arquivos corporativos',
    fields: [
      { key: 'onedrive_client_id', label: 'Client ID', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', secret: false },
      { key: 'onedrive_client_secret', label: 'Client Secret', placeholder: 'Valor do secret gerado no Azure', secret: true },
    ]
  },
];

export default function AdminIntegracoesTab() {
  const [config, setConfig] = useState({});
  const [configId, setConfigId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.MicrosoftConfig.list().then(list => {
      if (list.length > 0) {
        setConfig(list[0]);
        setConfigId(list[0].id);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [`${key}_enabled`]: !prev[`${key}_enabled`] }));
  };

  const handleSave = async () => {
    setSaving(true);
    if (configId) {
      await base44.entities.MicrosoftConfig.update(configId, config);
    } else {
      const created = await base44.entities.MicrosoftConfig.create(config);
      setConfigId(created.id);
    }
    toast.success('Configurações salvas com sucesso!');
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-0.5">Como obter as credenciais?</p>
          <p>Acesse o <strong>portal.azure.com</strong> → Azure Active Directory → App registrations → Crie um novo app → Copie o Client ID, gere um Client Secret e configure a URI de redirecionamento.</p>
        </div>
      </div>

      {/* Redirect URI */}
      <Card className="rounded-xl border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MicrosoftIcon /> URI de Redirecionamento OAuth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground">Configure esta URI no portal Azure em cada App Registration (Authentication → Redirect URIs):</p>
          <div className="space-y-1.5">
            <Label htmlFor="redirect_uri">Redirect URI</Label>
            <Input
              id="redirect_uri"
              value={config.redirect_uri || ''}
              onChange={e => handleChange('redirect_uri', e.target.value)}
              placeholder={`${window.location.origin}/auth/microsoft/callback`}
              className="rounded-xl font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Service Cards */}
      {SERVICE_CONFIGS.map(service => (
        <Card key={service.key} className={`rounded-xl border-border/60 ${config[`${service.key}_enabled`] ? 'ring-2 ring-primary/30' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${service.bg} flex items-center justify-center`}>
                  <span className={`text-xs font-bold ${service.color}`}>{service.label[0]}</span>
                </div>
                <div>
                  <p className="font-semibold">{service.label}</p>
                  <p className="text-xs font-normal text-muted-foreground">{service.description}</p>
                </div>
              </CardTitle>
              <button
                onClick={() => handleToggle(service.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config[`${service.key}_enabled`] ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${config[`${service.key}_enabled`] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {service.fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                {field.secret ? (
                  <SecretInput
                    id={field.key}
                    value={config[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={config[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="rounded-xl font-mono text-xs"
                  />
                )}
              </div>
            ))}
            {config[`${service.key}_enabled`] && config[`${service.key}_client_id`] && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-1">
                <Check className="w-3.5 h-3.5" /> Configurado e ativo
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full gold-gradient text-white rounded-xl h-11 text-sm font-semibold shadow-md"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
        Salvar Configurações
      </Button>
    </div>
  );
}