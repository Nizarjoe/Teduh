export const zones = ["jabodetabek", "jawa", "sumatera", "kalimantan", "bali_nusa", "sulawesi", "timur"] as const;
export type Zone = (typeof zones)[number];

export type ShipRate = {
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  cost: number;
  etd: string;
};

const extra: Record<Zone, number> = {
  jabodetabek: 0,
  jawa: 6_000,
  bali_nusa: 14_000,
  sumatera: 16_000,
  kalimantan: 20_000,
  sulawesi: 22_000,
  timur: 32_000,
};

type Service = {
  courierCode: string;
  courierName: string;
  serviceCode: string;
  serviceName: string;
  base: number;
  perKg: number;
  zones: Zone[] | "all";
  etd: Record<Zone, string>;
};

function etd(near: string, mid: string, far: string): Record<Zone, string> {
  return {
    jabodetabek: near,
    jawa: mid,
    bali_nusa: far,
    sumatera: far,
    kalimantan: far,
    sulawesi: far,
    timur: far,
  };
}

const services: Service[] = [
  {
    courierCode: "jne",
    courierName: "JNE",
    serviceCode: "REG",
    serviceName: "Reguler",
    base: 10_000,
    perKg: 7_000,
    zones: "all",
    etd: etd("1–2 hari", "2–4 hari", "3–7 hari"),
  },
  {
    courierCode: "jne",
    courierName: "JNE",
    serviceCode: "YES",
    serviceName: "Yakin Esok Sampai",
    base: 22_000,
    perKg: 10_000,
    zones: ["jabodetabek", "jawa"],
    etd: etd("1 hari", "1–2 hari", "2–4 hari"),
  },
  {
    courierCode: "sicepat",
    courierName: "SiCepat",
    serviceCode: "REG",
    serviceName: "Reguler",
    base: 9_000,
    perKg: 6_500,
    zones: "all",
    etd: etd("1–2 hari", "2–4 hari", "3–6 hari"),
  },
  {
    courierCode: "jnt",
    courierName: "J&T",
    serviceCode: "EZ",
    serviceName: "EZ",
    base: 9_500,
    perKg: 6_500,
    zones: "all",
    etd: etd("1–2 hari", "2–4 hari", "3–7 hari"),
  },
  {
    courierCode: "anteraja",
    courierName: "AnterAja",
    serviceCode: "REG",
    serviceName: "Reguler",
    base: 9_000,
    perKg: 6_000,
    zones: "all",
    etd: etd("1–3 hari", "2–4 hari", "4–8 hari"),
  },
];

function round500(value: number): number {
  return Math.max(500, Math.round(value / 500) * 500);
}

export function quoteLocal(input: { zone: Zone; weightGrams: number }): ShipRate[] {
  const kg = Math.max(1, Math.ceil(input.weightGrams / 1000));
  const zoneExtra = extra[input.zone];
  return services
    .filter((service) => service.zones === "all" || service.zones.includes(input.zone))
    .map((service) => ({
      courierCode: service.courierCode,
      courierName: service.courierName,
      serviceCode: service.serviceCode,
      serviceName: service.serviceName,
      cost: round500(service.base + zoneExtra + (kg - 1) * service.perKg),
      etd: service.etd[input.zone],
    }));
}

export function isZone(value: string): value is Zone {
  return (zones as readonly string[]).includes(value);
}
