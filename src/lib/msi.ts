export type MsiSource = "policy" | "global";

type MsiConfigInput = {
    msi_active?: boolean | null;
    msi_promo_active?: boolean | null;
    msi_options?: unknown;
    msi_start_date?: string | null;
    msi_end_date?: string | null;
};

type EffectiveMsiInput = {
    settings: MsiConfigInput | null | undefined;
    policy: MsiConfigInput | null | undefined;
    paymentLimit: string | null | undefined;
};

export type EffectiveMsi = {
    applies: boolean;
    source: MsiSource | null;
    options: string[];
    formattedOptions: string;
    promoDateToShow: string;
};

export const MSI_OPTIONS = ["3", "6", "9", "12"];

export function normalizeMsiOptions(options: unknown): string[] {
    const rawOptions = Array.isArray(options)
        ? options
        : typeof options === "string"
            ? options.split(",")
            : [];

    return rawOptions
        .map((option) => String(option).trim())
        .filter((option) => MSI_OPTIONS.includes(option));
}

export function formatMsiOptions(options: string[]) {
    if (options.length === 0) return "";
    if (options.length === 1) return options[0];
    return `${options.slice(0, -1).join(", ")} y ${options[options.length - 1]}`;
}

export function normalizeDateValue(dateValue: string | Date | null | undefined) {
    if (!dateValue) return "";
    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
        return dateValue.toISOString().slice(0, 10);
    }

    const rawValue = String(dateValue).trim();
    const isoDateMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) return isoDateMatch[1];

    const parsedDate = new Date(rawValue);
    if (Number.isNaN(parsedDate.getTime())) return "";
    return parsedDate.toISOString().slice(0, 10);
}

function getLocalNoonDate(dateValue: string | Date | null | undefined) {
    const normalizedDate = normalizeDateValue(dateValue);
    if (!normalizedDate) return null;
    const date = new Date(`${normalizedDate}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatLocalDate(dateStr: string | null | undefined) {
    const date = getLocalNoonDate(dateStr);
    if (!date) return "";
    return date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

function getMexicoDateNoTime() {
    const mexicoDate = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Mexico_City" }));
    mexicoDate.setHours(0, 0, 0, 0);
    return mexicoDate;
}

function getDateNoTime(dateStr: string) {
    const normalizedDate = normalizeDateValue(dateStr);
    const date = new Date(`${normalizedDate}T00:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
}

function getPaymentLimitMinus10(paymentLimit: string | null | undefined) {
    const date = getLocalNoonDate(paymentLimit);
    if (!date) return null;
    date.setDate(date.getDate() - 10);
    return date;
}

function resolveCandidate(config: MsiConfigInput, source: MsiSource, paymentLimit: string | null | undefined): EffectiveMsi {
    const emptyResult: EffectiveMsi = {
        applies: false,
        source: null,
        options: [],
        formattedOptions: "",
        promoDateToShow: paymentLimit ? formatLocalDate(paymentLimit) : "",
    };

    const options = normalizeMsiOptions(config.msi_options);
    if (options.length === 0 || !config.msi_start_date || !config.msi_end_date) {
        return emptyResult;
    }

    const paymentLimitMinus10 = getPaymentLimitMinus10(paymentLimit);
    if (!paymentLimitMinus10) return emptyResult;

    const nowNoTime = getMexicoDateNoTime();
    const promoStartNoTime = getDateNoTime(config.msi_start_date);
    const promoEndNoTime = getDateNoTime(config.msi_end_date);
    if (!promoStartNoTime || !promoEndNoTime) return emptyResult;

    const paymentLimitMinus10NoTime = new Date(paymentLimitMinus10);
    paymentLimitMinus10NoTime.setHours(0, 0, 0, 0);

    if (nowNoTime < promoStartNoTime || nowNoTime > promoEndNoTime) {
        return emptyResult;
    }

    let promoDateToShow = "";
    if (promoEndNoTime <= paymentLimitMinus10NoTime) {
        promoDateToShow = formatLocalDate(config.msi_end_date);
    } else if (nowNoTime <= paymentLimitMinus10NoTime) {
        promoDateToShow = paymentLimitMinus10.toLocaleDateString("es-MX", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    } else {
        return emptyResult;
    }

    return {
        applies: true,
        source,
        options,
        formattedOptions: formatMsiOptions(options),
        promoDateToShow,
    };
}

export function resolveEffectiveMsi({ settings, policy, paymentLimit }: EffectiveMsiInput): EffectiveMsi {
    if (policy?.msi_promo_active === true) {
        return resolveCandidate(policy, "policy", paymentLimit);
    }

    if (settings?.msi_active === true) {
        return resolveCandidate(settings, "global", paymentLimit);
    }

    return {
        applies: false,
        source: null,
        options: [],
        formattedOptions: "",
        promoDateToShow: paymentLimit ? formatLocalDate(paymentLimit) : "",
    };
}
