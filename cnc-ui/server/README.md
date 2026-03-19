Set the ADS bridge environment before starting `npm run ads-bridge`.

Required values:
- `ADS_AMS_NET_ID`: target PLC AMS Net ID, for example `5.32.233.1.1.1`
- `ADS_TARGET_IP`: target PLC IP address or local router address

Optional values:
- `ADS_PORT`: TwinCAT runtime ADS port, defaults to `851`
- `ADS_BRIDGE_PORT`: local HTTP/WebSocket port, defaults to `3001`
- `ADS_POLL_MS`: polling interval in milliseconds, defaults to `200`
- `ADS_SYMBOL_HMI_IN`: defaults to `GVL.stHMI_In`
- `ADS_SYMBOL_HMI_OUT`: defaults to `GVL.stHMI_Out`

Run order:
1. Start the ADS bridge with `npm run ads-bridge`
2. Start the UI with `npm run dev`

Notes:
- `ProgramCall` is mapped to your numeric `E_Programs` values: `eNull=0`, `eHomeAll=1`, `eHomeY=2`, `eHomeX=3`, `eHomeZ=4`.
- `eJogMode` is currently written using the TwinCAT symbolic enum constants you provided: `MC_JOGMODE_STANDARD_SLOW`, `MC_JOGMODE_STANDARD_FAST`, `MC_JOGMODE_CONTINOUS`, `MC_JOGMODE_INCHING`, `MC_JOGMODE_INCHING_MODULO`.
- If your PLC exposes `eJogMode` as a numeric enum over ADS instead of accepting symbolic writes, replace the symbolic mapping in `src/types/plc.ts` with the numeric values from your PLC library.
- The current bridge writes subfields of `GVL.stHMI_In` individually to avoid overwriting the whole struct on every UI action.
