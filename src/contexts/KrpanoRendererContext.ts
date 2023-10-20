import React from "react";
import { KrpanoActionProxy } from "../models";

export const KrpanoRendererContext =
  React.createContext<KrpanoActionProxy | null>(null);
