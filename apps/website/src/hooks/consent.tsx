import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
  useMemo,
} from "react";

const defaultConsent = {
  twitch: false,
  youtube: false,
} as const;

type ConsentKeys = keyof typeof defaultConsent;

export type Consent = Readonly<{
  [K in ConsentKeys]: boolean;
}>;

const parseConsent = (
  obj: Record<string, unknown>,
  existing?: Consent
): Consent =>
  Object.freeze(
    (Object.keys(existing || defaultConsent) as ConsentKeys[]).reduce(
      (acc, key) => ({
        ...acc,
        [key]:
          typeof obj[key] === "boolean"
            ? obj[key]
            : (existing || defaultConsent)[key],
      }),
      {}
    )
  ) as Consent;

export type ConsentContext = Readonly<{
  consent: Consent;
  updateConsent: (consent: Partial<Consent>) => void;
}>;

declare global {
  interface Window {
    consent: ConsentContext | undefined;
  }
}

const Context = createContext<ConsentContext | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [consent, setConsent] = useState<Consent>(
    Object.freeze(defaultConsent)
  );

  useEffect(() => {
    const consent = localStorage.getItem("consent");
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        setConsent(
          parseConsent(
            typeof parsed === "object" && parsed !== null ? parsed : {}
          )
        );
      } catch {
        // Ignore
      }
    }
  }, []);

  const updateConsent = useCallback((consent: Partial<Consent>) => {
    setConsent((prev: Consent) => {
      const next = parseConsent(consent, prev);
      localStorage.setItem("consent", JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<ConsentContext>(
    () => Object.freeze({ consent, updateConsent }),
    [consent, updateConsent]
  );

  useEffect(() => {
    window.consent = value;
    return () => {
      window.consent = undefined;
    };
  }, [value]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useConsent = () => {
  const context = useContext(Context);
  if (context === undefined)
    throw new Error("useConsent must be used within a ConsentProvider");
  return context;
};
