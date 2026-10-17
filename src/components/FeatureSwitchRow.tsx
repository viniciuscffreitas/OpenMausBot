import { useState, type ReactNode } from "react";
import { api, useStore, type ConfigStatus } from "@/state/store";
import { SettingRow, Switch } from "./SettingsPrimitives";

export function FeatureSwitchRow({ feature, enabled, title, subtitle, ariaLabel, errorText }: {
  feature: string;
  enabled: boolean;
  title: string;
  subtitle: ReactNode;
  ariaLabel: string;
  errorText: string;
}) {
  const { dispatch } = useStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const config: ConfigStatus = await api("/api/config", {
        method: "PATCH",
        body: JSON.stringify({ features: { [feature]: !enabled } }),
      });
      dispatch({ type: "configStatus", config });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : errorText);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingRow title={title} subtitle={subtitle} message={error ? <p role="alert" className="text-danger">{error}</p> : null}>
      <Switch
        checked={enabled}
        aria-label={ariaLabel}
        disabled={saving}
        onClick={() => void toggle()}
        className="disabled:cursor-wait disabled:opacity-50"
      />
    </SettingRow>
  );
}
