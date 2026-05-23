import { createContext } from "react";

type ScanningContextValue = {
    audit: any
};

const ScanningContext = createContext<ScanningContextValue | undefined>(undefined);
